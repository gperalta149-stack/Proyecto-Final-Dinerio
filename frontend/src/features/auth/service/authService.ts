import api from '../../../shared/services/api';
import type { User } from '../../../shared/types';

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  async register(email: string, password: string, firstName: string, lastName: string): Promise<LoginResponse> {
    const response = await api.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName
    });
    return response.data;
  },
  async getCurrentUser(): Promise<{ user: User }> {
    const response = await api.get('/users/profile');
    return response.data;
  },
  async updateBudget(monthlyBudget: number): Promise<{ message: string; user: User }> {
    const response = await api.put('/users/profile', {
      monthly_budget: monthlyBudget
    });
    return response.data;
  },
  async logout(): Promise<void> {
    return Promise.resolve();
  },
  async validateToken(): Promise<boolean> {
    try {
      await api.get('/users/profile');
      return true;
    } catch (error) {
      return false;
    }
  }
};
