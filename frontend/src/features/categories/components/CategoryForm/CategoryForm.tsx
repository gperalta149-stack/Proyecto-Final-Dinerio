// frontend/src/features/categories/components/CategoryForm/CategoryForm.tsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { DEFAULT_COLORS } from '../../constants/categoryColors';
import type { Category, CategoryFormData } from '../../types';
import '../../../../styles/categories/CategoryForm.css';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
  loading?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isOpen,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: DEFAULT_COLORS[0],
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        color: category.color || DEFAULT_COLORS[0],
      });
    } else {
      setFormData({
        name: '',
        color: DEFAULT_COLORS[0],
      });
    }
  }, [category, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="category-form-overlay" onClick={onCancel}>
      <div className="category-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="category-form-header">
          <h3 className="category-form-title">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button className="category-form-close" onClick={onCancel} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form-body">
          <div className="category-form-group">
            <label className="category-form-label">Nombre de la categoría *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="category-form-input"
              placeholder="Ej: Entretenimiento, Trabajo, Salud..."
              required
              disabled={loading}
            />
          </div>

          <div className="category-form-group">
            <label className="category-form-label">Color de la categoría *</label>
            <div className="category-form-colors">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`category-form-color ${
                    formData.color === color ? 'active' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          <div className="category-form-preview">
            <label className="category-form-label">Vista previa</label>
            <div className="category-form-preview-card">
              <div
                className="category-form-preview-icon"
                style={{ backgroundColor: formData.color }}
              >
                <span className="category-form-preview-letter">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}
                </span>
              </div>
              <div>
                <span className="category-form-preview-name">
                  {formData.name || 'Nombre de categoría'}
                </span>
                <p className="category-form-preview-hint">
                  Se generará automáticamente una imagen profesional
                </p>
              </div>
            </div>
          </div>

          <div className="category-form-actions">
            <button
              type="button"
              className="category-form-btn secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="category-form-btn primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small" />
                  Procesando...
                </>
              ) : category ? (
                'Actualizar Categoría'
              ) : (
                'Crear Categoría'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;