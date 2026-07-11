// frontend/src/features/dashboard/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import type { Subscription, DashboardStats } from '../types';
import { subscriptionService } from '../../subscriptions/service/subscriptionService';

interface UseDashboardReturn {
  stats: DashboardStats | null;
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Traer TODAS las suscripciones (incluyendo paused, cancelled)
      const [statsData, subscriptionsData] = await Promise.all([
        subscriptionService.getDashboardStats(),
        subscriptionService.getAll('all'), // Pasar 'all' para traer todas
      ]);
      
      setStats(statsData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { stats, subscriptions, loading, error, refresh: loadData };
};