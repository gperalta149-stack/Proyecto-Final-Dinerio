// frontend/src/features/debts/index.ts
export { DebtsPage } from './pages/DebtsPage';
export { default } from './pages/DebtsPage';

// Components
export { DebtCard } from './components/DebtCard/DebtCard';
export { DebtStats } from './components/DebtStats/DebtStats';
export { DebtFilters } from './components/DebtFilters/DebtFilters';
export { DebtEmptyState } from './components/DebtEmptyState/DebtEmptyState';
export { DebtHistory } from './components/DebtHistory/DebtHistory';

// Hooks
export { useDebts } from './hooks/useDebts';

// Services
export { debtService } from './service/debtService';

// Types
export * from './types';