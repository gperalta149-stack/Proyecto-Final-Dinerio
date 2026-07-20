// frontend/src/features/reports/components/ReportsKPIs/ReportsKPIs.tsx
import React from "react";
import { DollarSign, TrendingUp, PieChart, Calendar } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";

interface ReportsKPIsProps {
  monthlyTotal: number;
  budget: number;
  budgetUsage: number;
  yearlyTotal: number;
  totalSubscriptions: number;
}

export const ReportsKPIs: React.FC<ReportsKPIsProps> = ({
  monthlyTotal,
  budget,
  budgetUsage,
  yearlyTotal,
  totalSubscriptions,
}) => {
  const kpis = [
    {
      label: "Gasto del mes",
      value: formatCurrency(monthlyTotal, "ARS"),
      sub: `${totalSubscriptions} suscripciones`,
      icon: DollarSign,
      color: "indigo",
    },
    {
      label: "Presupuesto",
      value: formatCurrency(budget, "ARS"),
      sub: budget > 0 ? `${formatCurrency(budget - monthlyTotal, "ARS")} disponible` : "Sin definir",
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Uso",
      value: `${budgetUsage.toFixed(1)}%`,
      sub: budgetUsage > 100 ? "Excedido" : budgetUsage > 80 ? "Cerca del límite" : "Dentro del límite",
      icon: PieChart,
      color: budgetUsage > 100 ? "red" : budgetUsage > 80 ? "orange" : "green",
    },
    {
      label: "Total anual",
      value: formatCurrency(yearlyTotal, "ARS"),
      sub: "Basado en evolución real",
      icon: Calendar,
      color: "purple",
    },
  ];

  const colorMap = {
    indigo: { bg: "rgba(99, 102, 241, 0.1)", border: "rgba(99, 102, 241, 0.2)", text: "var(--reports-accent-1)" },
    green: { bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.2)", text: "var(--reports-green)" },
    red: { bg: "rgba(239, 68, 68, 0.1)", border: "rgba(239, 68, 68, 0.2)", text: "var(--reports-red)" },
    orange: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.2)", text: "var(--reports-orange)" },
    purple: { bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.2)", text: "var(--reports-accent-2)" },
  };

  return (
    <div className="reports-kpis">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const colors = colorMap[kpi.color as keyof typeof colorMap] || colorMap.indigo;
        return (
          <div key={index} className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ background: colors.bg, color: colors.text }}>
              <Icon size={16} />
            </div>
            <div className="kpi-title">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-subtitle">{kpi.sub}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ReportsKPIs;