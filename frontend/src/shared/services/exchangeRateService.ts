// frontend/src/shared/services/exchangeRateService.ts
export type RateTrend = 'up' | 'down' | 'same';

export interface ExchangeRates {
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

// Servicio Singleton para obtener el tipo de cambio en el frontend.
// Usa métodos estáticos y mantiene las cotizaciones en memoria + localStorage,
// con refresco periódico (15 min) y cálculo del dolar tarjeta por fórmula.
class ExchangeRateService {

  // Valores por defecto en memoria: se usan hasta la primera
  //   actualización real y sirven de "fallback" ante fallas de red.
  private static currentRates: ExchangeRates = {
    oficial: 1450,
    oficialCompra: 1420,
    oficialVenta: 1450,
    oficialTrend: 'same',
    tarjeta: 2218.5,
    tarjetaCompra: 2218.5,
    tarjetaVenta: 2218.5,
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

  // updateRates: intenta fuentes externas (Bluelytics, luego DolarAPI)
//   con fallback a valores fijos si ambas fallan. La tendencia (up/down/same)
//   se calcula comparando con la cotización anterior.
  static async updateRates(): Promise<ExchangeRates> {
    try {
      let oficialCompra = 0;
      let oficialVenta = 0;
      let tarjetaCompra = 0;
      let tarjetaVenta = 0;

      // Intento 1: API de Bluelytics. Un try/catch aislado evita
      //   que un fallo de esta API rompa todo el flujo.
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
        if (response.ok) {
          const data = await response.json();
          oficialCompra = Math.round(data.oficial.value_buy);
          oficialVenta = Math.round(data.oficial.value_sell);
        }
      } catch {
        console.warn('Bluelytics falló, intentando DolarAPI...');
      }

      // Intento 2: si Bluelytics no dio valor, cae a DolarAPI.
      if (!oficialVenta) {
        const oficialResponse = await fetch('https://dolarapi.com/v1/dolares/oficial');

        if (oficialResponse.ok) {
          const oficialData = await oficialResponse.json();
          oficialCompra = oficialData.compra;
          oficialVenta = oficialData.venta;
        }
      }

      // Último recurso: valores fijos para que la app siga funcionando
      //   aunque las APIs externas estén caídas.
      if (!oficialVenta) {
        oficialCompra = oficialCompra || 1420;
        oficialVenta = oficialVenta || 1450;
      }

      // tarjeta = oficial + IVA(21%) + PAIS(30%) + IIBB(2%) = oficial * 1.53
      const computedTarjeta = Number((oficialVenta * 1.53).toFixed(2));
      tarjetaVenta = computedTarjeta;
      tarjetaCompra = computedTarjeta;

      const previousOficialVenta = this.currentRates.oficialVenta;
      const previousTarjetaVenta = this.currentRates.tarjetaVenta;

      this.currentRates = {
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

  // getRates: solo actualiza si pasaron 15 min desde la última vez
//   (evita golpear APIs externas a cada rato). Si está fresco, lee la cache.
  static async getRates(_type: 'oficial' | 'tarjeta' = 'oficial'): Promise<ExchangeRates> {
    const shouldUpdate = this.shouldUpdate();

    if (shouldUpdate) {
      try {
        await this.updateRates();
      } catch {
        console.warn('No se pudo actualizar, usando cache');
      }
    } else {
      this.loadFromStorage();
    }

    return this.currentRates;
  }

  static async getRate(type: 'oficial' | 'tarjeta' = 'oficial'): Promise<number> {
    const rates = await this.getRates(type);
    return rates[type];
  }

  // Convierte USD a ARS usando la cotización vigente en memoria
//   (se usa para estimar gastos de suscripciones en dólares).
  static convertUSDToARS(amountUSD: number, type: 'oficial' | 'tarjeta' = 'tarjeta'): number {
    const rate = this.currentRates[type];
    return Math.round(amountUSD * rate * 100) / 100;
  }

  static getTarjetaRate(): number {
    return this.currentRates.tarjeta;
  }

  // Verifica si pasó el intervalo de 15 min desde la última actualización.
  private static shouldUpdate(): boolean {
    const lastUpdate = this.currentRates.lastUpdate;
    const timeSinceUpdate = new Date().getTime() - lastUpdate.getTime();
    return timeSinceUpdate > this.UPDATE_INTERVAL;
  }

  // Persistencia: guarda y lee las cotizaciones en localStorage para
//   que no se pierdan al recargar la página.
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

  // initialize: se ejecuta al cargar el servicio. Lee la cache y,
//   si está vieja, la actualiza; además programa refrescos cada 15 min.
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