// frontend/src/features/dashboard/components/RecentSubscriptions/RecentSubscriptions.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Layers, Inbox } from "lucide-react";
import type { Subscription } from "../../../../shared/types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import "./RecentSubscriptions.css";

interface RecentSubscriptionsProps {
  subscriptions: Subscription[];
}

export const RecentSubscriptions: React.FC<RecentSubscriptionsProps> = ({ subscriptions }) => {
  const recent = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5);
  }, [subscriptions]);

  const getDaysAgo = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return `Hace ${Math.floor(days / 7)} semanas`;
  };

  if (recent.length === 0) {
    return (
      <div className="recent-empty">
        <Inbox size={48} />
        <p>No hay suscripciones recientes</p>
        <Link to="/subscriptions" className="recent-empty-action">
          Agregar suscripción
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (status === "active") return "#22c55e";
    if (status === "paused") return "#f59e0b";
    return "#ef4444";
  };

  const getIconColor = (name: string) => {
    const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div>
      <div className="recent-header">
        <span className="recent-header-title"><Layers size={12} style={{ marginRight: 6, verticalAlign: -1 }} />Suscripciones activas</span>
        <Link to="/subscriptions" className="recent-header-link">
          Ver todas <ArrowRight size={12} />
        </Link>
      </div>
      <div className="recent-list">
      {recent.map((sub, index) => (
        <motion.div
          key={sub.id}
          className="recent-item"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <div className="recent-item-left">
            <div className="recent-item-icon" style={{ background: getIconColor(sub.name || "") }}>
              {sub.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <div className="recent-item-name">{sub.name || "Sin nombre"}</div>
              <div className="recent-item-meta">
                <span className="recent-item-category">{sub.category_name || "Otros"}</span>
                <span className="recent-item-status-dot" style={{ background: getStatusColor(sub.status) }} />
                <span className="recent-item-status" style={{ color: getStatusColor(sub.status) }}>
                  {sub.status === "active" ? "activo" : sub.status === "paused" ? "pausada" : sub.status || "activo"}
                </span>
                <span className="recent-item-date">
                  {sub.created_at ? getDaysAgo(sub.created_at) : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="recent-item-right">
            <span className="recent-item-amount">
              {formatCurrency(parseAmount(sub.amount), sub.currency || "ARS")}
            </span>
            <Link to="/subscriptions" className="recent-item-action">
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
    </div>
  );
};

export default RecentSubscriptions;