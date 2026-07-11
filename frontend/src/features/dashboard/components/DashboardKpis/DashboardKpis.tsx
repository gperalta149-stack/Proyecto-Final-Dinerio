import React from "react";
import { Wallet, CreditCard, Calendar, Target } from "lucide-react";
import { KpiCard } from "../KpiCard";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import type { Subscription } from "../../../../shared/types";
import "./DashboardKpis.css";

interface DashboardKpisProps {
  totalMonthly: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  nextPayment: Subscription | null;
  budget: number;
  budgetPercentage: number;
  stats: { monthlyBudget?: number } | null;
  badgeForNextPayment?: { text: string; color: string };
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  totalMonthly,
  activeSubscriptions,
  pausedSubscriptions,
  nextPayment,
  budget,
  budgetPercentage,
  stats,
  badgeForNextPayment,
}) => (
  <div className="dashboard-kpis">
    <KpiCard
      title="Gasto mensual"
      value={formatCurrency(totalMonthly, "ARS")}
      subtitle={stats?.monthlyBudget ? `de ${formatCurrency(stats.monthlyBudget, "ARS")}` : undefined}
      icon={<Wallet size={16} />}
      color="spent"
      progress={stats?.monthlyBudget ? (totalMonthly / stats.monthlyBudget) * 100 : undefined}
    />
    <KpiCard
      title="Suscripciones"
      value={`${activeSubscriptions}`}
      subtitle={`${activeSubscriptions} activas · ${pausedSubscriptions} pausadas`}
      icon={<CreditCard size={16} />}
      color="subscriptions"
      badge={activeSubscriptions > 0 ? { text: `${activeSubscriptions} activas`, color: "#4ade80" } : undefined}
    />
    <KpiCard
      title="Próximo pago"
      value={nextPayment ? nextPayment.name || "Sin nombre" : "—"}
      subtitle={
        nextPayment
          ? `${formatCurrency(parseAmount(nextPayment.amount), nextPayment.currency || "ARS")} · ${new Date(nextPayment.next_billing_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
          : "No hay pagos programados"
      }
      icon={<Calendar size={16} />}
      color="next-payment"
      badge={badgeForNextPayment}
    />
    <KpiCard
      title="Presupuesto"
      value={budget > 0 ? `${Math.min(Math.round(budgetPercentage), 999)}%` : "—"}
      subtitle={
        budget > 0
          ? `${formatCurrency(totalMonthly, "ARS")} / ${formatCurrency(budget, "ARS")}`
          : "Sin definir"
      }
      icon={<Target size={16} />}
      color="budget"
      progress={budget > 0 ? budgetPercentage : undefined}
    />
  </div>
);

export default DashboardKpis;
