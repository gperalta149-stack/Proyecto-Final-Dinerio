// frontend/src/shared/services/exchangeRateService.ts
export type RateTrend = 'up' | 'down' | 'same';

export interface ExchangeRates {
  blue: number;
  blueCompra: number;
  blueVenta: number;
  oficial: number;
  oficialCompra: number;
  oficialVenta: number;
  oficialTrend: RateTrend;
  tarjeta: number;
  tarjetaCompra: number;
  tarjetaVenta: number;
  tarjetaTrend: RateTrend;
  lastUpdate: Date;
}

class ExchangeRateService {

  private static currentRates: ExchangeRates = {
    blue: 1513,
    blueCompra: 1480,
    blueVenta: 1513,
    oficial: 1470,
    oficialCompra: 1440,
    oficialVenta: 1470,
    oficialTrend: 'same',
    tarjeta: 1911,
    tarjetaCompra: 1811,
    tarjetaVenta: 1911,
    tarjetaTrend: 'same',
    lastUpdate: new Date(0)
  };

  private static hasFetchedOnce = false;

  private static readonly STORAGE_KEY = 'exchangeRates';

  private static readonly UPDATE_INTERVAL = 15 * 60 * 1000;

  private static computeTrend(current: number, previous: number): RateTrend {
    if (!this.hasFetchedOnce || !previous || current === previous) return 'same';
    return current > previous ? 'up' : 'down';
  }

  static async updateRates(): Promise<ExchangeRates> {
    try {
      let blueCompra = 0;
      let blueVenta = 0;
      let oficialCompra = 0;
      let oficialVenta = 0;
      let tarjetaCompra = 0;
      let tarjetaVenta = 0;

      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
        if (response.ok) {
          const data = await response.json();
          blueCompra = Math.round(data.blue.value_buy);
          blueVenta = Math.round(data.blue.value_sell);
          oficialCompra = Math.round(data.oficial.value_buy);
          oficialVenta = Math.round(data.oficial.value_sell);
        }
      } catch (error) {
        console.warn('Bluelytics falló, intentando DolarAPI...');
      }

      if (!blueVenta || !oficialVenta) {
        const [blueResponse, oficialResponse] = await Promise.all([
          fetch('https://dolarapi.com/v1/dolares/blue'),
          fetch('https://dolarapi.com/v1/dolares/oficial')
        ]);

        if (blueResponse.ok && oficialResponse.ok) {
          const blueData = await blueResponse.json();
          const oficialData = await oficialResponse.json();
          blueCompra = blueData.compra;
          blueVenta = blueData.venta;
          oficialCompra = oficialData.compra;
          oficialVenta = oficialData.venta;
        }
      }

      try {
        const tarjetaResponse = await fetch('https://dolarapi.com/v1/dolares/tarjeta');
        if (tarjetaResponse.ok) {
          const tarjetaData = await tarjetaResponse.json();
          tarjetaCompra = tarjetaData.compra;
          tarjetaVenta = tarjetaData.venta;
        }
      } catch (error) {
        console.warn('No se pudo obtener el dólar tarjeta');
      }

      if (!blueVenta || !oficialVenta) {
        blueCompra = blueCompra || 1480;
        blueVenta = blueVenta || 1513;
        oficialCompra = oficialCompra || 1440;
        oficialVenta = oficialVenta || 1470;
      }

      if (!tarjetaVenta) {
        tarjetaCompra = tarjetaCompra || 1811;
        tarjetaVenta = tarjetaVenta || 1911;
      }

      const previousOficialVenta = this.currentRates.oficialVenta;
      const previousTarjetaVenta = this.currentRates.tarjetaVenta;

      this.currentRates = {
        blue: blueVenta,
        blueCompra: blueCompra,
        blueVenta: blueVenta,
        oficial: oficialVenta,
        oficialCompra: oficialCompra,
        oficialVenta: oficialVenta,
        oficialTrend: this.computeTrend(oficialVenta, previousOficialVenta),
        tarjeta: tarjetaVenta,
        tarjetaCompra: tarjetaCompra,
        tarjetaVenta: tarjetaVenta,
        tarjetaTrend: this.computeTrend(tarjetaVenta, previousTarjetaVenta),
        lastUpdate: new Date()
      };

      this.hasFetchedOnce = true;
      this.saveToStorage();
      return this.currentRates;
    } catch (error) {
      console.warn('Error actualizando tipo de cambio, usando valores cacheados:', error);
      this.loadFromStorage();
      return this.currentRates;
    }
  }

  static async getRates(_type: 'blue' | 'oficial' = 'blue'): Promise<ExchangeRates> {
    const shouldUpdate = this.shouldUpdate();

    if (shouldUpdate) {
      try {
        await this.updateRates();
      } catch (error) {
        console.warn('No se pudo actualizar, usando cache');
      }
    } else {
      this.loadFromStorage();
    }

    return this.currentRates;
  }

  static async getRate(type: 'blue' | 'oficial' = 'blue'): Promise<number> {
    const rates = await this.getRates(type);
    return rates[type];
  }

  static convertUSDToARS(amountUSD: number, type: 'blue' | 'oficial' = 'blue', includeTax: boolean = true): number {
    const rate = this.currentRates[type];
    
    // Blue market rate - no taxes applied (used for custom pricing)
    if (type === 'blue') {
      return Math.round(amountUSD * rate);
    }
    
    // Official rate - applies 30% impact tax
    if (includeTax && type === 'oficial') {
      return Math.round(amountUSD * rate * 1.30);
    }
    
    // Default case: no taxes
    return Math.round(amountUSD * rate);
  }

  private static shouldUpdate(): boolean {
    const lastUpdate = this.currentRates.lastUpdate;
    const timeSinceUpdate = new Date().getTime() - lastUpdate.getTime();
    return timeSinceUpdate > this.UPDATE_INTERVAL;
  }

  private static saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentRates));
  }

  private static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentRates = {
          ...this.currentRates,
          ...parsed,
          lastUpdate: new Date(parsed.lastUpdate)
        };
        this.hasFetchedOnce = true;
      }
    } catch (error) {
      console.warn('Error cargando tasas de cambio del localStorage:', error);
    }
  }

  static async forceUpdate(): Promise<ExchangeRates> {
    return await this.updateRates();
  }

  static initialize() {
    this.loadFromStorage();

    const isDataOld = this.shouldUpdate();
    if (isDataOld) {
      this.updateRates().catch(console.error);
    }

    setInterval(() => {
      this.updateRates().catch(console.error);
    }, this.UPDATE_INTERVAL);
  }
}

ExchangeRateService.initialize();

export default ExchangeRateService;