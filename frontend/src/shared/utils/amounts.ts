import ExchangeRateService from '../services/exchangeRateService';
import { parseAmount } from './formatters';

/**
 * Convert a numeric amount and currency to ARS using the app's exchange rate logic.
 * Returns a number rounded to 2 decimals.
 */
export function toARS(amount: number | string | undefined, currency?: string): number {
  const raw = typeof amount === 'string' ? parseAmount(amount) : (amount || 0);
  if (!currency || currency.toUpperCase() === 'ARS') return Math.round(raw * 100) / 100;
  if (currency.toUpperCase() === 'USD') {
    return ExchangeRateService.convertUSDToARS(raw, 'tarjeta');
  }
  // Fallback: assume ARS
  return Math.round(raw * 100) / 100;
}

/**
 * Given an object that may carry arsAmount, originalCurrency/originalAmount or amount/currency,
 * return the canonical ARS value to use for aggregations.
 */
export function amountToARS(item: any): number {
  if (!item) return 0;
  if (typeof item.arsAmount === 'number') return Math.round(item.arsAmount * 100) / 100;
  // Some items store originalAmount/originalCurrency
  if (typeof item.originalAmount === 'number' && item.originalCurrency) {
    return toARS(item.originalAmount, item.originalCurrency);
  }
  // Fallback to amount + currency pair
  return toARS(item.amount, item.currency || item.originalCurrency);
}

/**
 * Try to heuristically find a subscription that corresponds to a debt when
 * the debt doesn't include subscription_id. Returns the matched subscription or undefined.
 *
 * Heuristics used:
 * - Normalize and compare names (substring match) and
 * - Compare amounts after conversion to ARS (absolute diff <= tolerance)
 * - Prefer matches where the subscription next_billing_date is in the same month as the debt paid_at
 */
export function matchSubscriptionForDebt(debt: any, subscriptions: any[], options?: { toleranceARS?: number, daysWindow?: number }): any | undefined {
  if (!debt || !subscriptions || subscriptions.length === 0) return undefined;
  const tolerance = options?.toleranceARS ?? 1.0; // 1 ARS tolerance by default
  const daysWindow = options?.daysWindow ?? 7; // +/- days window for date proximity

  const debtAmount = amountToARS(debt);
  const debtName = (debt.name || debt.description || "").toString().toLowerCase().replace(/[^a-z0-9]/g, '');
  const paidAt = debt.paid_at ? new Date(debt.paid_at) : null;

  // First pass: direct name + amount + date proximity
  for (const sub of subscriptions) {
    try {
      const subAmount = amountToARS(sub);
      const subName = (sub.name || sub.description || "").toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameMatches = subName && debtName && (subName.includes(debtName) || debtName.includes(subName));
      const amountDiff = Math.abs(subAmount - debtAmount);

      let dateClose = true;
      if (paidAt && sub.next_billing_date) {
        const nextBill = new Date(sub.next_billing_date);
        const diffDays = Math.abs(Math.floor((paidAt.getTime() - nextBill.getTime()) / (1000 * 60 * 60 * 24)));
        dateClose = diffDays <= daysWindow;
      }

      if (amountDiff <= tolerance && (nameMatches || !debtName || !subName) && dateClose) {
        return sub;
      }
    } catch (e) {
      // ignore parsing errors per-item
      continue;
    }
  }

  // Second pass: amount-only match (fallback)
  for (const sub of subscriptions) {
    try {
      const subAmount = amountToARS(sub);
      const amountDiff = Math.abs(subAmount - debtAmount);
      if (amountDiff <= tolerance) return sub;
    } catch (e) {
      continue;
    }
  }

  return undefined;
}
