import type { Category, CurrencyCode } from '../types';

export const COLORS = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Dark theme
  dark: {
    bg: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    border: '#334155',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textSubtle: '#64748B',
  },

  // Light theme
  light: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceAlt: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#475569',
    textSubtle: '#94A3B8',
  },

  accountColors: [
    '#6366F1', '#10B981', '#F59E0B', '#EF4444',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  ],
} as const;

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string }> = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  PKR: { symbol: '₨', name: 'Pakistani Rupee' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
};

export const SYSTEM_CATEGORIES: Category[] = [
  // Expense
  { id: 'cat_food', name: 'Food & Dining', icon: 'restaurant', color: '#F59E0B', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_transport', name: 'Transport', icon: 'car', color: '#3B82F6', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_shopping', name: 'Shopping', icon: 'bag', color: '#EC4899', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_health', name: 'Health', icon: 'heart', color: '#EF4444', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_home', name: 'Home & Rent', icon: 'home', color: '#8B5CF6', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'game-controller', color: '#14B8A6', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_education', name: 'Education', icon: 'school', color: '#6366F1', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_utilities', name: 'Utilities', icon: 'flash', color: '#F97316', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_travel', name: 'Travel', icon: 'airplane', color: '#0EA5E9', type: 'expense', parentId: null, isSystem: true },
  { id: 'cat_other_exp', name: 'Other', icon: 'ellipsis-horizontal', color: '#64748B', type: 'expense', parentId: null, isSystem: true },

  // Income
  { id: 'cat_salary', name: 'Salary', icon: 'briefcase', color: '#10B981', type: 'income', parentId: null, isSystem: true },
  { id: 'cat_freelance', name: 'Freelance', icon: 'laptop', color: '#6366F1', type: 'income', parentId: null, isSystem: true },
  { id: 'cat_investment_inc', name: 'Investment', icon: 'trending-up', color: '#F59E0B', type: 'income', parentId: null, isSystem: true },
  { id: 'cat_gift', name: 'Gift', icon: 'gift', color: '#EC4899', type: 'income', parentId: null, isSystem: true },
  { id: 'cat_other_inc', name: 'Other Income', icon: 'add-circle', color: '#64748B', type: 'income', parentId: null, isSystem: true },

  // Transfer
  { id: 'cat_transfer', name: 'Transfer', icon: 'swap-horizontal', color: '#94A3B8', type: 'transfer', parentId: null, isSystem: true },
];

export const DEFAULT_SETTINGS = {
  currency: 'USD' as CurrencyCode,
  theme: 'system' as const,
  biometricEnabled: false,
  notificationsEnabled: true,
  budgetAlerts: true,
  weekStartsOn: 1 as 0 | 1,
  hideBalance: false,
  onboardingCompleted: false,
};

export const HAPTICS_ENABLED = true;
