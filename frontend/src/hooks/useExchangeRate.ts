import { useState, useEffect } from 'react';
import ExchangeRateService, { ExchangeRates } from '../services/exchangeRateService';

export const useExchangeRate = (type: 'blue' | 'oficial' = 'blue') => {
    const [rates, setRates] = useState<ExchangeRates>({
        blue: 1450,
        oficial: 917,
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

        // Actualizar cada 30 minutos
        const interval = setInterval(loadRates, 30 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [type]);

    // CORREGIDO: Solo dos parámetros
    const convertUSDToARS = (amountUSD: number, includeTax: boolean = true): number => {
        return ExchangeRateService.convertUSDToARS(amountUSD, type, includeTax);
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