import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { formatDate, formatMonthYear } from '@/renderer/utils/date';

type DateContextType = {
  dateFormat: string;
  setDateFormat: (format: string) => void;
  formatDate: (date: string | Date) => string;
  formatMonthYear: (date: Date) => string;
};

const DateContext = createContext<DateContextType>({
  dateFormat: 'MM/DD/YYYY',
  setDateFormat: () => {},
  formatDate: () => '',
  formatMonthYear: () => '',
});

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await window.electron.settings.getAll();
      setDateFormat(settings.dateFormat || 'MM/DD/YYYY');
    };

    loadSettings();

    const handleSettingsChange = (_event: any, key: string, value: string) => {
      if (key === 'dateFormat') {
        setDateFormat(value);
      }
    };

    window.electron.settings.onUpdate(handleSettingsChange);

    return () => {
      window.electron.settings.removeUpdateListener(handleSettingsChange);
    };
  }, []);

  const value = useMemo(() => ({
    dateFormat,
    setDateFormat,
    formatDate: (date: string | Date) => formatDate(date, dateFormat),
    formatMonthYear: (date: Date) => formatMonthYear(date),
  }), [dateFormat]);

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
}

export const useDate = () => useContext(DateContext);
