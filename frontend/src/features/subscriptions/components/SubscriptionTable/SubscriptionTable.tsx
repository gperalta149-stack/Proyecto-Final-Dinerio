import React from "react";
import {
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import type { Subscription } from "../../../../shared/types";
import { formatCurrency, formatShortDate, getBillingCycleLabel, parseAmount } from "../../../../shared/utils/formatters";
import "./SubscriptionTable.css";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onView: (subscription: Subscription) => void;
}

const AVATAR_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

const colorFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getNextPaymentInfo = (date: string, status: string) => {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (status === "active" && days < 0) return { text: "Al día", color: "#22c55e" };
  if (days < 0) return { text: "Vencida", color: "#ef4444" };
  if (days === 0) return { text: "Hoy", color: "#f59e0b" };
  if (days <= 3) return { text: formatShortDate(date), color: "#eab308" };
  if (days <= 7) return { text: formatShortDate(date), color: "#06b6d4" };
  return { text: formatShortDate(date), color: "#64748b" };
};

const CATEGORY_COLORS: Record<string, string> = {
  streaming: "#8B5CF6",
  productividad: "#3B82F6",
  almacenamiento: "#10B981",
  música: "#EC4899",
  educación: "#F59E0B",
  noticias: "#06B6D4",
  otros: "#64748b",
};

const categoryColor = (name?: string) => CATEGORY_COLORS[name?.toLowerCase() || ""] || "#64748b";

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  onView,
}) => {
  if (subscriptions.length === 0) {
    return (
      <div className="subs-table-empty">
        <span className="subs-empty-icon">📺</span>
        <p className="subs-empty-title">Todavía no agregaste suscripciones</p>
        <p className="subs-empty-sub">Agregá tu primera suscripción para empezar a controlar tus gastos</p>
      </div>
    );
  }

  return (
    <div className="subs-table-wrapper">
      <table className="subs-table">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Frecuencia</th>
            <th>Categoría</th>
            <th>Próximo</th>
            <th>Monto</th>
            <th>Estado</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => {
            const isActive = sub.status === "active";
            const amount = sub.arsAmount ?? parseAmount(sub.amount);
            const currency = sub.arsAmount ? "ARS" : sub.currency;
            const nextInfo = isActive ? getNextPaymentInfo(sub.next_billing_date, sub.status) : null;

            return (
              <tr key={sub.id}>
                <td>
                  <div className="subs-table-service">
                    <span className="subs-table-avatar" style={{ background: colorFor(sub.name) }}>
                      {sub.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    <div>
                      <div className="subs-table-name">{sub.name}</div>
                      <div className="subs-table-muted">{sub.category_name || "Sin categoría"} · {getBillingCycleLabel(sub.billing_cycle)}</div>
                    </div>
                  </div>
                </td>
                <td><span className="subs-freq-label">{getBillingCycleLabel(sub.billing_cycle)}</span></td>
                <td>
                  <span className="subs-cat-badge" style={{ background: `${categoryColor(sub.category_name)}20`, color: categoryColor(sub.category_name), borderColor: `${categoryColor(sub.category_name)}30` }}>
                    {sub.category_name || "Otros"}
                  </span>
                </td>
                <td>
                  {isActive && nextInfo ? (
                    <span className="subs-next-date" style={{ color: nextInfo.color }}>
                      {nextInfo.text}
                    </span>
                  ) : (
                    <span className="subs-table-muted">—</span>
                  )}
                </td>
                <td className="subs-table-amount">
                  {sub.originalCurrency === 'USD' && sub.originalAmount ? (
                    <div className="subs-amount-dual">
                      <span className="subs-amount-usd">{formatCurrency(sub.originalAmount, 'USD')}</span>
                      <span className="subs-amount-ars">{formatCurrency(sub.arsAmount ?? parseAmount(sub.amount), 'ARS')}</span>
                    </div>
                  ) : (
                    formatCurrency(amount, currency)
                  )}
                </td>
                <td>
                  <span className={`subs-status-badge ${sub.status}`}>
                    <span className="subs-status-dot" />
                    {sub.status === "active" ? "Activa" : sub.status === "paused" ? "Pausada" : "Cancelada"}
                  </span>
                </td>
                <td>
                  <div className="subs-table-actions">
                    <button className="subs-action-btn" onClick={() => onView(sub)} title="Ver detalle">
                      <Eye size={15} />
                    </button>
                    <button className="subs-action-btn" onClick={() => onEdit(sub)} title="Editar">
                      <Pencil size={15} />
                    </button>
                    <button
                      className="subs-action-btn"
                      onClick={() => { if (confirm("¿Eliminar esta suscripción?\n\nNo se puede deshacer.")) { onDelete(sub.id); } }}
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default SubscriptionTable;
