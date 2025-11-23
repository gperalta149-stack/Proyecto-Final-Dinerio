"use client"

import { useState, useEffect } from "react"
import type { Subscription, SubscriptionOrResponse } from "../types"
import { subscriptionService } from '../services/subscriptionService'

const extractSubscription = (data: SubscriptionOrResponse): Subscription => {
  if ('subscription' in data) {
    return data.subscription;
  }
  return data;
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 [HOOK] Iniciando carga de suscripciones...');
      
      const data = await subscriptionService.getAll()
      
      console.log("🔄 [HOOK] Datos crudos del servicio:", data);
      
      const safeData = Array.isArray(data) ? data : []
      
      const validSubscriptions = safeData
        .filter(sub => sub && sub.id && sub.name)
        .map(sub => {
          if ('subscription' in sub) {
            return extractSubscription(sub);
          }
          return sub as Subscription;
        })
      
      console.log("[HOOK] Subscriptions procesadas:", validSubscriptions.length, "items válidos");
      console.log("[HOOK] Montos actuales:", validSubscriptions.map(s => ({ name: s.name, amount: s.amount })));
      
      setSubscriptions(validSubscriptions)
      
    } catch (err) {
      console.error("[HOOK] Error cargando suscripciones:", err)
      setError("Error al cargar las suscripciones")
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const updateSubscription = async (id: string, subscription: Partial<Subscription>) => {
    try {
      console.log('🔄 [HOOK UPDATE] Iniciando actualización...', {
        id,
        subscriptionData: subscription
      });
      
      const response = await subscriptionService.update(id, subscription)
      
      console.log('🔍 [HOOK UPDATE] Respuesta CRUDA del service:', response)
      
      const updated = extractSubscription(response)
      
      console.log("[HOOK UPDATE] Suscripción extraída:", updated)
      console.log("[HOOK UPDATE] Campos de categoría:", {
        category_id: updated.category_id,
        category_name: updated.category_name,
        category_color: updated.category_color,
        category_icon: updated.category_icon
      })

      setSubscriptions(prev => {
        const nuevasSubs = prev.map(sub => {
          if (sub.id === id) {
            const updatedSub = {
              ...sub,
              ...updated
            }
            console.log('[HOOK UPDATE] Suscripción actualizada:', updatedSub)
            return updatedSub
          }
          return sub
        });
        
        return nuevasSubs;
      });
      
      return updated
    } catch (err: any) {
      console.error("[HOOK UPDATE] Error:", err)
      throw err
    }
  }

  const addSubscription = async (subscription: Partial<Subscription>) => {
    try {
      console.log("[HOOK CREATE] Iniciando creación de suscripción...", subscription)
      
      const response = await subscriptionService.create(subscription)
      const newSub = extractSubscription(response)
      
      console.log("[HOOK CREATE] Suscripción creada:", newSub)
      
      if (!newSub.id) {
        console.warn("La suscripción creada no tiene ID válido:", newSub)
      }
      
      setSubscriptions(prev => {
        const nuevasSubs = [...prev, newSub];
        console.log("[HOOK CREATE] Nueva suscripción agregada al estado. Total:", nuevasSubs.length);
        return nuevasSubs;
      });
      
      return newSub
    } catch (err: any) {
      console.error("[HOOK CREATE] Error detallado:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        errors: err.response?.data?.errors,
      })
      
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al crear la suscripción"
      throw new Error(errorMessage)
    }
  }

  const deleteSubscription = async (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error("ID de suscripción inválido")
      }
      
      await subscriptionService.delete(id)
      
      setSubscriptions(prev => {
        const nuevasSubs = prev.filter(sub => sub.id !== id);
        console.log("[HOOK DELETE] Suscripción eliminada del estado. Restantes:", nuevasSubs.length);
        return nuevasSubs;
      });
      
    } catch (err: any) {
      console.error("[HOOK DELETE] Error eliminando suscripción:", err)
      const errorMessage = err.response?.data?.error || "Error al eliminar la suscripción"
      throw new Error(errorMessage)
    }
  }

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  }
}