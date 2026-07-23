import React from "react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import type { Subscription } from "../../../../shared/types";
import '../../../../styles/dashboard/ExecutiveSummary.css';

interface ExecutiveSummaryProps {
  upcoming: Subscription[];
  upcomingTotal: number;
  topCategory: { name: string; amount: number; percentage: number };
  nextPayment: Subscription | null;
  nextPaymentInfo: { text: string; color: string | undefined };
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  upcoming,
  upcomingTotal,
  topCategory,
  nextPayment,
  nextPaymentInfo,
}) => (
  <div className="executive-summary">
    <div className="executive-item">
      <span className="executive-label">Próximos pagos</span>
      <span className="executive-value">{upcoming.length}</span>
      <span className="executive-sub">{formatCurrency(upcomingTotal, "ARS")}</span>
    </div>
    <div className="executive-divider" />
    <div className="executive-item">
      <span className="executive-label">Mayor gasto</span>
      <span className="executive-value">{topCategory.name || "—"}</span>
      <span className="executive-sub">
        {topCategory.name
          ? `${formatCurrency(topCategory.amount, "ARS")} · ${topCategory.percentage.toFixed(0)}%`
          : "Sin datos"}
      </span>
    </div>
    <div className="executive-divider" />
    <div className="executive-item">
      <span className="executive-label">Próximo vencimiento</span>
      <span className="executive-value">
        {nextPayment
          ? new Date(nextPayment.next_billing_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
          : "—"}
      </span>
      <span className="executive-sub" style={nextPaymentInfo.color ? { color: nextPaymentInfo.color } : undefined}>
        {nextPaymentInfo.text}
      </span>
    </div>
  </div>
);

export default ExecutiveSummary;
