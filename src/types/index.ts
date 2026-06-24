export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export type AccountType = 'checking' | 'savings' | 'credit' | 'cash' | 'investment';

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'SAR' | 'AED' | 'CAD' | 'AUD';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: CurrencyCode;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  parentId: string | null;
  isSystem: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  toAccountId: string | null;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  note: string;
  date: number;
  status: TransactionStatus;
  receiptUri: string | null;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: number;
  endDate: number;
  currency: CurrencyCode;
  alertAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  note: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  nextDueDate: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DailyStats {
  date: string;
  income: number;
  expense: number;
}

export interface AppSettings {
  currency: CurrencyCode;
  theme: ThemeMode;
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  budgetAlerts: boolean;
  weekStartsOn: 0 | 1;
  hideBalance: boolean;
  onboardingCompleted: boolean;
}
