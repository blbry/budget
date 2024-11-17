import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { formatCurrency } from '@/renderer/utils/currency';

type CurrencyContextType = {
  currencyFormat: string;
  setCurrencyFormat: (format: string) => void;
  formatAmount: (amount: number) => string | React.ReactElement;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currencyFormat: 'USD',
  setCurrencyFormat: () => {},
  formatAmount: () => '',
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyFormat, setCurrencyFormat] = useState('USD');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.settings.getAll();
      setCurrencyFormat(settings.currencyFormat || 'USD');
    };

    // Initial load
    loadSettings();

    // Set up event listener for settings changes
    const handleSettingsChange = (_event: any, key: string, value: string) => {
      if (key === 'currencyFormat') {
        setCurrencyFormat(value);
      }
    };

    window.electron.settings.onUpdate(handleSettingsChange);

    return () => {
      window.electron.settings.removeUpdateListener(handleSettingsChange);
    };
  }, []);

  const value = useMemo(() => ({
    currencyFormat,
    setCurrencyFormat,
    formatAmount: (amount: number) => formatCurrency(amount, currencyFormat),
  }), [currencyFormat]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
