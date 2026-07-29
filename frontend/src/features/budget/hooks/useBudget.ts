// frontend/src/features/budget/hooks/useBudget.ts
import { useState, useEffect, useMemo } from "react";
import { subscriptionService } from "../../subscriptions/service/subscriptionService";
import { debtService } from "../../debts/service/debtService";
import { budgetService } from "../service/budgetService";
import { parseAmount } from "../../../shared/utils/formatters";
import ExchangeRateService from "../../../shared/services/exchangeRateService";
import type { MonthlyBudget, Subscription, Debt } from "../../../shared/types";

interface UseBudgetReturn {
  monthlyBudget: MonthlyBudget | null;
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

export const useBudget = (selectedMonth?: number, selectedYear?: number, refreshKey?: number): UseBudgetReturn => {
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [loading, setLoading] = useState(true);

  const budget = monthlyBudget?.budget_amount || 0;

  const getMonthlyAmount = (sub: Subscription): number => {
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
    const startOfMonth = new Date(year, month - 1, 1);
    const subsTotal = subscriptions.reduce((total, sub) => {
      if (sub.status !== 'active') return total;
      const billingDate = new Date(sub.next_billing_date);
      const isThisMonth = billingDate.getMonth() + 1 === month && billingDate.getFullYear() === year;
      const isOverdue = billingDate.getTime() < startOfMonth.getTime();
      if (!isThisMonth && !isOverdue) return total;
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
    return subscriptions.filter(sub => sub.status === 'active');
  }, [subscriptions]);

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
      const month = selectedMonth ?? (new Date().getMonth() + 1);
      const year = selectedYear ?? new Date().getFullYear();
      const result = await budgetService.upsertBudget(year, month, newBudget, threshold);
      setMonthlyBudget(result);
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
        const month = selectedMonth ?? (new Date().getMonth() + 1);
        const year = selectedYear ?? new Date().getFullYear();
        const [budgetData, subsData, debtsData] = await Promise.all([
          budgetService.getBudgetForMonth(year, month),
          subscriptionService.getAll('all'),
          debtService.getAll(),
        ]);
        setMonthlyBudget(budgetData);
        setSubscriptions(subsData);
        setDebts(debtsData);
        const threshold = budgetData?.alert_threshold ?? 80;
        setAlertThreshold(threshold);
      } catch (error) {
        console.error('Error loading budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedMonth, selectedYear, refreshKey]);

  return {
    monthlyBudget,
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
