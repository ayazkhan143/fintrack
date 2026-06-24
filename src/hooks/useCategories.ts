import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../db/categories';
import type { Category, TransactionType } from '../types';

export const CATEGORIES_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: getAllCategories,
    staleTime: 60_000,
  });
}

export function useCategoriesByType(type: TransactionType) {
  return useQuery({
    queryKey: [...CATEGORIES_KEY, type],
    queryFn: () => getCategoriesByType(type),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Category, 'id' | 'isSystem'>) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Category, 'name' | 'icon' | 'color'>> }) =>
      updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CATEGORIES_KEY }),
  });
}
