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

export interface IncomeDeduction {
  id?: number;
  source_id: number;
  name: string;
  type: 'credit' | 'deduction';
  format: 'percent' | 'amount';
  value: number;
  frequency: 'per_paycheck' | 'monthly' | 'annually';
}

export interface Income {
  id: number;
  name: string;
  type: 'employment' | 'other_recurring' | 'simple';
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly' | 'quarterly' | 'annually' | 'none';
  amount: number;
  pay_date?: number;
  next_payment_date?: string;
  monthly_totals: string;
  deductions?: IncomeDeduction[];
}

export interface MonthlyTotals {
  [year: string]: {
    [month: string]: {
      [category: string]: number;
    };
  };
}

export interface DeductionFormData {
  name: string;
  type: 'credit' | 'deduction';
  format: 'percent' | 'amount';
  value: number;
  frequency: 'per_paycheck' | 'monthly' | 'annually';
}

export interface IncomeFormData {
  name: string;
  type: 'employment' | 'other_recurring' | 'simple';
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'semimonthly' | 'quarterly' | 'annually' | 'none';
  amount?: number;
  pay_date?: string;
  next_payment_date?: string;
  deductions?: DeductionFormData[];
}
