import React from 'react';
import { BarChart3, Layers, CheckCircle2 } from 'lucide-react';
import type { CategoryStats as CategoryStatsType } from '../../utils/getCategoryStats';
import './CategoryStats.css';

interface CategoryStatsProps {
  stats: CategoryStatsType;
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({ stats }) => {
  const items = [
    { label: 'Total', value: stats.total, icon: BarChart3, color: '#6366f1' },
    { label: 'Con suscripciones', value: stats.withSubscriptions, icon: Layers, color: '#22c55e' },
    { label: 'Vacías', value: stats.empty, icon: CheckCircle2, color: '#f59e0b' },
  ];

  return (
    <div className="category-stats-row">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="category-stat-item">
            <Icon size={22} style={{ color: item.color }} />
            <span className="category-stat-value">{item.value}</span>
            <span className="category-stat-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryStats;