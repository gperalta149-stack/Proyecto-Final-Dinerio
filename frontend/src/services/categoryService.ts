import api from "./api";
import type { Category } from "../types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      console.log("🔄 [CATEGORY SERVICE] Solicitando categorías desde /categories...");
      
      const response = await api.get("/categories");
      console.log("📋 [CATEGORY SERVICE] Respuesta completa:", response.data);
      
      let categories: Category[] = [];
      
      if (response.data && Array.isArray(response.data.categories)) {
        categories = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn("❌ [CATEGORY SERVICE] La API no devolvió un array válido:", response.data);
        return [];
      }

      // AGREGAR ESTO: Log detallado de cada categoría
      console.log("🔍 [CATEGORY SERVICE] Estructura de una categoría:", categories[0]);
      console.log("📋 [CATEGORY SERVICE] Propiedades disponibles:", categories[0] ? Object.keys(categories[0]) : 'No hay categorías');
      
      console.log(`✅ [CATEGORY SERVICE] Categorías recibidas: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.id}) - subscription_count: ${cat.subscription_count}`);
      });
      
      return categories;
    } catch (error: any) {
      console.error(" [CATEGORY SERVICE] Error fetching categories:", error);
      console.error("   URL intentada:", error.config?.url);
      console.error("   Método:", error.config?.method);
      console.error("   Status:", error.response?.status);
      console.error("   Data:", error.response?.data);
      throw error;
    }
  },

  async create(categoryData: Partial<Category>): Promise<Category> {
    try {
      console.log("[CATEGORY SERVICE] Creando categoría:", categoryData);
      const response = await api.post("/categories", categoryData);
      console.log("[CATEGORY SERVICE] Categoría creada:", response.data);
      return response.data.category;
    } catch (error: any) {
      console.error("[CATEGORY SERVICE] Error creating category:", error);
      console.error("Error response:", error.response?.data);
      throw error;
    }
  },

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    try {
      console.log("📤 [CATEGORY SERVICE] Actualizando categoría:", id, categoryData);
      const response = await api.put(`/categories/${id}`, categoryData);
      console.log("✅ [CATEGORY SERVICE] Categoría actualizada:", response.data);
      return response.data.category;
    } catch (error: any) {
      console.error(`❌ [CATEGORY SERVICE] Error updating category ${id}:`, error);
      console.error("📡 Error response:", error.response?.data);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log("🗑️ [CATEGORY SERVICE] Eliminando categoría:", id);
      await api.delete(`/categories/${id}`);
      console.log("✅ [CATEGORY SERVICE] Categoría eliminada");
    } catch (error: any) {
      console.error(`❌ [CATEGORY SERVICE] Error deleting category ${id}:`, error);
      console.error("📡 Error response:", error.response?.data);
      throw error;
    }
  }
};