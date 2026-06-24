import { CURRENCIES } from '../constants';
import type { CurrencyCode } from '../types';

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'USD',
  options: { compact?: boolean; showSymbol?: boolean } = {}
): string {
  const { compact = false, showSymbol = true } = options;
  const { symbol } = CURRENCIES[currency];

  let formatted: string;

  if (compact && Math.abs(amount) >= 1_000_000) {
    formatted = `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (compact && Math.abs(amount) >= 1_000) {
    formatted = `${(amount / 1_000).toFixed(1)}K`;
  } else {
    formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return showSymbol ? `${symbol}${formatted}` : formatted;
}

export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}
