import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getTotalBalance,
} from '../db/accounts';
import type { Account } from '../types';

export const ACCOUNTS_KEY = ['accounts'] as const;

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: getAllAccounts,
    staleTime: 30_000,
  });
}

export function useTotalBalance() {
  return useQuery({
    queryKey: [...ACCOUNTS_KEY, 'total'],
    queryFn: getTotalBalance,
    staleTime: 10_000,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => createAccount(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Account, 'id' | 'createdAt'>> }) =>
      updateAccount(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAccount(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACCOUNTS_KEY }),
  });
}
