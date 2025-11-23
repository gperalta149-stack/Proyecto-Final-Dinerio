import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryForm } from '../components/categories/CategoryForm';
import { CategoryList } from '../components/categories/CategoryList';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'subscriptions' | 'recent'>('name');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log("🔄 [CATEGORIES PAGE] Cargando categorías...");
      const categoriesData = await categoryService.getAll();
      
      console.log("[CATEGORIES PAGE] CATEGORÍAS RECIBIDAS EN EL COMPONENTE:", categoriesData);
      console.log("[CATEGORIES PAGE] CANTIDAD:", categoriesData.length);
      
      if (categoriesData.length > 0) {
        console.log("📊 [CATEGORIES PAGE] DETALLE DE CATEGORÍAS:");
        categoriesData.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat.name} - ${cat.subscription_count} suscripciones - ID: ${cat.id}`);
        });
      } else {
        console.log("[CATEGORIES PAGE] No se recibieron categorías");
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error("[CATEGORIES PAGE] Error loading categories:", error);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'subscriptions':
          return (b.subscription_count || 0) - (a.subscription_count || 0);
        case 'recent':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

  const handleCreateCategory = async (categoryData: Partial<Category>) => {
    try {
      setError('');
      setSuccess('');
      await categoryService.create(categoryData);
      await loadCategories();
      setShowForm(false);
      setSuccess('Categoría creada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al crear la categoría');
    }
  };

  const handleUpdateCategory = async (categoryData: Partial<Category>) => {
    if (!editingCategory) return;
    
    try {
      setError('');
      setSuccess('');
      await categoryService.update(editingCategory.id, categoryData);
      await loadCategories();
      setEditingCategory(null);
      setShowForm(false);
      setSuccess('Categoría actualizada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar la categoría');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Las suscripciones asociadas se cambiarán a "Sin categoría".')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await categoryService.delete(categoryId);
      await loadCategories();
      setSuccess('🗑️ Categoría eliminada exitosamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.error || '❌ Error al eliminar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setError('');
    setSuccess('');
  };

  const stats = {
    total: categories.length,
    withSubscriptions: categories.filter(cat => (cat.subscription_count || 0) > 0).length,
    empty: categories.filter(cat => (cat.subscription_count || 0) === 0).length,
    mostUsed: categories.reduce((max, cat) =>
      (cat.subscription_count || 0) > (max.subscription_count || 0) ? cat : max,
      { subscription_count: 0 } as Category
    )
  };

  if (loading) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando categorías...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestión de Categorías</h1>
            <p className="page-subtitle">
              Organiza y personaliza las categorías de tus suscripciones
              {categories.length > 0 && ` • ${categories.length} categorías`}
            </p>
          </div>
          <div className="page-actions">
            <button
              onClick={() => setShowForm(true)}
              className="subtrack-btn subtrack-btn-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Categoría
            </button>
          </div>
        </div>

        {/* Mensajes de estado */}
        {success && (
          <div className="subtrack-card bg-green-500/10 border-green-500/20 text-green-400 mb-6">
            <div className="flex items-center gap-3">
              <span>{success}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="subtrack-card bg-red-500/10 border-red-500/20 text-red-400 mb-6">
            <div className="flex items-center gap-3">
              <span>{error}</span>
            </div>
          </div>
        )}

        {showForm && (
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
            onCancel={handleCancel}
            isOpen={showForm}
          />
        )}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="subtrack-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white">Tus Categorías</h2>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Buscador */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar categorías..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="subtrack-form-input pl-10 w-full sm:w-64"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Ordenar */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="subtrack-form-input w-full sm:w-auto"
                  >
                    <option value="name">Ordenar por nombre</option>
                    <option value="subscriptions">Más suscripciones</option>
                    <option value="recent">Más recientes</option>
                  </select>
                </div>
              </div>
              
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No hay categorías</h3>
                  <p className="text-gray-400 mb-6">
                    Necesitas crear al menos una categoría antes de agregar suscripciones.
                  </p>
                  <p className="text-orange-300 text-sm mb-6">
                    💡 <strong>Importante:</strong> Las categorías son obligatorias para organizar tus suscripciones.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="subtrack-btn subtrack-btn-primary"
                  >
                    Crear Mi Primera Categoría
                  </button>
                </div>
              ) : filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 text-gray-400">🔍</div>
                  <h3 className="text-lg font-medium text-white mb-2">No se encontraron categorías</h3>
                  <p className="text-gray-400">
                    No hay categorías que coincidan con "{searchTerm}".
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedCategories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onEdit={handleEdit}
                      onDelete={handleDeleteCategory}
                      subscriptionCount={category.subscription_count || 0}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Total de categorías</span>
                  <span className="text-white font-semibold text-lg">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                  <span className="text-gray-300">Con suscripciones</span>
                  <span className="text-green-400 font-semibold">{stats.withSubscriptions}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Vacías</span>
                  <span className="text-gray-400 font-semibold">{stats.empty}</span>
                </div>
                {stats.mostUsed.name && (
                  <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                    <span className="text-gray-300">Más usada</span>
                    <span className="text-blue-400 font-semibold text-sm">
                      {stats.mostUsed.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Consejos */}
            <div className="subtrack-card bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-3">💡 Consejos</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span><strong>Crea categorías antes</strong> de agregar suscripciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Usa <strong>colores distintos</strong> para identificar rápidamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Las categorías <strong>vacías pueden ser eliminadas</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Organiza por <strong>tipo de gasto</strong> (entretenimiento, trabajo, etc.)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Vista de Lista */}
        {categories.length > 0 && !showForm && (
          <div className="mt-8">
            <div className="subtrack-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Vista de Lista</h2>
                <span className="text-gray-400 text-sm">
                  {filteredAndSortedCategories.length} de {categories.length} categorías
                </span>
              </div>
              <CategoryList
                categories={filteredAndSortedCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteCategory}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};