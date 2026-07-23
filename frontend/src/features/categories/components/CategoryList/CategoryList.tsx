// frontend/src/features/categories/components/CategoryList/CategoryList.tsx
import React from 'react';
import { getCategoryIcon } from '../../utils/getCategoryIcon';
import type { Category } from '../../types';
import '../../../../styles/categories/CategoryList.css';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onEdit,
  onDelete,
}) => {
  if (categories.length === 0) {
    return (
      <div className="category-list-empty">
        <p>No hay categorías para mostrar</p>
      </div>
    );
  }

  return (
    <div className="category-list">
      <table className="category-list-table">
        <thead>
          <tr>
            <th>Categoría</th>
            <th>Icono</th>
            <th>Suscripciones</th>
            <th>Tipo</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isDefaultCategory = !category.user_id;
            const subscriptionCount = category.subscription_count || 0;
            const canDelete = subscriptionCount === 0 && !isDefaultCategory;

            return (
              <tr key={category.id} className="category-list-row">
                <td>
                  <div className="category-list-name">
                    <span className="category-list-dot" style={{ backgroundColor: category.color }} />
                    <span className="category-list-name-text">{category.name}</span>
                  </div>
                </td>
                <td>
                  <div
                    className="category-list-icon"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {getCategoryIcon(category.name)}
                  </div>
                </td>
                <td>
                  <span className={`category-list-badge ${subscriptionCount > 0 ? 'active' : 'empty'}`}>
                    {subscriptionCount}
                  </span>
                </td>
                <td>
                  {isDefaultCategory ? (
                    <span className="category-list-tag default">Predeterminada</span>
                  ) : (
                    <span className="category-list-tag custom">Personalizada</span>
                  )}
                </td>
                <td className="text-right">
                  {!isDefaultCategory && (
                    <div className="category-list-actions">
                      <button
                        onClick={() => onEdit(category)}
                        className="category-list-action edit"
                        title="Editar categoría"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => onDelete(category.id)}
                        className={`category-list-action delete ${!canDelete ? 'disabled' : ''}`}
                        title={canDelete ? 'Eliminar categoría' : 'No se puede eliminar'}
                        disabled={!canDelete}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;