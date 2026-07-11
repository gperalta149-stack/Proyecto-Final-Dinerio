// frontend/src/features/profile/hooks/useProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../auth/service/userService';
import type { User } from '../types';

interface UseProfileReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateBudget: (budget: number) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      await userService.updateProfile(data);
      await loadUserData();
    } catch (err) {
      throw new Error('Error al actualizar perfil');
    }
  }, [loadUserData]);

  const updateBudget = useCallback(async (budget: number) => {
    try {
      await userService.updateBudget(budget);
      await loadUserData();
    } catch (err) {
      throw new Error('Error al actualizar presupuesto');
    }
  }, [loadUserData]);

  const updateSettings = useCallback(async (settings: any) => {
    try {
      await userService.updateSettings(settings);
      await loadUserData();
    } catch (err) {
      throw new Error('Error al actualizar configuración');
    }
  }, [loadUserData]);

  return {
    user,
    loading,
    error,
    updateProfile,
    updateBudget,
    updateSettings,
    refresh: loadUserData,
  };
};