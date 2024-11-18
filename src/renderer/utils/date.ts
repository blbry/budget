import { format } from 'date-fns';

type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

const formatMap: Record<DateFormat, string> = {
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd'
};

export function formatDate(date: string | Date, dateFormat: string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatMap[dateFormat as DateFormat] || formatMap['MM/DD/YYYY']);
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM, yyyy');
}
