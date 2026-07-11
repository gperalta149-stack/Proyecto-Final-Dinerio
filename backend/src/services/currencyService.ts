// Servicio para conversión de divisas y cálculos financieros

export interface CurrencyConversionConfig {
  exchangeRate: number;  // Tipo de cambio USD a ARS
  taxRate: number;      // Impuesto para compras en USD (ej: 0.75 para 75%)
}

export class CurrencyService {
  private static config: CurrencyConversionConfig = {
    exchangeRate: 1450,  // Valor por defecto, debería venir de API o config
    taxRate: 0.75        // 75% de impuestos para USD
  };

  static setConfig(config: Partial<CurrencyConversionConfig>) {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): CurrencyConversionConfig {
    return { ...this.config };
  }

  // Convertir monto de un ciclo de facturación a mensual
  static convertToMonthly(amount: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'weekly':
        return amount * 4.33; // ~4.33 semanas por mes
      case 'yearly':
        return amount / 12;
      case 'quarterly':
        return amount / 3;
      case 'monthly':
      default:
        return amount;
    }
  }

  // Convertir monto de un ciclo de facturación a anual
  static convertToYearly(amount: number, billingCycle: string): number {
    switch (billingCycle) {
      case 'weekly':
        return amount * 52;
      case 'monthly':
        return amount * 12;
      case 'quarterly':
        return amount * 4;
      case 'yearly':
      default:
        return amount;
    }
  }

  // Convertir USD a ARS con impuestos
  static convertUSDToARS(amount: number): number {
    const usdWithTax = amount * (1 + this.config.taxRate);
    return usdWithTax * this.config.exchangeRate;
  }

  // Convertir cualquier monto a ARS (considerando moneda original)
  static convertToARS(amount: number, currency: string): number {
    if (currency === 'USD') {
      return this.convertUSDToARS(amount);
    }
    return amount; // Ya está en ARS u otra moneda local
  }

  // Calcular monto mensual en ARS desde cualquier moneda y ciclo
  static calculateMonthlyInARS(amount: number, currency: string, billingCycle: string): number {
    const monthlyAmount = this.convertToMonthly(amount, billingCycle);
    return this.convertToARS(monthlyAmount, currency);
  }

  // Calcular monto anual en ARS desde cualquier moneda y ciclo
  static calculateYearlyInARS(amount: number, currency: string, billingCycle: string): number {
    const yearlyAmount = this.convertToYearly(amount, billingCycle);
    return this.convertToARS(yearlyAmount, currency);
  }
}
