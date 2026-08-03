// frontend/src/features/subscriptions/service/subscriptionService.ts
import api from "../../../shared/services/api";
import type { Subscription, DashboardStats, Category, SubscriptionOrResponse } from "../../../shared/types";
import ExchangeRateService from "../../../shared/services/exchangeRateService";

// Capa de servicios (API). Esta función normaliza el monto de una suscripción: si la
  // moneda es USD la convierte a ARS usando el tipo de cambio "tarjeta" (vía el ExchangeRateService)
  // y agrega campos derivados (arsAmount, totalWithTax, etc.) que el frontend usa sin recalcular.
const calculateSubscriptionWithConversion = async (subscription: Subscription): Promise<Subscription> => {
  const amount = typeof subscription.amount === 'string' ?
    parseFloat(subscription.amount) : subscription.amount;

  if (subscription.currency === 'USD') {
    try {
      const currentRate = await ExchangeRateService.getRate('tarjeta');
      const arsAmount = amount * currentRate;
      const roundedARS = Math.round(arsAmount * 100) / 100;

      return {
        ...subscription,
        amount: roundedARS.toString(),
        currency: 'ARS',
        originalAmount: amount,
        originalCurrency: 'USD',
        arsAmount: roundedARS,
        currentExchangeRate: currentRate,
        lastUpdated: new Date().toISOString(),
        hasTax: true,
        taxAmountUSD: 0,
        totalWithTaxUSD: amount,
        totalWithTaxARS: roundedARS
      };
    } catch (error) {
      console.warn(`[CONVERSIÓN ERROR] ${subscription.name}:`, error);
      return subscription;
    }
  } else {
    return {
      ...subscription,
      originalAmount: amount,
      originalCurrency: 'ARS',
      arsAmount: amount,
      hasTax: false
    };
  }
};

export const subscriptionService = {
  async getAll(status?: string): Promise<Subscription[]> {
    try {
      const params: Record<string, string> = {};
      if (status) {
        params.status = status;
      }
      
      const response = await api.get("/subscriptions", { params });

      // Validación defensiva de la respuesta: la API puede devolver el listado en
      // response.data.subscriptions o directamente como array, y se contemplan ambos formatos.
      let subscriptions: Subscription[] = [];

      if (response.data && Array.isArray(response.data.subscriptions)) {
        subscriptions = response.data.subscriptions;
      } else if (Array.isArray(response.data)) {
        subscriptions = response.data;
      } else {
        console.warn("La API no devolvió un array válido:", response.data);
        return [];
      }

      // Se normalizan todas las suscripciones en paralelo (conversión USD→ARS) antes
      // de devolverlas, para que los componentes siempre reciban montos en ARS.
      const subscriptionsWithConversion = await Promise.all(
        subscriptions.map(calculateSubscriptionWithConversion)
      );

      return subscriptionsWithConversion;
    } catch (error) {
      // En caso de error el servicio no rompe la app: loguea y devuelve lista vacía.
      console.error("Error fetching subscriptions:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Subscription> {
    try {
      const response = await api.get(`/subscriptions/${id}`);
      const subscription = response.data.subscription || response.data;
      return await calculateSubscriptionWithConversion(subscription);
    } catch (error) {
      console.error(`Error fetching subscription ${id}:`, error);
      throw error;
    }
  },

  async create(subscription: Partial<Subscription>): Promise<SubscriptionOrResponse> {
    try {
      const subscriptionData = {
        name: subscription.name?.trim() || "",
        amount: Number(subscription.amount) || 0,
        currency: subscription.currency || "USD",
        billing_cycle: subscription.billing_cycle || "monthly",
        start_date: subscription.start_date || subscription.next_billing_date || new Date().toISOString().split('T')[0],
        next_billing_date: subscription.next_billing_date,
        category_id: subscription.category_id,
        description: subscription.description || "",
        notes: subscription.notes || "",
        status: subscription.status || "active"
      };

      const response = await api.post("/subscriptions", subscriptionData);
      const result = response.data;
      if (result.subscription) {
        result.subscription = await calculateSubscriptionWithConversion(result.subscription);
      }
      // Dispara un evento global para notificar a otros componentes (dashboard,
      // calendario) que los datos cambiaron y deben recargarse. Patrón pub/sub con CustomEvent.
      window.dispatchEvent(new CustomEvent("subscriptions-changed"));
      return result;
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("[SERVICE CREATE] Error:", err.response?.data || err.message);
      throw error;
    }
  },

  async update(id: string, subscription: Partial<Subscription>): Promise<SubscriptionOrResponse> {
    try {
      const subscriptionData: Record<string, string | number | undefined | null> = {};

      if (subscription.name !== undefined) subscriptionData.name = subscription.name.trim();
      if (subscription.amount !== undefined) subscriptionData.amount = Number(subscription.amount);
      if (subscription.currency !== undefined) subscriptionData.currency = subscription.currency;
      if (subscription.billing_cycle !== undefined) subscriptionData.billing_cycle = subscription.billing_cycle;
      if (subscription.next_billing_date !== undefined) subscriptionData.next_billing_date = subscription.next_billing_date;
      if (subscription.category_id !== undefined) subscriptionData.category_id = subscription.category_id ?? null;
      if (subscription.description !== undefined) subscriptionData.description = subscription.description ?? null;
      if (subscription.notes !== undefined) subscriptionData.notes = subscription.notes ?? null;
      if (subscription.status !== undefined) subscriptionData.status = subscription.status;

      console.log("📤 [SERVICE UPDATE] Sending to API:", { url: `/subscriptions/${id}`, data: subscriptionData });

      const response = await api.put(`/subscriptions/${id}`, subscriptionData);
      window.dispatchEvent(new CustomEvent("subscriptions-changed"));

      // Si el backend no devuelve el category_name en la respuesta (por no hacer join
      // de categorías), se re-fetch de la suscripción completa para garantizar datos consistentes.
      if (response.data.subscription && response.data.subscription.category_name) {
        return response.data;
      } else {
        const completeSubscription = await this.getById(id);
        return {
          message: response.data.message || "Subscription updated successfully",
          subscription: completeSubscription
        };
      }

    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      console.error("[SERVICE UPDATE] Error:", err.response?.data || err.message);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/subscriptions/${id}`);
      window.dispatchEvent(new CustomEvent("subscriptions-changed"));
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
      throw error;
    }
  },

  async payNow(id: string, payment_method?: string): Promise<void> {
    try {
      // Endpoint específico para marcar el pago: además de refrescar suscripciones,
      // dispara "debts-changed" porque pagar una suscripción puede generar/afectar deudas.
      await api.post(`/subscriptions/${id}/pay`, { payment_method: payment_method || null });
      window.dispatchEvent(new CustomEvent("subscriptions-changed"));
      window.dispatchEvent(new CustomEvent("debts-changed"));
    } catch (error) {
      console.error(`Error paying subscription ${id}:`, error);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get("/subscriptions/dashboard/stats");
      return response.data.stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get("/categories");

      let categories: Category[] = [];

      if (response.data && Array.isArray(response.data.categories)) {
        categories = response.data.categories;
      } else if (Array.isArray(response.data)) {
        categories = response.data;
      } else {
        console.warn("La API no devolvió un array válido de categorías:", response.data);
        return [];
      }

      // Elimina duplicados de categorías por nombre (case-insensitive) usando findIndex,
      // para evitar opciones repetidas en los selectores.
      const uniqueCategories = categories.filter((category, index, self) =>
        index === self.findIndex(c =>
          c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
        )
      );

      return uniqueCategories;
    } catch (error: unknown) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};