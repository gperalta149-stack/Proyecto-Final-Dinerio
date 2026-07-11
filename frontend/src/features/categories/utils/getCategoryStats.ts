// frontend/src/features/categories/utils/getCategoryStats.ts
import type { Category } from '../types';

export interface CategoryStats {
  total: number;
  withSubscriptions: number;
  empty: number;
  mostUsed: Category | null;
}

export const getCategoryStats = (categories: Category[]): CategoryStats => {
  const withSubscriptions = categories.filter(cat => (cat.subscription_count || 0) > 0);
  const empty = categories.filter(cat => (cat.subscription_count || 0) === 0);
  
  // Inicializar con un objeto seguro
  const defaultCategory: Category = {
    id: '',
    name: '',
    color: '',
    subscription_count: 0,
  };

  const mostUsed = withSubscriptions.reduce(
    (max, cat) => {
      const maxCount = max.subscription_count || 0;
      const catCount = cat.subscription_count || 0;
      return catCount > maxCount ? cat : max;
    },
    defaultCategory
  );

  const hasMostUsed = mostUsed.id && (mostUsed.subscription_count || 0) > 0;

  return {
    total: categories.length,
    withSubscriptions: withSubscriptions.length,
    empty: empty.length,
    mostUsed: hasMostUsed ? mostUsed : null,
  };
};