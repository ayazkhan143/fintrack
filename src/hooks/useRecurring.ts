import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllRecurring,
  getActiveRecurring,
  createRecurring,
  toggleRecurring,
  deleteRecurring,
} from '../db/recurring';
import type { RecurringTransaction } from '../types';

export const RECURRING_KEY = ['recurring'] as const;

export function useRecurring() {
  return useQuery({
    queryKey: RECURRING_KEY,
    queryFn: getAllRecurring,
    staleTime: 30_000,
  });
}

export function useActiveRecurring() {
  return useQuery({
    queryKey: [...RECURRING_KEY, 'active'],
    queryFn: getActiveRecurring,
    staleTime: 30_000,
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) =>
      createRecurring(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
}

export function useToggleRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRecurring(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecurring(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECURRING_KEY }),
  });
}
