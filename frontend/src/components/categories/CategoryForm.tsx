import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { X } from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Partial<Category>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const defaultColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  isOpen
}) => {
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        color: category.color || '#3b82f6',
      });
    } else {
      setFormData({
        name: '',
        color: '#3b82f6',
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.name.trim()) {
        alert('El nombre de la categoría es requerido');
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="subtrack-modal-overlay" onClick={onCancel}>
      <div className="subtrack-modal" onClick={(e) => e.stopPropagation()}>
        <div className="subtrack-modal-header">
          <h3 className="subtrack-modal-title">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button
            className="subtrack-close-btn"
            onClick={onCancel}
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="subtrack-modal-form">
          <div className="subtrack-form-group">
            <label className="subtrack-form-label">Nombre de la categoría *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="subtrack-form-input"
              placeholder="Ej: Entretenimiento, Trabajo, Salud..."
              required
              disabled={loading}
            />
          </div>

          {/* Selector de color */}
          <div className="subtrack-form-group">
            <label className="subtrack-form-label">Color de la categoría *</label>
            <div className="grid grid-cols-5 gap-3 mt-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                    formData.color === color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  disabled={loading}
                />
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div className="subtrack-form-group">
            <label className="subtrack-form-label">Vista previa</label>
            <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 mt-2">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: formData.color }}
                >
                  {/* Imagen genérica para vista previa */}
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : 'C'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-white font-medium text-lg">
                    {formData.name || 'Nombre de categoría'}
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    Se generará automáticamente una imagen profesional
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="subtrack-modal-actions">
            <button
              type="button"
              className="subtrack-btn subtrack-btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="subtrack-btn subtrack-btn-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small mr-2"></div>
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