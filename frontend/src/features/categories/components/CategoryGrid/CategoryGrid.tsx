// frontend/src/features/categories/components/CategoryGrid/CategoryGrid.tsx
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { KpiCard } from '../../../../shared/components/ui/KpiCard';
import type { KpiCardColor } from '../../../../shared/components/ui/KpiCard';
import type { Category } from '../../types';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  totalSpent: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAdd: () => void;
}

const COLOR_MAP: Record<string, KpiCardColor> = {
  '#6366f1': 'spent',
  '#22c55e': 'budget',
  '#f59e0b': 'orange',
  '#8b5cf6': 'subscriptions',
  '#06b6d4': 'info',
  '#ef4444': 'red',
  '#84cc16': 'success',
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  totalSpent,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const totalSubscriptions = categories.reduce((acc, cat) => acc + (cat.subscription_count || 0), 0);

  if (categories.length === 0) {
    return (
      <div className="category-grid">
        <button onClick={onAdd} className="category-grid-add">
          <span className="category-grid-add-icon">+</span>
          <span className="category-grid-add-text">Nueva categoría</span>
        </button>
      </div>
    );
  }

  const getBadge = (category: Category) => {
    const isDefault = !category.user_id;
    const hasSubs = (category.subscription_count || 0) > 0;
    if (isDefault && hasSubs) {
      return { text: `${category.subscription_count} subs · Predeterminada`, color: "#6366f1" };
    }
    if (isDefault) {
      return { text: "Predeterminada", color: "#6366f1" };
    }
    if (hasSubs) {
      return { text: `${category.subscription_count} ${category.subscription_count === 1 ? 'sub' : 'subs'}`, color: "#6366f1" };
    }
    return undefined;
  };

  const getSubtitle = (percentage: number) => {
    return percentage > 0 ? `${percentage.toFixed(0)}% del gasto` : undefined;
  };

  return (
    <div className="category-grid">
      {categories.map((category) => {
        const percentage = totalSubscriptions > 0
          ? ((category.subscription_count || 0) / totalSubscriptions) * 100
          : 0;
        const monthlySpent = category.monthly_total || 0;
        const color = COLOR_MAP[category.color || ''] || 'info';

        return (
          <KpiCard
            key={category.id}
            title={category.name}
            value={formatCurrency(monthlySpent, 'ARS')}
            subtitle={getSubtitle(percentage)}
            icon={getCategoryIcon(category.name)}
            color={color}
            progress={percentage}
            badge={getBadge(category)}
            actions={
              <>
                <button
                  className="category-action edit"
                  onClick={() => onEdit(category)}
                  title="Editar"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  className={`category-action delete ${(category.subscription_count || 0) > 0 ? 'disabled' : ''}`}
                  onClick={() => onDelete(category.id)}
                  title={(category.subscription_count || 0) > 0 ? "Tiene suscripciones asignadas" : "Eliminar categoría"}
                  disabled={(category.subscription_count || 0) > 0}
                >
                  <Trash2 size={14} />
                </button>
              </>
            }
          />
        );
      })}

      <button onClick={onAdd} className="category-grid-add">
        <span className="category-grid-add-icon">+</span>
        <span className="category-grid-add-text">Nueva categoría</span>
      </button>
    </div>
  );
};

export default CategoryGrid;
