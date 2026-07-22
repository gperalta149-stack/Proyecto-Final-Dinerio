// frontend/src/features/budget/hooks/useBudget.ts
import { useState, useEffect, useMemo } from "react";
import { userService } from "../../auth/service/userService";
import { useSubscriptions } from "../../subscriptions/hooks/useSubscriptions";
import { useExchangeRate } from "../../../shared/hooks/useExchangeRate";
import { parseAmount } from "../../../shared/utils/formatters";
import type { User } from "../../../shared/types";

interface UseBudgetReturn {
  user: User | null;
  budget: number;
  alertThreshold: number;
  spent: number;
  available: number;
  percentageUsed: number;
  daysRemaining: number;
  dailyAllowance: number;
  projectedSpending: number;
  loading: boolean;
  updateBudget: (newBudget: number, threshold: number) => Promise<void>;
}

export const useBudget = (): UseBudgetReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const { subscriptions } = useSubscriptions();
  const { convertUSDToARS } = useExchangeRate('oficial');

  const budget = user?.monthly_budget || 0;

  const spent = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active') return total;
      const amount = parseAmount(sub.amount);
      if (sub.currency === 'USD') {
        return total + convertUSDToARS(amount);
      }
      return total + amount;
    }, 0);
  }, [subscriptions, convertUSDToARS]);

  const daysRemaining = useMemo(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Math.max(lastDay - now.getDate(), 0);
  }, []);

  const percentageUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const available = Math.max(budget - spent, 0);
  const dailyAllowance = daysRemaining > 0 ? available / daysRemaining : 0;
  const projectedSpending = daysRemaining > 0 
    ? spent + (spent / (30 - daysRemaining)) * daysRemaining 
    : spent;

  const updateBudget = async (newBudget: number, threshold: number) => {
    try {
      await userService.updateBudget(newBudget);
      setUser(prev => prev ? { ...prev, monthly_budget: newBudget } : null);
      setAlertThreshold(threshold);
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getProfile();
        setUser(userData);
        // Cargar threshold desde el backend (cuando esté disponible)
        const savedThreshold = localStorage.getItem("alertThreshold");
        if (savedThreshold) setAlertThreshold(Number.parseFloat(savedThreshold));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  return {
    user,
    budget,
    alertThreshold,
    spent,
    available,
    percentageUsed,
    daysRemaining,
    dailyAllowance,
    projectedSpending,
    loading,
    updateBudget,
  };
};