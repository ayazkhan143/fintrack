import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, isToday, isYesterday } from 'date-fns';
import type { BudgetPeriod } from '../types';

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatShortDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMM d');
}

export function formatMonthYear(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM yyyy');
}

export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a');
}

export function formatDateForInput(timestamp: number): string {
  return format(new Date(timestamp), 'yyyy-MM-dd');
}

export function getMonthRange(date: Date = new Date()): { start: number; end: number } {
  return {
    start: startOfMonth(date).getTime(),
    end: endOfMonth(date).getTime(),
  };
}

export function getWeekRange(date: Date = new Date(), weekStartsOn: 0 | 1 = 1): { start: number; end: number } {
  return {
    start: startOfWeek(date, { weekStartsOn }).getTime(),
    end: endOfWeek(date, { weekStartsOn }).getTime(),
  };
}

export function getYearRange(date: Date = new Date()): { start: number; end: number } {
  return {
    start: startOfYear(date).getTime(),
    end: endOfYear(date).getTime(),
  };
}

export function getBudgetPeriodRange(period: BudgetPeriod, date: Date = new Date()): { start: number; end: number } {
  switch (period) {
    case 'weekly': return getWeekRange(date);
    case 'monthly': return getMonthRange(date);
    case 'yearly': return getYearRange(date);
  }
}

export function getMonthsInYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(year, i, 1);
    return format(d, 'MMM');
  });
}
