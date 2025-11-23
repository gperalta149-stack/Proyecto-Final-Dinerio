import api from "./api"
import type { FinancialReport } from "../types"

export interface MonthlyEvolution {
  month: number;
  year: number;
  subscription_count: number;
  monthly_total: number;
}

export const reportService = {
  async exportCSV(month?: number, year?: number): Promise<Blob> {
    const params: Record<string, any> = {}
    if (month) params.month = month
    if (year) params.year = year

    const response = await api.get("/reports/export/csv", {
      params,
      responseType: "blob",
    })
    return response.data
  },

  async getFinancialReport(month?: number, year?: number): Promise<FinancialReport> {
    const params: Record<string, any> = {}
    if (month) params.month = month
    if (year) params.year = year

    console.log('[REPORT SERVICE] Fetching financial report for:', { month, year });
    
    const response = await api.get("/reports/financial", { params })
    
    console.log('[REPORT SERVICE] Financial report summary:', response.data.summary);
    
    return response.data
  },

  async getMonthlyEvolution(year?: number): Promise<{ monthlyEvolution: MonthlyEvolution[] }> {
    const params: Record<string, any> = {}
    if (year) params.year = year

    console.log('[REPORT SERVICE] Fetching monthly evolution for year:', year || 'current');
    
    const response = await api.get("/reports/monthly-evolution", { params })
    
    console.log('[REPORT SERVICE] Raw response from backend:', response.data);
    
    // Verificar la estructura y valores de los datos
    if (response.data.monthlyEvolution) {
      console.log('[REPORT SERVICE] Monthly evolution data:');
      response.data.monthlyEvolution.forEach((month: MonthlyEvolution) => {
        const amount = month.monthly_total;
        const looksLikeUSD = amount < 1000; // Montos en USD suelen ser < $1000
        const looksLikeARS = amount > 10000; // Montos en ARS suelen ser > $10,000
        
        console.log(`   🗓️  Month ${month.month}: $${amount.toLocaleString()} | ${month.subscription_count} subs | ${looksLikeUSD ? '💰 USD' : looksLikeARS ? '💵 ARS' : '❓ UNKNOWN'}`);
      });
      
      // Calcular total anual desde el backend
      const totalFromBackend = response.data.monthlyEvolution.reduce((sum: number, month: MonthlyEvolution) => sum + month.monthly_total, 0);
      console.log('[REPORT SERVICE] Total anual desde backend:', totalFromBackend.toLocaleString());
    }
    
    return response.data
  },
}