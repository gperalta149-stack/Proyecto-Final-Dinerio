import { useState, useEffect } from 'react';
import ExchangeRateService, { ExchangeRates } from '../services/exchangeRateService';

export const useExchangeRate = (type: 'oficial' | 'tarjeta' = 'oficial') => {
  const [rates, setRates] = useState<ExchangeRates>({
    oficial: 1470,
    oficialCompra: 1440,
    oficialVenta: 1470,
    oficialTrend: 'same',
    tarjeta: 1911,
    tarjetaCompra: 1811,
    tarjetaVenta: 1911,
    tarjetaTrend: 'same',
    lastUpdate: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentRates = await ExchangeRateService.getRates(type);
      setRates(currentRates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando tipo de cambio');
      console.error('Error en useExchangeRate:', err);
    } finally {
      setLoading(false);
    }
  };

  const forceUpdate = async (): Promise<void> => {
    setLoading(true);
    try {
      const updatedRates = await ExchangeRateService.forceUpdate();
      setRates(updatedRates);
    } catch (err) {
      setError('Error forzando actualización');
      console.error('Error en forceUpdate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [type]);

  const convertUSDToARS = (amountUSD: number): number => {
    return ExchangeRateService.convertUSDToARS(amountUSD, type);
  };

  return {
    rates,
    loading,
    error,
    convertUSDToARS,
    currentRate: rates[type],
    forceUpdate,
    lastUpdate: rates.lastUpdate
  };
};