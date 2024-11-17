import React, { ReactElement } from 'react';
import { UnitsIcon } from '@/renderer/components/icons/UnitsIcon';

export function formatCurrency(amount: number, currencyFormat: string): string | ReactElement {
  const formattedAmount = amount.toFixed(2);
  switch (currencyFormat) {
    case 'EUR':
      return `€${formattedAmount}`;
    case 'GBP':
      return `£${formattedAmount}`;
    case 'NMS':
      return (
        <span className="inline-flex items-center gap-1">
          <UnitsIcon className="h-4 w-4" />
          {formattedAmount}
        </span>
      );
    case 'USD':
    default:
      return `$${formattedAmount}`;
  }
}
