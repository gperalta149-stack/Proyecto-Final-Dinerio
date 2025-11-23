import api from './api';
import type { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('🔐 Intentando login para:', email);
    console.log('📡 URL base de API:', api.defaults.baseURL);
    
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Login exitoso:', response.data);
    return response.data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<LoginResponse> {
    console.log('📝 Intentando registro para:', email);
    
    const response = await api.post('/auth/register', {
      email,
      password,
      first_name: firstName,
      last_name: lastName
    });
    
    console.log('✅ Registro exitoso:', response.data);
    return response.data;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    console.log('🔄 Obteniendo usuario actual...');
    const response = await api.get('/users/profile');
    console.log('✅ Usuario obtenido:', response.data);
    return response.data;
  },

  async updateBudget(monthlyBudget: number): Promise<{ message: string; user: User }> {
    console.log('💰 Actualizando presupuesto:', monthlyBudget);
    const response = await api.put('/users/profile', {
      monthly_budget: monthlyBudget
    });
    console.log('✅ Presupuesto actualizado:', response.data);
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('🚪 Logout - solo del lado del cliente');
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