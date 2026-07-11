// frontend/src/features/categories/service/categoryService.ts
import api from "../../../shared/services/api";
import type { Category } from "../types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get("/categories");

      let categories: Category[] = [];

      if (response.data && Array.isArray(response.data.categories)) {
        categories = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn("La API no devolvió un array válido:", response.data);
        return [];
      }

      return categories;
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },

  async create(categoryData: Partial<Category>): Promise<Category> {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data.category;
    } catch (error: any) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data.category;
    } catch (error: any) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error: any) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};