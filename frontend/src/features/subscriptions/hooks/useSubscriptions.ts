// frontend/src/features/subscriptions/hooks/useSubscriptions.ts
import { useState, useEffect } from "react";
import type { Subscription, UseSubscriptionsReturn } from "../types";
import type { SubscriptionOrResponse } from "../../../shared/types";
import { subscriptionService } from "../service/subscriptionService";

// Normaliza la respuesta de la API: algunas operaciones devuelven { subscription },
  // otras devuelven la suscripción directamente; este helper extrae el objeto en ambos casos.
const extractSubscription = (data: SubscriptionOrResponse): Subscription => {
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
      // Validación doble: se asegura de que sea array y que cada item tenga id y
      // nombre, descartando respuestas mal formadas del backend.
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
      // Actualización optimista del estado local: se reemplaza solo la suscripción
      // modificada dentro del array, sin refetch completo.
      setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, ...updated } : sub));
      return updated;
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      // Extrae el mensaje de error del backend (error o message) y lo relanza como
      // Error, para que el formulario pueda mostrarlo al usuario.
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const errorMessage = axiosErr.response?.data?.error || axiosErr.response?.data?.message || "Error al crear la suscripción";
      throw new Error(errorMessage);
    }
  };

  const deleteSubscription = async (id: string) => {
    try {
      // Guard de validación: verifica que el id exista antes de llamar a la API.
      if (!id || typeof id !== 'string') {
        throw new Error("ID de suscripción inválido");
      }
      await subscriptionService.delete(id);
      // Eliminación local con filter inmutable: crea un nuevo array sin el elemento.
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err: unknown) {
      console.error("[HOOK DELETE] Error:", err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const errorMessage = axiosErr.response?.data?.error || "Error al eliminar la suscripción";
      throw new Error(errorMessage);
    }
  };

  // Carga inicial al montar el componente que usa el hook.
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