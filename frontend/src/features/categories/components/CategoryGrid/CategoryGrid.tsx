// frontend/src/features/categories/components/CategoryGrid/CategoryGrid.tsx
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import { formatCurrency } from '../../../../shared/utils/formatters';
import type { Category } from '../../types';
import './CategoryGrid.css';

interface CategoryGridProps {
  categories: Category[];
  totalSpent: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAdd: () => void;
}

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

  return (
    <div className="category-grid">
      {categories.map((category) => {
        const percentage = totalSubscriptions > 0
          ? ((category.subscription_count || 0) / totalSubscriptions) * 100
          : 0;

        const monthlySpent = category.monthly_total || 0;
        const isDefault = !category.user_id;
        const hasSubscriptions = (category.subscription_count || 0) > 0;
        const iconColor = category.color || '#6366f1';

        return (
          <div key={category.id} className="category-card">
            <div className="category-card-header">
              <div className="header-left">
                <div
                  className="icon-container"
                  style={{
                    borderColor: `${iconColor}4d`,
                    color: iconColor,
                    boxShadow: `inset 0 0 12px ${iconColor}33`,
                  }}
                >
                  {getCategoryIcon(category.name)}
                </div>
                <div className="card-title-wrapper">
                  <h3 className="card-title">{category.name}</h3>
                  <div className="card-badges-row">
                    {isDefault && (
                      <span className="badge-default">Predeterminada</span>
                    )}
                    {hasSubscriptions && (
                      <span className="badge-subscriptions">
                        {category.subscription_count} {category.subscription_count === 1 ? 'suscripción' : 'suscripciones'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-body">
              <span className="amount-text">{formatCurrency(monthlySpent, 'ARS')}</span>
              <span className="amount-label">/mes</span>
            </div>

            <div className="card-footer">
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                <span className="progress-text">{percentage.toFixed(0)}% del gasto</span>
              </div>
            </div>

            <div className="category-card-actions">
              <button
                className="category-action edit"
                onClick={() => onEdit(category)}
                title="Editar"
              >
                <Edit3 size={14} />
              </button>
              <button
                className={`category-action delete ${hasSubscriptions ? 'disabled' : ''}`}
                onClick={() => onDelete(category.id)}
                title={hasSubscriptions ? "Tiene suscripciones asignadas" : "Eliminar categoría"}
                disabled={hasSubscriptions}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
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
