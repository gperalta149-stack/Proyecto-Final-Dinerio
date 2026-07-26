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
  const [error, setError] = useState("");

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

  // Close on Escape for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("El nombre de la categoría es requerido");
      return;
    }
    setError("");
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions
    <div
      className="category-form-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions */}
      <div className="category-form-modal" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
        <div className="category-form-header">
          <h3 className="category-form-title">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button aria-label="Cerrar" className="category-form-close" onClick={onCancel} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form-body">
          {error && <div className="category-form-error">{error}</div>}
          <div className="category-form-group">
            <label className="category-form-label">Nombre de la categoría *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(prev => ({ ...prev, name: e.target.value })); setError(""); }}
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
                  aria-pressed={formData.color === color}
                  aria-label={`Seleccionar color ${color}`}
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