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
