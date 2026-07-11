// frontend/src/features/dashboard/components/UpcomingPayments/UpcomingPayments.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import type { Subscription } from "../../types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import "./UpcomingPayments.css";

interface UpcomingPaymentsProps {
  subscriptions: Subscription[];
  currency?: string;
}

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ 
  subscriptions, 
  currency = "ARS" 
}) => {
  const upcoming = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === "active")
      .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
      .slice(0, 5);
  }, [subscriptions]);

  const getDaysUntil = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return "overdue";
    if (days === 0) return "today";
    if (days <= 3) return "soon";
    if (days <= 7) return "upcoming";
    return "far";
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`;
    if (days === 0) return "Vence hoy";
    if (days <= 3) return `Vence en ${days} día${days !== 1 ? "s" : ""}`;
    if (days <= 7) return `Vence en ${days} días`;
    return `Faltan ${days} días`;
  };

  const getIconColor = (name: string) => {
    const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (upcoming.length === 0) {
    return (
      <div className="upcoming-empty">
        <CalendarClock size={32} />
        <p>No hay pagos próximos</p>
        <span className="upcoming-empty-sub">Todas las suscripciones están al día</span>
      </div>
    );
  }

  return (
    <div className="upcoming-container">
      <div className="upcoming-header">
        <span className="upcoming-count"><CalendarClock size={12} style={{ marginRight: 6, verticalAlign: -1 }} />{upcoming.length} próximos pagos</span>
      </div>

      <div className="upcoming-list">
        {upcoming.map((sub, index) => {
          const days = getDaysUntil(sub.next_billing_date);
          const urgency = getUrgencyColor(days);
          
          return (
            <motion.div
              key={sub.id}
              className={`upcoming-item ${urgency}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <div className="upcoming-item-left">
                <div className="upcoming-item-icon" style={{ background: getIconColor(sub.name || "") }}>
                  {sub.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="upcoming-item-name">{sub.name || "Sin nombre"}</div>
                  <div className="upcoming-item-date">
                    {new Date(sub.next_billing_date).toLocaleDateString("es-ES", { 
                      day: "numeric", 
                      month: "short" 
                    })}
                  </div>
                </div>
              </div>
              <div className="upcoming-item-right">
                <span className="upcoming-item-amount">
                  {formatCurrency(parseAmount(sub.amount), sub.currency || currency)}
                </span>
                <span className={`upcoming-item-days ${urgency}`}>
                  {getDaysText(days)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingPayments;