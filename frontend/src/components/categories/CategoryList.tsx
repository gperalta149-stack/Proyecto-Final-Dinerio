import React from 'react';
import type { Category } from '../../types';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit, onDelete }) => {
  const getCategoryImage = (categoryName: string): string => {
    const imageMap: Record<string, string> = {
      'entretenimiento': '/icons/streaming.svg',
      'música': '/icons/music.svg',
      'software': '/icons/software.svg',
      'juegos': '/icons/games.svg',
      'educación': '/icons/education.svg',
      'productividad': '/icons/productivity.svg',
      'fitness': '/icons/fitness.svg',
      'servicios': '/icons/services.svg',
      'otros': '/icons/other.svg',
      'impuestos': '/icons/taxes.svg'
    };

    const normalizedName = categoryName.toLowerCase().trim();
    return imageMap[normalizedName] || '/icons/other.svg';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Categoría</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Imagen</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Suscripciones</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Tipo</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isDefaultCategory = !category.user_id;
            const subscriptionCount = category.subscription_count || 0;

            return (
              <tr key={category.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">{category.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <img
                        src={getCategoryImage(category.name)}
                        alt={category.name}
                        className="w-6 h-6 object-contain filter brightness-0 invert"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      {/* Fallback con inicial */}
                      <div className="hidden absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscriptionCount > 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {subscriptionCount}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {isDefaultCategory ? (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                      Predeterminada
                    </span>
                  ) : (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                      Personalizada
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {!isDefaultCategory && (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => onEdit(category)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition-all duration-200"
                        title="Editar categoría"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => onDelete(category.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          subscriptionCount > 0
                            ? 'text-gray-600 cursor-not-allowed'
                            : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                        }`}
                        title={subscriptionCount > 0 ? 'No se puede eliminar (tiene suscripciones)' : 'Eliminar categoría'}
                        disabled={subscriptionCount > 0}
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