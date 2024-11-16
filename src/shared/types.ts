export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  type: 'expense' | 'income' | 'asset';
  is_default: boolean;
}

export interface Reward {
  id?: number;
  payment_method_id: number;
  type: 'points' | 'cashback' | 'credit';
  amount: number;
  category_id: number;
  frequency?: 'monthly' | 'annual' | 'semiannual';
}

export interface PaymentMethod {
  id: number;
  type: 'cash' | 'credit' | 'crypto';
  name: string;
  statementDate?: number;
  paymentAccount?: string;
  annualFee?: number;
  tickerSymbol?: string;
  walletAddress?: string;
  rewards?: Reward[];
}

export interface PaymentMethodFormData {
  type: 'credit' | 'crypto';
  name: string;
  statementDate?: number | null;
  paymentAccount?: string;
  annualFee?: number | null;
  tickerSymbol?: string;
  walletAddress?: string;
  rewards?: Reward[];
}
