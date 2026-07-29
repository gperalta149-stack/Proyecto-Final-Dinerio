import api from '../../../shared/services/api';
import type { MonthlyBudget } from '../../../shared/types';

export const budgetService = {
  async getBudgetForMonth(year: number, month: number): Promise<MonthlyBudget | null> {
    const response = await api.get(`/budgets/${year}/${month}`);
    return response.data.budget;
  },

  async upsertBudget(year: number, month: number, budget_amount: number, alert_threshold: number = 80): Promise<MonthlyBudget> {
    const response = await api.put(`/budgets/${year}/${month}`, {
      budget_amount,
      alert_threshold,
    });
    window.dispatchEvent(new CustomEvent("budget-changed"));
    return response.data.budget;
  },

  async deleteBudget(year: number, month: number): Promise<void> {
    await api.delete(`/budgets/${year}/${month}`);
    window.dispatchEvent(new CustomEvent("budget-changed"));
  },
};
