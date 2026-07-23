// frontend/src/features/debts/components/DebtFilters/DebtFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';
import '../../../../styles/debts/DebtFilters.css';

export type DebtFilter = 'all' | 'pending' | 'overdue' | 'today' | 'paid';

interface DebtFiltersProps {
  activeFilter: DebtFilter;
  onFilterChange: (filter: DebtFilter) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  counts: {
    all: number;
    pending: number;
    overdue: number;
    today: number;
    paid: number;
  };
}

const FILTERS: { key: DebtFilter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'overdue', label: 'Vencidas' },
  { key: 'today', label: 'Hoy' },
  { key: 'paid', label: 'Pagadas' },
];

export const DebtFilters: React.FC<DebtFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  counts,
}) => {
  return (
    <div className="debt-filters">
      <div className="debt-filters-tabs">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            className={`debt-filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.key)}
          >
            {filter.label} ({counts[filter.key]})
          </button>
        ))}
      </div>

      <div className="debt-search">
        <Search size={16} className="debt-search-icon" />
        <input
          type="text"
          placeholder="Buscar deudas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="debt-search-input"
        />
      </div>
    </div>
  );
};

export default DebtFilters;
