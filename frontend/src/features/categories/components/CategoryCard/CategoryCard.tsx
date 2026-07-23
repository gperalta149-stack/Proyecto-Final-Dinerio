// frontend/src/features/categories/components/CategoryCard/CategoryCard.tsx
import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import type { Category } from '../../types';
import '../../../../styles/categories/CategoryCard.css';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  subscriptionCount?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  subscriptionCount = 0
}) => {
  const isDefaultCategory = !category.user_id;
  const canDelete = subscriptionCount === 0 && !isDefaultCategory;

  return (
    <div className="category-card">
      <div className="card-header">
        <div className="header-left">
          <div className="icon-container">
            {getCategoryIcon(category.name)}
          </div>
          <div className="card-title-wrapper">
            <h3 className="card-title">{category.name}</h3>
            <span className="card-subtitle">
              <span>Categoría</span>
              {category.created_at && (
                <span>{new Date(category.created_at).toLocaleDateString('es-ES')}</span>
              )}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isDefaultCategory && (
            <span className="badge-default">Predeterminada</span>
          )}
          {subscriptionCount > 0 && (
            <span className="badge-subscriptions">
              {subscriptionCount} {subscriptionCount === 1 ? 'suscripción' : 'suscripciones'}
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <span className="amount-text">{subscriptionCount}</span>
        <span className="amount-label">
          {subscriptionCount === 1 ? 'suscripción activa' : 'suscripciones activas'}
        </span>
      </div>

      <div className="card-footer">
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${Math.min(subscriptionCount * 20, 100)}%` }}
          />
          <span className="progress-text">
            {subscriptionCount > 0 ? `${Math.min(subscriptionCount * 20, 100)}% utilizado` : 'Sin uso'}
          </span>
        </div>
      </div>

      <div className="category-card-actions">
        {!isDefaultCategory && (
          <>
            <button
              onClick={() => onEdit(category)}
              className="category-action edit"
              title="Editar categoría"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              disabled={!canDelete}
              className={`category-action delete ${!canDelete ? 'disabled' : ''}`}
              title={canDelete ? "Eliminar categoría" : "No se puede eliminar"}
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
        {isDefaultCategory && (
          <span className="category-readonly">Solo lectura</span>
        )}
      </div>

      {!isDefaultCategory && subscriptionCount > 0 && (
        <div className="category-card-warning">
          Esta categoría tiene <strong>{subscriptionCount} suscripción{subscriptionCount !== 1 ? 'es' : ''}</strong> activa{subscriptionCount !== 1 ? 's' : ''}.
          Reasigna las suscripciones antes de eliminar.
        </div>
      )}
    </div>
  );
};

export default CategoryCard;