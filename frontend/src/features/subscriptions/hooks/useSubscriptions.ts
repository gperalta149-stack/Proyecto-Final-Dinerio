// frontend/src/features/subscriptions/hooks/useSubscriptions.ts
import { useState, useEffect } from "react";
import type { Subscription, UseSubscriptionsReturn } from "../types";
import { subscriptionService } from "../service/subscriptionService";

const extractSubscription = (data: any): Subscription => {
  if ('subscription' in data) {
    return data.subscription;
  }
  return data;
};

export const useSubscriptions = (): UseSubscriptionsReturn => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await subscriptionService.getAll();
      const safeData = Array.isArray(data) ? data : [];
      const validSubscriptions = safeData
        .filter(sub => sub && sub.id && sub.name)
        .map(sub => 'subscription' in sub ? extractSubscription(sub) : sub as Subscription);

      setSubscriptions(validSubscriptions);
    } catch (err) {
      console.error("[HOOK] Error cargando suscripciones:", err);
      setError("Error al cargar las suscripciones");
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    try {
      const response = await subscriptionService.update(id, subscription);
      const updated = extractSubscription(response);
      setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updated } : sub));
      return updated;
    } catch (err: any) {
      console.error("[HOOK UPDATE] Error:", err);
      throw err;
    }
  };

  const addSubscription = async (subscription: Partial<Subscription>) => {
    try {
      const response = await subscriptionService.create(subscription);
      const newSub = extractSubscription(response);
      setSubscriptions(prev => [...prev, newSub]);
      return newSub;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al crear la suscripción";
      throw new Error(errorMessage);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error("ID de suscripción inválido");
      }
      await subscriptionService.delete(id);
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err: any) {
      console.error("[HOOK DELETE] Error:", err);
      const errorMessage = err.response?.data?.error || "Error al eliminar la suscripción";
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
};