// frontend/src/features/budget/index.ts
export { BudgetPage } from './pages/BudgetPage';
export { default } from './pages/BudgetPage';

// Components
export { BudgetKPIs } from './components/BudgetKPIs/BudgetKPIs';
export { BudgetProgress } from './components/BudgetProgress/BudgetProgress';
export { BudgetModal } from './components/BudgetModal/BudgetModal';
export { BudgetRecommendations } from './components/BudgetRecommendations/BudgetRecommendations';
export { BudgetSummary } from './components/BudgetSummary/BudgetSummary';

// Hooks
export { useBudget } from './hooks/useBudget';

// Services
export { budgetService } from './service/budgetService';

// Types
export * from './types';