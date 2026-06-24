import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlyStats,
  getCategoryStats,
  getDailyStats,
  getPeriodTotals,
  type TransactionFilters,
} from '../db/transactions';
import type { Transaction, TransactionType } from '../types';

export const TRANSACTIONS_KEY = ['transactions'] as const;
export const STATS_KEY = ['stats'] as const;

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, filters],
    queryFn: () => getTransactions(filters),
    staleTime: 10_000,
  });
}

export function usePeriodTotals(dateFrom: number, dateTo: number) {
  return useQuery({
    queryKey: [...STATS_KEY, 'period', dateFrom, dateTo],
    queryFn: () => getPeriodTotals(dateFrom, dateTo),
    staleTime: 15_000,
  });
}

export function useMonthlyStats(year: number) {
  return useQuery({
    queryKey: [...STATS_KEY, 'monthly', year],
    queryFn: () => getMonthlyStats(year),
    staleTime: 60_000,
  });
}

export function useCategoryStats(dateFrom: number, dateTo: number, type: TransactionType) {
  return useQuery({
    queryKey: [...STATS_KEY, 'category', dateFrom, dateTo, type],
    queryFn: () => getCategoryStats(dateFrom, dateTo, type),
    staleTime: 15_000,
  });
}

export function useDailyStats(dateFrom: number, dateTo: number) {
  return useQuery({
    queryKey: [...STATS_KEY, 'daily', dateFrom, dateTo],
    queryFn: () => getDailyStats(dateFrom, dateTo),
    staleTime: 15_000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => createTransaction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Transaction, 'id' | 'createdAt'>> }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      qc.invalidateQueries({ queryKey: STATS_KEY });
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
