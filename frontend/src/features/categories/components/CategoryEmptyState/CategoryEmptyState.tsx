// frontend/src/features/categories/components/CategoryEmptyState/CategoryEmptyState.tsx
import React from 'react';
import { Plus, FolderOpen, Lightbulb } from 'lucide-react';
import '../../../../styles/categories/CategoryEmptyState.css';

interface CategoryEmptyStateProps {
  onAdd: () => void;
}

export const CategoryEmptyState: React.FC<CategoryEmptyStateProps> = ({ onAdd }) => {
  return (
    <div className="category-empty-state">
      <div className="category-empty-icon"><FolderOpen size={48} /></div>
      <h3 className="category-empty-title">No hay categorías</h3>
      <p className="category-empty-description">
        Necesitas crear al menos una categoría antes de agregar suscripciones.
      </p>
      <p className="category-empty-hint">
        <Lightbulb size={14} /> <strong>Importante:</strong> Las categorías son obligatorias para organizar tus suscripciones.
      </p>
      <button onClick={onAdd} className="category-empty-btn">
        <Plus size={18} />
        Crear Mi Primera Categoría
      </button>
    </div>
  );
};

export default CategoryEmptyState;