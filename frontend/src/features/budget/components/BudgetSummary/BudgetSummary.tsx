// frontend/src/features/budget/components/BudgetSummary/BudgetSummary.tsx
import React from "react";
import { CreditCard, DollarSign, PiggyBank, Calendar } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import "./BudgetSummary.css";

interface BudgetSummaryProps {
  spent: number;
  budget: number;
  available: number;
  percentageUsed: number;
  daysRemaining: number;
  activeCount: number;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  spent,
  budget,
  available,
  percentageUsed,
  daysRemaining,
  activeCount,
}) => {
  const items = [
    {
      label: "Suscripciones activas",
      value: activeCount.toString(),
      icon: CreditCard,
      color: "indigo",
    },
    {
      label: "Gasto mensual",
      value: formatCurrency(spent, "ARS"),
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Te sobra",
      value: formatCurrency(available, "ARS"),
      icon: PiggyBank,
      color: available > 0 ? "green" : "red",
    },
    {
      label: "Días restantes",
      value: daysRemaining > 0 ? daysRemaining.toString() : "—",
      icon: Calendar,
      color: "purple",
    },
  ];

  const colorMap = {
    indigo: { bg: "rgba(99, 102, 241, 0.1)", color: "var(--budget-accent-1)" },
    green: { bg: "rgba(34, 197, 94, 0.1)", color: "var(--budget-green)" },
    orange: { bg: "rgba(245, 158, 11, 0.1)", color: "var(--budget-orange)" },
    blue: { bg: "rgba(6, 182, 212, 0.1)", color: "var(--budget-blue)" },
    purple: { bg: "rgba(139, 92, 246, 0.1)", color: "var(--budget-accent-2)" },
    red: { bg: "rgba(239, 68, 68, 0.1)", color: "var(--budget-red)" },
  };

  return (
    <div className="budget-summary">
      <h3 className="budget-summary-title">Resumen rápido</h3>
      <div className="budget-summary-grid">
        {items.map((item, index) => {
          const Icon = item.icon;
          const colors = colorMap[item.color as keyof typeof colorMap] || colorMap.indigo;
          return (
            <div
              key={index}
              className="budget-summary-item"
              style={{ ["--budget-summary-accent" as string]: colors.color }}
            >
              <div className="budget-summary-icon" style={{ background: colors.bg, color: colors.color }}>
                <Icon size={18} />
              </div>
              <div className="budget-summary-content">
                <div className="budget-summary-value">{item.value}</div>
                <div className="budget-summary-label">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetSummary;