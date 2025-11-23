import React, { createContext, useContext, ReactNode } from 'react';
import { useExchangeRate } from '../hooks/useExchangeRate';

interface ExchangeRateContext {
    blue: number;
    oficial: number;
    loading: boolean;
    error: string | null;
    convertUSDToARS: (amount: number, includeTax?: boolean) => number;
    lastUpdate: Date;
    forceUpdate: () => Promise<void>;
}

interface AppContextType {
    exchangeRate: ExchangeRateContext;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const {
    rates,
    loading,
    error,
    convertUSDToARS,
    forceUpdate
    } = useExchangeRate('blue');

    const value: AppContextType = {
        exchangeRate: {
        blue: rates.blue,
        oficial: rates.oficial,
        loading,
        error,
        convertUSDToARS,
        lastUpdate: rates.lastUpdate,
        forceUpdate
        }
    };

    return (
        <AppContext.Provider value={value}>
        {children}
        </AppContext.Provider>
    );
    };

    export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp debe ser usado dentro de un AppProvider');
    }
    return context;
};