// frontend/src/features/categories/components/CategoryStats/CategoryStats.tsx
import React from 'react';
import { BarChart3, Star } from 'lucide-react';
import type { CategoryStats as CategoryStatsType } from '../../utils/getCategoryStats';
import './CategoryStats.css';

interface CategoryStatsProps {
  stats: CategoryStatsType;
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ stats }) => {
  const items = [
    { label: 'Total de categorías', value: String(stats.total), color: '' },
    { label: 'Con suscripciones', value: String(stats.withSubscriptions), color: 'success' },
    { label: 'Vacías', value: String(stats.empty), color: '' },
  ];

  return (
    <div className="summary-card">
      <h3 className="section-title">
        <BarChart3 size={18} />
        Resumen
      </h3>
      <div className="summary-list">
        {items.map((item) => (
          <div key={item.label} className="summary-item">
            <span className="summary-label">{item.label}</span>
            <span className={`summary-badge ${item.color}`}>{item.value}</span>
          </div>
        ))}
        {stats.mostUsed && (
          <div className="summary-item">
            <span className="summary-label">Más usada</span>
            <span className="summary-badge highlight">
              <Star
                size={10}
                color="#ffffff"
                style={{ marginRight: 4, verticalAlign: -1 }}
              />
              {stats.mostUsed.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryStats;
