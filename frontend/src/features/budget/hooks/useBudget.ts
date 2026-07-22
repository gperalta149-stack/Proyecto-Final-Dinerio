// frontend/src/features/budget/hooks/useBudget.ts
import { useState, useEffect, useMemo } from "react";
import { userService } from "../../auth/service/userService";
import { subscriptionService } from "../../subscriptions/service/subscriptionService";
import { debtService } from "../../debts/service/debtService";
import { parseAmount } from "../../../shared/utils/formatters";
import ExchangeRateService from "../../../shared/services/exchangeRateService";
import type { User, Subscription, Debt } from "../../../shared/types";

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
  activeSubscriptions: Subscription[];
  loading: boolean;
  updateBudget: (newBudget: number, threshold: number) => Promise<void>;
}

export const useBudget = (selectedMonth?: number, selectedYear?: number): UseBudgetReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [loading, setLoading] = useState(true);

  const budget = user?.monthly_budget || 0;

  const getMonthlyAmount = (sub: any): number => {
    const amount = parseAmount(sub.amount);
    const cycle = sub.billing_cycle || 'monthly';
    let monthly = amount;
    if (cycle === 'yearly') monthly = amount / 12;
    else if (cycle === 'quarterly') monthly = amount / 3;
    else if (cycle === 'weekly') monthly = amount * 4;
    return monthly;
  };

  const spent = useMemo(() => {
    const month = selectedMonth ?? (new Date().getMonth() + 1);
    const year = selectedYear ?? new Date().getFullYear();
    const subsTotal = subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active') return total;
      const billingDate = new Date(sub.next_billing_date);
      if (billingDate.getMonth() + 1 !== month || billingDate.getFullYear() !== year) return total;
      const monthly = getMonthlyAmount(sub);
      return total + monthly;
    }, 0);
    const debtsTotal = debts.reduce((total, debt) => {
      if (debt.status !== 'paid' || !debt.paid_at) return total;
      const paidDate = new Date(debt.paid_at);
      if (paidDate.getMonth() + 1 !== month || paidDate.getFullYear() !== year) return total;
      const amount = debt.currency === 'USD'
        ? ExchangeRateService.convertUSDToARS(parseAmount(debt.amount), 'tarjeta')
        : parseAmount(debt.amount);
      return total + amount;
    }, 0);
    return subsTotal + debtsTotal;
  }, [subscriptions, debts, selectedMonth, selectedYear]);

  const activeSubscriptions = useMemo(() => {
    const month = selectedMonth ?? (new Date().getMonth() + 1);
    const year = selectedYear ?? new Date().getFullYear();
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      const billingDate = new Date(sub.next_billing_date);
      return billingDate.getMonth() + 1 === month && billingDate.getFullYear() === year;
    });
  }, [subscriptions, selectedMonth, selectedYear]);

  const daysRemaining = useMemo(() => {
    const month = selectedMonth ?? (new Date().getMonth() + 1);
    const year = selectedYear ?? new Date().getFullYear();
    const now = new Date();
    const todayKey = now.getFullYear() * 12 + (now.getMonth() + 1);
    const monthKey = year * 12 + month;
    const lastDay = new Date(year, month, 0).getDate();
    if (monthKey < todayKey) return 0;
    if (monthKey > todayKey) return lastDay;
    return Math.max(lastDay - now.getDate(), 0);
  }, [selectedMonth, selectedYear]);

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
    const loadData = async () => {
      try {
        setLoading(true);
        const [userData, subsData, debtsData] = await Promise.all([
          userService.getProfile(),
          subscriptionService.getAll('all'),
          debtService.getAll(),
        ]);
        setUser(userData);
        setSubscriptions(subsData);
        setDebts(debtsData);
        const savedThreshold = localStorage.getItem("alertThreshold");
        if (savedThreshold) setAlertThreshold(Number.parseFloat(savedThreshold));
      } catch (error) {
        console.error('Error loading budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
    activeSubscriptions,
    loading,
    updateBudget,
  };
};