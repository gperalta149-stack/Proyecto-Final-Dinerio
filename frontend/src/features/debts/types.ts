// frontend/src/features/debts/types.ts
import type { Debt, DebtsSummary } from '../../shared/types';

// Re-exportar desde shared
export type { Debt, DebtsSummary };

export interface CreateDebtData {
  name: string;
  amount: number;
  currency?: string;
  due_date: string;
  category_id?: string;
  notes?: string;
}

export interface DebtFilters {
  status?: 'all' | 'pending' | 'paid';
  category?: string;
  search?: string;
}