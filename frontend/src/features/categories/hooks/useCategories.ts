// frontend/src/features/categories/hooks/useCategories.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { categoryService } from '../service/categoryService';
import type { Category } from '../types';
import { getCategoryStats } from '../utils/getCategoryStats';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  success: string | null;
  stats: ReturnType<typeof getCategoryStats>;
  searchTerm: string;
  sortBy: 'name' | 'subscriptions' | 'recent';
  setSearchTerm: (term: string) => void;
  setSortBy: (sort: 'name' | 'subscriptions' | 'recent') => void;
  createCategory: (data: Partial<Category>) => Promise<void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearMessages: () => void;
  refresh: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'subscriptions' | 'recent'>('name');

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const stats = useMemo(() => getCategoryStats(categories), [categories]);

  const filteredAndSortedCategories = useMemo(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscriptions':
          return (b.subscription_count || 0) - (a.subscription_count || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });
  }, [categories, searchTerm, sortBy]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const createCategory = useCallback(async (data: Partial<Category>) => {
    try {
      clearMessages();
      await categoryService.create(data);
      await loadCategories();
      setSuccess('Categoría creada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
      throw err;
    }
  }, [loadCategories, clearMessages]);

  const updateCategory = useCallback(async (id: string, data: Partial<Category>) => {
    try {
      clearMessages();
      await categoryService.update(id, data);
      await loadCategories();
      setSuccess('Categoría actualizada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar categoría');
      throw err;
    }
  }, [loadCategories, clearMessages]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      clearMessages();
      await categoryService.delete(id);
      await loadCategories();
      setSuccess('Categoría eliminada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
      throw err;
    }
  }, [loadCategories, clearMessages]);

  return {
    categories: filteredAndSortedCategories,
    loading,
    error,
    success,
    stats,
    searchTerm,
    sortBy,
    setSearchTerm,
    setSortBy,
    createCategory,
    updateCategory,
    deleteCategory,
    clearMessages,
    refresh: loadCategories,
  };
};