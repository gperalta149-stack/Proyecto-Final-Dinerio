// frontend/src/features/reports/service/reportService.ts
import api from "../../../shared/services/api";
import type { FinancialReport } from "../../../shared/types";

export interface MonthlyEvolutionData {
  month: number;
  year: number;
  monthName: string;
  monthly_total: number;
  subscription_count: number;
}

export const reportService = {
  async exportCSV(month?: number, year?: number): Promise<Blob> {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get("/reports/export/csv", {
      params,
      responseType: "blob",
    });
    return response.data;
  },

  async getFinancialReport(month?: number, year?: number, range?: number | null, rangeMode?: string): Promise<FinancialReport> {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (range) params.range = range;
    if (rangeMode) params.rangeMode = rangeMode;

    const response = await api.get("/reports/financial", { params });
    return response.data;
  },

  async getMonthlyEvolution(year?: number): Promise<{ monthlyEvolution: MonthlyEvolutionData[] }> {
    const params: Record<string, any> = {};
    if (year) params.year = year;

    const response = await api.get("/reports/monthly-evolution", { params });
    return response.data;
  },
};