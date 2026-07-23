// frontend/src/features/categories/pages/CategoriesPage.tsx
import React, { useState } from 'react';
import { Plus, Tags } from 'lucide-react';
import { useCategories } from '../hooks';
import { CategoryGrid } from '../components/CategoryGrid/CategoryGrid';
import { CategoryForm } from '../components/CategoryForm/CategoryForm';
import { CategoryStats } from '../components/CategoryStats/CategoryStats';
import { CategoryTips } from '../components/CategoryTips/CategoryTips';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { Category } from '../types';
import '../../../styles/categories/categories.css';

export const CategoriesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    categories,
    loading,
    error,
    success,
    stats,
    createCategory,
    updateCategory,
    deleteCategory,
    clearMessages,
  } = useCategories();

  const totalSpent = categories.reduce((acc, cat) => acc + (cat.monthly_total || 0), 0);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSubmit = async (data: Partial<Category>) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await createCategory(data);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    clearMessages();
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="categories-container">
          <div className="categories-loading">
            <div className="loading-spinner" />
            <p>Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="categories-container">
        {/* Header */}
        <div className="categories-header">
          <div className="categories-header-left">
            <div className="categories-header-icon">
              <Tags size={24} />
            </div>
          </div>
          <button onClick={handleCreate} className="categories-add-btn">
            <Plus size={18} />
            Nueva categoría
          </button>
        </div>

        {/* Mensajes */}
        {success && (
          <div className="categories-message success">{success}</div>
        )}
        {error && (
          <div className="categories-message error">{error}</div>
        )}

        {/* Formulario */}
        {showForm && (
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isOpen={showForm}
          />
        )}

        {/* Grid de categorías */}
        <CategoryGrid
          categories={categories}
          totalSpent={totalSpent}
          onEdit={handleEdit}
          onDelete={deleteCategory}
          onAdd={handleCreate}
        />

        {/* Stats + Tips en fila */}
        <div className="categories-stats-tips">
          <CategoryStats stats={stats} />
          <CategoryTips />
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;