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
  // Hook que expone el estado del dashboard: stats del backend, listado de
  // suscripciones, flags de loading/error y una función refresh para recargar datos.
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dos llamadas en paralelo: stats agregadas del backend y todas las suscripciones
      // (con 'all' se incluyen paused/cancelled para mostrar el estado completo).
      const [statsData, subscriptionsData] = await Promise.all([
        subscriptionService.getDashboardStats(),
        subscriptionService.getAll('all'), // Pasar 'all' para traer todas
      ]);
      
      setStats(statsData);
      setSubscriptions(subscriptionsData);
    } catch (err) {
      // Manejo de error: se guarda el mensaje para mostrarlo en la UI en lugar de
      // romper la app; el finally garantiza que loading vuelva a false siempre.
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  // useEffect con dependencias vacías ejecuta la carga inicial al montar el componente.
  useEffect(() => {
    loadData();
  }, []);

  return { stats, subscriptions, loading, error, refresh: loadData };
};