// frontend/src/features/notifications/components/NotificationFilters/NotificationFilters.tsx
import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { NOTIFICATION_TYPE_LABELS } from '../../constants/notificationConstants';
import type { NotificationType, NotificationPriority } from '../../types';
import './NotificationFilters.css';

interface NotificationFiltersProps {
  activeFilter: 'all' | 'unread' | 'read';
  onFilterChange: (filter: 'all' | 'unread' | 'read') => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedType?: NotificationType;
  onTypeChange: (type?: NotificationType) => void;
  counts: {
    all: number;
    unread: number;
    read: number;
  };
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'Todas' },
  { key: 'unread', label: 'No leídas' },
  { key: 'read', label: 'Leídas' },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  counts,
}) => {
  const types = Object.entries(NOTIFICATION_TYPE_LABELS);

  return (
    <div className="notif-filters">
      <div className="notif-filters-tabs">
        {FILTER_OPTIONS.map((filter) => (
          <button
            key={filter.key}
            className={`notif-filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.key as any)}
          >
            {filter.label}
            <span className="notif-filter-count">{counts[filter.key as keyof typeof counts]}</span>
          </button>
        ))}
      </div>

      <div className="notif-filters-right">
        <div className="notif-search">
          <Search size={16} className="notif-search-icon" />
          <input
            type="text"
            placeholder="Buscar notificaciones..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="notif-search-input"
          />
          {searchTerm && (
            <button
              className="notif-search-clear"
              onClick={() => onSearchChange('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="notif-type-filter">
          <Filter size={16} className="notif-type-filter-icon" />
          <select
            value={selectedType || ''}
            onChange={(e) => onTypeChange(e.target.value as NotificationType || undefined)}
            className="notif-type-select"
          >
            <option value="">Todos los tipos</option>
            {types.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;