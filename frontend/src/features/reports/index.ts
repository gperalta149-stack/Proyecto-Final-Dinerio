// frontend/src/features/reports/index.ts
export { ReportsPage } from './pages/ReportsPage';
export { default } from './pages/ReportsPage';

// Components
export { ReportsKPIs } from './components/ReportsKPIs/ReportsKPIs';
export { ReportFilters } from './components/ReportFilters/ReportFilters';
export { EvolutionChart } from './components/EvolutionChart/EvolutionChart';
export { CategoryChart } from './components/CategoryChart/CategoryChart';
export { CategoryTable } from './components/CategoryTable/CategoryTable';
export { InsightsCard } from './components/InsightsCard/InsightsCard';

// Hooks
export { useReports } from './hooks';

// Services
export { reportService } from './service/reportService';

// Types
export * from './types';