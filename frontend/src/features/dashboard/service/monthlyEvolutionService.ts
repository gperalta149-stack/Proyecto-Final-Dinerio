// frontend/src/features/dashboard/service/monthlyEvolutionService.ts
import api from '../../../shared/services/api';

export interface MonthlyEvolutionData {
  year: number;
  month: number;
  monthName: string;
  total: number;
  count: number;
}

export const monthlyEvolutionService = {
  async getLastSixMonths(): Promise<MonthlyEvolutionData[]> {
    const response = await api.get('/dashboard/monthly-evolution');
    return response.data;
  }
};