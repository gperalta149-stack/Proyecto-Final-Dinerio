import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import type { DashboardStats } from "../../types";

interface DebtAlertProps {
  stats: DashboardStats;
}

export const DebtAlert: React.FC<DebtAlertProps> = ({ stats }) => {
  if (!stats.pendingDebtCount || stats.pendingDebtCount <= 0) return null;

  return (
    <div className="dashboard-alert debt-alert">
      <AlertTriangle size={18} />
      <span>
        Tenés {stats.pendingDebtCount} pago
        {stats.pendingDebtCount !== 1 ? "s" : ""} pendiente
        {stats.totalDebt ? ` por ${formatCurrency(stats.totalDebt, "ARS")}` : ""}
      </span>
      <Link to="/debts" className="alert-action">
        Ver deudas
      </Link>
    </div>
  );
};

export default DebtAlert;
