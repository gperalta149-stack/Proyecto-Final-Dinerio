let cachedTarjeta: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 15 * 60 * 1000;

export const getExchangeRate = async (): Promise<number> => {
  const now = Date.now();
  if (cachedTarjeta !== null && now - lastFetch < CACHE_TTL) {
    return cachedTarjeta;
  }
  try {
    let oficialVenta = 0;

    try {
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
      if (res.ok) {
        const data = await res.json() as { oficial: { value_sell: number } };
        oficialVenta = Math.round(data.oficial.value_sell);
      }
    } catch {
      console.warn('Bluelytics falló, intentando DolarAPI...');
    }

    if (!oficialVenta) {
      const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json() as { venta: number };
        oficialVenta = data.venta;
      }
    }

    if (!oficialVenta) {
      oficialVenta = 1450;
    }

    cachedTarjeta = Number((oficialVenta * 1.53).toFixed(2));
    lastFetch = now;
    return cachedTarjeta;
  } catch {
    cachedTarjeta ??= 2218.5;
    return cachedTarjeta;
  }
};