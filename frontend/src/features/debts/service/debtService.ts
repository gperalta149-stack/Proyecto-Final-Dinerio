// frontend/src/features/debts/service/debtService.ts
import api from "../../../shared/services/api";
import type { Debt, DebtsSummary } from "../types";

export const debtService = {
  // Capa de servicios de deudas: encapsula todas las llamadas HTTP al backend
  // (GET/POST/PUT/DELETE) y normaliza la respuesta (response.data.debts).
  async getAll(): Promise<Debt[]> {
    const response = await api.get("/debts");
    return response.data.debts || [];
  },

  // Resumen agregado de deudas calculado en el servidor (totales en ARS/USD, deudas
  // pendientes, la más antigua, pagos del mes) con valores por defecto defensivos.
  async getSummary(): Promise<DebtsSummary> {
    const response = await api.get("/debts/summary");
    const data = response.data;
    return {
      totalOwed: data.totalOwed || 0,
      totalOwedUSD: data.totalOwedUSD || 0,
      totalOwedConverted: data.totalOwedConverted || data.totalOwed || 0,
      exchangeRate: data.exchangeRate || 1,
      pendingCount: data.pendingCount || 0,
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
    // Tras cada mutación se emite "debts-changed" para que los componentes
    // suscriptos (dashboard, pagos) refresquen sus datos automáticamente.
    window.dispatchEvent(new CustomEvent("debts-changed"));
    return response.data.debt;
  },

  // Marca una deuda como pagada. amount_ars se envía si la deuda original era USD
  // (permite guardar el equivalente en pesos pagado).
  async markAsPaid(id: string, payment_method?: string, amount_ars?: number): Promise<void> {
    await api.put(`/debts/${id}/pay`, { payment_method, amount_ars });
    window.dispatchEvent(new CustomEvent("debts-changed"));
  },

  // Endpoint para posponer una deuda (reprograma la fecha de vencimiento en días).
  async postpone(id: string, days: number = 7): Promise<void> {
    await api.put(`/debts/${id}/postpone`, { days });
    window.dispatchEvent(new CustomEvent("debts-changed"));
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/debts/${id}`);
    window.dispatchEvent(new CustomEvent("debts-changed"));
  },
};