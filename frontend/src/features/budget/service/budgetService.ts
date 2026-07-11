// frontend/src/features/budget/service/budgetService.ts
import api from '../../../shared/services/api';
import type { User } from '../../../shared/types';

export const budgetService = {
  async getBudget(): Promise<{ budget: number; alertThreshold: number }> {
    const response = await api.get('/users/profile');
    return {
      budget: response.data.user.monthly_budget || 0,
      alertThreshold: response.data.user.alert_threshold || 80,
    };
  },

  async updateBudget(budget: number): Promise<User> {
    const response = await api.put('/users/profile', {
      monthly_budget: budget,
    });
    return response.data.user;
  },

  async updateAlertThreshold(threshold: number): Promise<void> {
    await api.put('/users/profile', {
      alert_threshold: threshold,
    });
  },
};
