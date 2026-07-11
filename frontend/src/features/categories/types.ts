// frontend/src/features/categories/types.ts
import type { Category } from '../../shared/types';

// Re-exportar Category desde shared
export type { Category };

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface CategoryStats {
  total: number;
  withSubscriptions: number;
  empty: number;
  mostUsed: Category | null;
}

export interface CategoryFilters {
  searchTerm: string;
  sortBy: 'name' | 'subscriptions' | 'recent';
  viewMode: 'grid' | 'list';
}