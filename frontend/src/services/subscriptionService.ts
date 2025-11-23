import api from "./api"
import type { Subscription, DashboardStats, Category, SubscriptionOrResponse } from "../types"
import ExchangeRateService from "./exchangeRateService"

// Función helper para calcular conversiones - MEJORADA
const calculateSubscriptionWithConversion = async (subscription: Subscription): Promise<Subscription> => {
  const amount = typeof subscription.amount === 'string' ? 
    parseFloat(subscription.amount) : subscription.amount;
  
  console.log(`[CONVERSIÓN] Procesando: ${subscription.name}`, {
    monto_original: `${subscription.currency} ${amount}`,
    ciclo: subscription.billing_cycle
  });
  
  if (subscription.currency === 'USD') {
    try {
      const currentRate = await ExchangeRateService.getRate('blue');
      const withTax = amount * 1.75; // 75% de impuestos
      const arsAmount = withTax * currentRate;
      const roundedARS = Math.round(arsAmount * 100) / 100;
      
      console.log(`[CONVERSIÓN USD] ${subscription.name}:`, {
        monto_original: `USD ${amount}`,
        con_impuestos: `USD ${withTax.toFixed(2)}`,
        tipo_cambio: `ARS ${currentRate}`,
        resultado: `ARS ${roundedARS}`
      });

    
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
        taxAmountUSD: amount * 0.75,
        totalWithTaxUSD: amount * 1.75,
        totalWithTaxARS: roundedARS
      };
    } catch (error) {
      console.warn(`[CONVERSIÓN ERROR] ${subscription.name}:`, error);
      return subscription;
    }
  } else {
    console.log(`ℹ[CONVERSIÓN ARS] ${subscription.name}: Mantiene ARS ${amount}`);
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
  async getAll(): Promise<Subscription[]> {
    try {
      const response = await api.get("/subscriptions")
      console.log("📡 GET /subscriptions response:", response.data)
      
      let subscriptions: Subscription[] = [];
      
      if (response.data && Array.isArray(response.data.subscriptions)) {
        subscriptions = response.data.subscriptions;
      } else if (Array.isArray(response.data)) {
        subscriptions = response.data;
      } else {
        console.warn("La API no devolvió un array válido:", response.data)
        return []
      }

      // Calcular conversiones para cada suscripción
      const subscriptionsWithConversion = await Promise.all(
        subscriptions.map(calculateSubscriptionWithConversion)
      );

      console.log("Suscripciones con conversión aplicada:", subscriptionsWithConversion.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        arsAmount: sub.arsAmount,
        billing_cycle: sub.billing_cycle
      })));

      return subscriptionsWithConversion;
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      return []
    }
  },

  async getById(id: string): Promise<Subscription> {
    try {
      console.log("[SERVICE GET BY ID] Obteniendo suscripción completa:", id);
      const response = await api.get(`/subscriptions/${id}`);
      
      const subscription = response.data.subscription || response.data;
      console.log("[SERVICE GET BY ID] Suscripción obtenida:", {
        id: subscription.id,
        category_id: subscription.category_id,
        category_name: subscription.category_name,
        has_category_data: !!subscription.category_name
      });
      
      return await calculateSubscriptionWithConversion(subscription);
    } catch (error) {
      console.error(`[SERVICE GET BY ID] Error fetching subscription ${id}:`, error);
      throw error;
    }
  },

  async create(subscription: Partial<Subscription>): Promise<SubscriptionOrResponse> {
    try {
      console.log("[SERVICE CREATE] Creando suscripción con datos:", subscription);
      
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
      }

      console.log("[SERVICE CREATE] Datos finales para backend:", subscriptionData);
      
      const response = await api.post("/subscriptions", subscriptionData);
      console.log("[SERVICE CREATE] Respuesta del backend:", response.data);
      
      return response.data;
    } catch (error: any) {
      console.error("[SERVICE CREATE] Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async update(id: string, subscription: Partial<Subscription>): Promise<SubscriptionOrResponse> {
    try {
      console.log("[SERVICE UPDATE] Iniciando actualización...", { id, subscription });

      const subscriptionData: any = {}
      
      if (subscription.name !== undefined) subscriptionData.name = subscription.name.trim()
      if (subscription.amount !== undefined) subscriptionData.amount = Number(subscription.amount)
      if (subscription.currency !== undefined) subscriptionData.currency = subscription.currency
      if (subscription.billing_cycle !== undefined) subscriptionData.billing_cycle = subscription.billing_cycle
      if (subscription.next_billing_date !== undefined) subscriptionData.next_billing_date = subscription.next_billing_date
      if (subscription.category_id !== undefined) subscriptionData.category_id = subscription.category_id
      if (subscription.description !== undefined) subscriptionData.description = subscription.description
      if (subscription.notes !== undefined) subscriptionData.notes = subscription.notes
      if (subscription.status !== undefined) subscriptionData.status = subscription.status

      console.log("[SERVICE UPDATE] Enviando al backend:", subscriptionData);
      
      const response = await api.put(`/subscriptions/${id}`, subscriptionData);
      console.log("[SERVICE UPDATE] Respuesta recibida:", response.data);
      
      if (response.data.subscription && response.data.subscription.category_name) {
        console.log("[SERVICE UPDATE] Datos completos recibidos con categoría");
        return response.data;
      } else {
        console.log("[SERVICE UPDATE] Obteniendo datos completos...");
        const completeSubscription = await this.getById(id);
        return { 
          message: response.data.message || "Subscription updated successfully",
          subscription: completeSubscription
        };
      }
      
    } catch (error: any) {
      console.error("[SERVICE UPDATE] Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/subscriptions/${id}`)
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error)
      throw error
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get("/users/dashboard")
      return response.data
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      throw error
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      console.log("🔄 === SOLICITANDO CATEGORÍAS AL BACKEND ===")
      
      const response = await api.get("/categories")
      console.log("Respuesta completa del backend:", response.data)
      
      let categories: Category[] = []
      
      if (response.data && Array.isArray(response.data.categories)) {
        categories = response.data.categories
      } else if (Array.isArray(response.data)) {
        categories = response.data
      } else {
        console.warn("La API no devolvió un array válido de categorías:", response.data)
        return []
      }
      
      console.log(`Categorías recibidas: ${categories.length}`)
      
      const uniqueCategories = categories.filter((category, index, self) =>
        index === self.findIndex(c =>
          c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
        )
      )
      
      console.log(`Categorías únicas después de filtro: ${uniqueCategories.length}`)
      console.log("Lista final:", uniqueCategories.map(cat => cat.name))
      
      return uniqueCategories
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      return []
    }
  },
}