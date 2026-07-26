import { useState, useEffect, useMemo } from "react";
import { reportService } from "../../reports/service/reportService";
import { debtService } from "../../debts/service/debtService";
import { budgetService } from "../../budget/service/budgetService";
import type { MonthlyEvolutionData } from "../../reports/service/reportService";
import type { Subscription, DashboardStats } from "../types";
import type { Debt } from "../../../shared/types";
import { formatCurrency, parseAmount } from "../../../shared/utils/formatters";
import ExchangeRateService from "../../../shared/services/exchangeRateService";

export function useDashboardData(stats: DashboardStats | null, subscriptions: Subscription[]) {
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolutionData[]>([]);
  const [evolutionLoading, setEvolutionLoading] = useState(true);
  const [paidDebtsTotal, setPaidDebtsTotal] = useState(0);
  const [budgetAmount, setBudgetAmount] = useState(0);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  useEffect(() => {
    const load = async () => {
      try {
        setEvolutionLoading(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const [data, debtsData, budgetData] = await Promise.all([
          reportService.getMonthlyEvolution(currentYear),
          debtService.getAll(),
          budgetService.getBudgetForMonth(currentYear, currentMonth),
        ]);
        setMonthlyEvolution(data.monthlyEvolution || []);
        setBudgetAmount(budgetData?.budget_amount || 0);

        const paidThisMonth = debtsData.filter((d: Debt) => {
          if (d.status !== 'paid' || !d.paid_at) return false;
          const paidDate = new Date(d.paid_at);
          return paidDate >= startOfMonth && paidDate < endOfMonth;
        });
        const total = paidThisMonth.reduce((sum: number, d: Debt) => {
          const amount = parseAmount(d.amount);
          return sum + (d.currency === 'USD' ? ExchangeRateService.convertUSDToARS(amount) : amount);
        }, 0);
        setPaidDebtsTotal(total);
      } catch {
        setMonthlyEvolution([]);
      } finally {
        setEvolutionLoading(false);
      }
    };
    load();
  }, []);

  const totalMonthly =
    subscriptions
      .filter(sub => {
        if (sub.status !== 'active') return false;
        const paymentDate = new Date(sub.next_billing_date);
        const isThisMonth = paymentDate >= startOfMonth && paymentDate < endOfMonth;
        const isOverdue = paymentDate < startOfMonth;
        return isThisMonth || isOverdue;
      })
      .reduce((sum, sub) => {
        return sum + (sub.arsAmount || parseAmount(sub.amount));
      }, 0) + paidDebtsTotal;

  const activeSubscriptions = subscriptions.filter((s) => s.status === "active").length;
  const pausedSubscriptions = subscriptions.filter((s) => s.status === "paused").length;

  const topCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      const category = sub.category_name || "Otros";
      const amount = sub.arsAmount || parseAmount(sub.amount);
      let monthly = amount;
      if (sub.billing_cycle === "yearly") monthly = amount / 12;
      else if (sub.billing_cycle === "quarterly") monthly = amount / 3;
      else if (sub.billing_cycle === "weekly") monthly = amount * 4;
      cats[category] = (cats[category] || 0) + monthly;
    });
    const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const top = entries[0];
    return top
      ? { name: top[0], amount: top[1], percentage: totalMonthly > 0 ? (top[1] / totalMonthly) * 100 : 0 }
      : { name: "", amount: 0, percentage: 0 };
  }, [subscriptions, totalMonthly]);

  const upcoming = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === "active")
        .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime()),
    [subscriptions]
  );

  const upcomingTotal = upcoming.reduce((sum, sub) => sum + parseAmount(sub.amount), 0);
  const nextPayment = upcoming.length > 0 ? upcoming[0] : null;

  const nextPaymentInfo = useMemo(() => {
    if (!nextPayment) return { text: "Sin pagos", color: undefined as string | undefined };
    const days = Math.ceil((new Date(nextPayment.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `venció hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`, color: "#ef4444" };
    if (days === 0) return { text: "Vence hoy", color: "#f59e0b" };
    if (days <= 3) return { text: `Vence en ${days} día${days !== 1 ? "s" : ""}`, color: "#eab308" };
    if (days <= 7) return { text: `Vence en ${days} días`, color: "#06b6d4" };
    return { text: `Faltan ${days} días`, color: "#3b82f6" };
  }, [nextPayment]);

  const budget = budgetAmount || stats?.monthlyBudget || 0;
  const budgetPercentage = budget > 0 ? (totalMonthly / budget) * 100 : 0;

  const evolutionData = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length === 0) return [];
    return monthlyEvolution.map((item: any) => ({
      month: item.monthName || new Date(item.year, item.month - 1).toLocaleDateString("es-ES", { month: "short" }),
      monthIndex: item.month,
      year: item.year,
      amount: item.monthly_total || 0,
    }));
  }, [monthlyEvolution]);

  const isEmpty = subscriptions.length === 0;

  const badgeForNextPayment = useMemo(() => {
    if (!nextPayment) return undefined;
    const days = Math.ceil((new Date(nextPayment.next_billing_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { text: `venció hace ${Math.abs(days)}d`, color: "#ef4444" as const };
    if (days === 0) return { text: "Hoy" as const, color: "#f59e0b" as const };
    if (days <= 3) return { text: `${days}d` as const, color: "#eab308" as const };
    if (days <= 7) return { text: `${days}d` as const, color: "#06b6d4" as const };
    return { text: `${days}d` as const, color: "#3b82f6" as const };
  }, [nextPayment]);

  return {
    monthlyEvolution,
    evolutionLoading,
    totalMonthly,
    activeSubscriptions,
    pausedSubscriptions,
    topCategory,
    upcoming,
    upcomingTotal,
    nextPayment,
    nextPaymentInfo,
    budget,
    budgetPercentage,
    evolutionData,
    isEmpty,
    badgeForNextPayment,
  };
}
