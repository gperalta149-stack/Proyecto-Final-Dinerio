// frontend/src/features/subscriptions/service/subscriptionService.ts
import api from "../../../shared/services/api";
import type { Subscription, DashboardStats, Category, SubscriptionOrResponse } from "../../../shared/types";
import ExchangeRateService from "../../../shared/services/exchangeRateService";

const calculateSubscriptionWithConversion = async (subscription: Subscription): Promise<Subscription> => {
  const amount = typeof subscription.amount === 'string' ?
    parseFloat(subscription.amount) : subscription.amount;

  if (subscription.currency === 'USD') {
    try {
      const currentRate = await ExchangeRateService.getRate('oficial');
      const arsAmount = amount * currentRate * 1.54;
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
        taxAmountUSD: amount * 0.54,
        totalWithTaxUSD: amount * 1.54,
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
      const params: Record<string, any> = {};
      if (status) {
        params.status = status;
      }
      
      const response = await api.get("/subscriptions", { params });

      let subscriptions: Subscription[] = [];

      if (response.data && Array.isArray(response.data.subscriptions)) {
        subscriptions = response.data.subscriptions;
      } else if (Array.isArray(response.data)) {
        subscriptions = response.data;
      } else {
        console.warn("La API no devolvió un array válido:", response.data);
        return [];
      }

      const subscriptionsWithConversion = await Promise.all(
        subscriptions.map(calculateSubscriptionWithConversion)
      );

      return subscriptionsWithConversion;
    } catch (error) {
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
      return response.data;
    } catch (error: any) {
      console.error("[SERVICE CREATE] Error:", error.response?.data || error.message);
      throw error;
    }
  },

  async update(id: string, subscription: Partial<Subscription>): Promise<SubscriptionOrResponse> {
    try {
      const subscriptionData: any = {};

      if (subscription.name !== undefined) subscriptionData.name = subscription.name.trim();
      if (subscription.amount !== undefined) subscriptionData.amount = Number(subscription.amount);
      if (subscription.currency !== undefined) subscriptionData.currency = subscription.currency;
      if (subscription.billing_cycle !== undefined) subscriptionData.billing_cycle = subscription.billing_cycle;
      if (subscription.next_billing_date !== undefined) subscriptionData.next_billing_date = subscription.next_billing_date;
      if (subscription.category_id !== undefined) subscriptionData.category_id = subscription.category_id;
      if (subscription.description !== undefined) subscriptionData.description = subscription.description;
      if (subscription.notes !== undefined) subscriptionData.notes = subscription.notes;
      if (subscription.status !== undefined) subscriptionData.status = subscription.status;

      console.log("📤 [SERVICE UPDATE] Sending to API:", { url: `/subscriptions/${id}`, data: subscriptionData });

      const response = await api.put(`/subscriptions/${id}`, subscriptionData);

      console.log("📥 [SERVICE UPDATE] Response:", response.data);

      if (response.data.subscription && response.data.subscription.category_name) {
        return response.data;
      } else {
        console.log("🔄 [SERVICE UPDATE] No category_name in response, fetching complete subscription...");
        const completeSubscription = await this.getById(id);
        console.log("✅ [SERVICE UPDATE] Complete subscription fetched:", completeSubscription);
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
      await api.delete(`/subscriptions/${id}`);
    } catch (error) {
      console.error(`Error deleting subscription ${id}:`, error);
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

      const uniqueCategories = categories.filter((category, index, self) =>
        index === self.findIndex(c =>
          c.name.trim().toLowerCase() === category.name.trim().toLowerCase()
        )
      );

      return uniqueCategories;
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};