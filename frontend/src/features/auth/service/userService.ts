import api from "../../../shared/services/api"
import type { User } from "../../../shared/types"

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
    const response = await api.get("/users/profile")
    return response.data.user
  },
  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    const response = await api.put("/users/profile", userData)
    return response.data
  },
  async updateSettings(settings: UserSettings): Promise<{ settings: UserSettings; message: string }> {
    const response = await api.put("/users/settings", settings)
    return response.data
  },
  async updateBudget(monthlyBudget: number): Promise<{ message: string; user: User }> {
    const response = await api.put("/users/budget", { monthly_budget: monthlyBudget })
    return response.data
  },
  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    const response = await api.put("/users/password", passwordData)
    return response.data
  }
}
