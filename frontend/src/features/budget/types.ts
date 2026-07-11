// frontend/src/features/budget/types.ts
import type { User } from '../../shared/types';

// ============================================
// TIPOS PARA EL ESTADO DEL PRESUPUESTO
// ============================================
export interface BudgetState {
  budget: number;
  spent: number;
  available: number;
  percentageUsed: number;
  alertThreshold: number;
  daysRemaining: number;
  dailyAllowance: number;
  projectedSpending: number;
}

// ============================================
// TIPOS PARA KPIS
// ============================================
export interface BudgetKPIsProps {
  budget: number;
  spent: number;
  available: number;
  percentageUsed: number;
}

// ============================================
// TIPOS PARA PROGRESS BAR
// ============================================
export interface BudgetProgressProps {
  spent: number;
  budget: number;
  percentageUsed: number;
  alertThreshold: number;
  daysRemaining: number;
}

// ============================================
// TIPOS PARA MODAL
// ============================================
export interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: number, alertThreshold: number) => void;
  currentBudget?: number;
  currentThreshold?: number;
}

// ============================================
// TIPOS PARA RECOMENDACIONES
// ============================================
export interface BudgetRecommendation {
  type: 'success' | 'warning' | 'danger' | 'info';
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

export interface BudgetRecommendationsProps {
  spent: number;
  budget: number;
  percentageUsed: number;
}

// ============================================
// TIPOS PARA SUMMARY
// ============================================
export interface BudgetSummaryProps {
  spent: number;
  budget: number;
  available: number;
  percentageUsed: number;
  daysRemaining: number;
}

// ============================================
// TIPOS PARA HOOK
// ============================================
export interface UseBudgetReturn {
  user: User | null;
  budget: number;
  alertThreshold: number;
  spent: number;
  available: number;
  percentageUsed: number;
  daysRemaining: number;
  dailyAllowance: number;
  projectedSpending: number;
  loading: boolean;
  updateBudget: (newBudget: number, threshold: number) => Promise<void>;
}

// ============================================
// TIPOS PARA SERVICE
// ============================================
export interface BudgetUpdateData {
  monthly_budget: number;
  alert_threshold?: number;
}