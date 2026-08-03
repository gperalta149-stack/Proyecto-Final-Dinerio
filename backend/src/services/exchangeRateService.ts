// Cache en memoria del tipo de cambio: guardamos la última tasa (tarjeta)
// y el instante en que se obtuvo. TTL de 15 min para no golpear a la API externa en cada
// cálculo y, a la vez, no quedar con un valor demasiado viejo.
let cachedTarjeta: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 15 * 60 * 1000;

// getExchangeRate devuelve la tasa de dólar tarjeta (con impuestos).
// Si hay cache fresco lo reusa; si no, la busca en fuentes externas.
export const getExchangeRate = async (): Promise<number> => {
  const now = Date.now();
  // Válida el cache: solo se reutiliza si no pasó el TTL de 15 minutos.
  if (cachedTarjeta !== null && now - lastFetch < CACHE_TTL) {
    return cachedTarjeta;
  }
  try {
    let oficialVenta = 0;

    // Fuente primaria: Bluelytics (API argentina de dólar blue y oficial).
    try {
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
      if (res.ok) {
        const data = await res.json() as { oficial: { value_sell: number } };
        oficialVenta = Math.round(data.oficial.value_sell);
      }
    } catch {
      console.warn('Bluelytics falló, intentando DolarAPI...');
    }

    // Fallback: si Bluelytics no respondió, usamos DolarAPI como respaldo.
    if (!oficialVenta) {
      const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json() as { venta: number };
        oficialVenta = data.venta;
      }
    }

    // Último recurso: si ambas APIs fallan, usamos un valor por defecto
    // (1.xxx) para que el sistema no se caiga y siga funcionando offline.
    if (!oficialVenta) {
      oficialVenta = 1450;
    }

    // Se aplica el factor tarjeta (1.53) sobre la cotización oficial de venta
    // para obtener el "dólar tarjeta", y se guarda en cache junto con la hora.
    cachedTarjeta = Number((oficialVenta * 1.53).toFixed(2));
    lastFetch = now;
    return cachedTarjeta;
  } catch {
    // Red de seguridad: si todo falla, se reutiliza el cache disponible o un valor fijo.
    cachedTarjeta ??= 2218.5;
    return cachedTarjeta;
  }
};