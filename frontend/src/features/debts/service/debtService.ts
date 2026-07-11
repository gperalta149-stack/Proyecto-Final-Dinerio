// frontend/src/features/debts/service/debtService.ts
import api from "../../../shared/services/api";
import type { Debt, DebtsSummary } from "../types";

export const debtService = {
  async getAll(): Promise<Debt[]> {
    const response = await api.get("/debts");
    return response.data.debts || [];
  },

  async getSummary(): Promise<DebtsSummary> {
    const response = await api.get("/debts/summary");
    // Asegurar que paidCount existe
    const data = response.data;
    return {
      totalOwed: data.totalOwed || 0,
      pendingCount: data.pendingCount || 0,
      paidCount: data.paidCount || 0,
      oldestDays: data.oldestDays || 0,
      oldestName: data.oldestName,
      paidThisMonthCount: data.paidThisMonthCount || 0,
    };
  },

  async create(debt: { 
    name: string; 
    amount: number; 
    currency?: string; 
    due_date: string; 
    category_id?: string;
    notes?: string;
  }): Promise<Debt> {
    const response = await api.post("/debts", debt);
    return response.data.debt;
  },

  async markAsPaid(id: string): Promise<void> {
    await api.put(`/debts/${id}/pay`);
  },

  async postpone(id: string, days: number = 7): Promise<void> {
    await api.put(`/debts/${id}/postpone`, { days });
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/debts/${id}`);
  },
};