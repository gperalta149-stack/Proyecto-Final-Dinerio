// frontend/src/features/reports/types.ts
import type { Subscription } from '../../shared/types';

export interface CategoryData {
  name: string;
  monthly_total: number;
  subscription_count: number;
  color?: string;
}

export interface FinancialReport {
  summary: {
    monthly_total: number;
    monthly_budget: number;
    total_subscriptions: number;
  };
  categories: CategoryData[];
  subscriptions: Subscription[];
}

export interface MonthlyEvolutionData {
  month: number;
  year: number;
  monthName: string;
  monthly_total: number;
  subscription_count: number;
}

export type { Subscription };