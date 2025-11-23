import api from "./api"
import type { User } from "../types"

export interface UserSettings {
  currency: string;
  language: string;
  notifications_enabled: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    try {
      const response = await api.get("/users/profile")
      console.log('📊 Perfil obtenido:', response.data)
      return response.data.user
    } catch (error) {
      console.error('Error getting profile:', error)
      throw error
    }
  },

  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    try {
      const response = await api.put("/users/profile", userData)
      console.log('Perfil actualizado:', response.data)
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  async updateSettings(settings: UserSettings): Promise<{ settings: UserSettings; message: string }> {
    try {
      const response = await api.put("/users/settings", settings)
      return response.data
    } catch (error) {
      console.error('Error updating settings:', error)
      throw error
    }
  },

  async updateBudget(monthlyBudget: number): Promise<{ message: string; user: User }> {
    try {
      console.log('Enviando actualización de presupuesto:', monthlyBudget)
      const response = await api.put("/users/budget", { monthly_budget: monthlyBudget })
      console.log('Presupuesto actualizado en backend:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error updating budget:', error.response?.data || error.message)
      throw error
    }
  },

  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await api.put("/users/change-password", passwordData)
      return response.data
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}