import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBudgets,
  getActiveBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  refreshBudgetSpent,
} from '../db/budgets';
import type { Budget } from '../types';

export const BUDGETS_KEY = ['budgets'] as const;

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_KEY,
    queryFn: getAllBudgets,
    staleTime: 15_000,
  });
}

export function useActiveBudgets() {
  const now = Date.now();
  return useQuery({
    queryKey: [...BUDGETS_KEY, 'active', now],
    queryFn: () => getActiveBudgets(now),
    staleTime: 15_000,
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => createBudget(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Budget, 'id' | 'createdAt'>> }) =>
      updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}

export function useRefreshBudgetSpent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, startDate, endDate, budgetId }: {
      categoryId: string; startDate: number; endDate: number; budgetId: string;
    }) => refreshBudgetSpent(categoryId, startDate, endDate, budgetId),
    onSuccess: () => qc.invalidateQueries({ queryKey: BUDGETS_KEY }),
  });
}
