// frontend/src/features/categories/components/CategoryFilters/CategoryFilters.tsx
import React from 'react';
import { Search, Grid, List } from 'lucide-react';
import '../../../../styles/categories/CategoryFilters.css';

interface CategoryFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: 'name' | 'subscriptions' | 'recent';
  onSortChange: (sort: 'name' | 'subscriptions' | 'recent') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalCategories: number;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalCategories,
}) => {
  return (
    <div className="category-filters">
      <div className="category-filters-left">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="sort-select"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="subscriptions">Más suscripciones</option>
          <option value="recent">Más recientes</option>
        </select>
      </div>

      <div className="category-filters-right">
        <span className="categories-count">{totalCategories} categorías</span>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Vista cuadrícula"
          >
            <Grid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="Vista lista"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;