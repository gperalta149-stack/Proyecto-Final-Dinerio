import React from "react";
import { X, CreditCard, Calendar, DollarSign, Repeat, Tag, FileText, Globe, Clock } from "lucide-react";
import type { Subscription } from "../../../../shared/types";
import { formatCurrency, formatDate, getBillingCycleLabel, parseAmount } from "../../../../shared/utils/formatters";
import '../../../../styles/subscriptions/ViewSubscriptionModal.css';

interface ViewSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
}

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

type Row =
  | { kind: "text"; label: string; value: string; icon: any }
  | { kind: "amount"; label: string; value: string; icon: any }
  | { kind: "status"; label: string; value: string; icon: any }
  | { kind: "category"; label: string; value: string; icon: any };

export const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps> = ({ subscription, onClose }) => {
  const sub = subscription;
  const amount = sub.arsAmount ?? parseAmount(sub.amount);
  const currency = sub.arsAmount ? "ARS" : sub.currency;
  const statusLabel = sub.status === "active" ? "Activa" : sub.status === "paused" ? "Pausada" : "Pagada";

  const rows: Row[] = [
    { kind: "text", label: "Nombre", value: sub.name, icon: CreditCard },
    { kind: "amount", label: "Monto", value: formatCurrency(amount, currency), icon: DollarSign },
    { kind: "text", label: "Moneda original", value: sub.originalCurrency || sub.currency, icon: DollarSign },
    { kind: "text", label: "Ciclo de facturación", value: getBillingCycleLabel(sub.billing_cycle), icon: Repeat },
    { kind: "category", label: "Categoría", value: sub.category_name || "Sin categoría", icon: Tag },
    { kind: "status", label: "Estado", value: statusLabel, icon: Clock },
    { kind: "text", label: "Próximo vencimiento", value: formatDate(sub.next_billing_date), icon: Calendar },
    { kind: "text", label: "Fecha de inicio", value: sub.start_date ? formatDate(sub.start_date) : "—", icon: Calendar },
    { kind: "text", label: "Descripción", value: sub.description || "—", icon: FileText },
    { kind: "text", label: "Sitio web", value: sub.website_url || "—", icon: Globe },
    { kind: "text", label: "Notas", value: sub.notes || "—", icon: FileText },
    { kind: "text", label: "Creada", value: formatDate(sub.created_at), icon: Calendar },
    { kind: "text", label: "Actualizada", value: formatDate(sub.updated_at), icon: Calendar },
  ];

  const renderValue = (row: Row) => {
    switch (row.kind) {
      case "amount":
        return <span className="view-modal-amount">{row.value}</span>;
      case "status":
        return <span className={`view-modal-status ${sub.status}`}>{row.value}</span>;
      case "category":
        return (
          <span className="view-modal-category">
            <span className="view-modal-category-dot" style={{ background: categoryColor(sub.category_name) }} />
            {row.value}
          </span>
        );
      default:
        return <span className="view-modal-value">{row.value}</span>;
    }
  };

  return (
    <div className="view-modal-overlay" onClick={onClose}>
      <div className="view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="view-modal-header">
          <div className="view-modal-title">
            <div className="view-modal-icon"><CreditCard size={20} /></div>
            <div className="view-modal-title-text">
              <h2>{sub.name}</h2>
              <span>{getBillingCycleLabel(sub.billing_cycle)}</span>
            </div>
          </div>
          <button className="view-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="view-modal-body">
          <table className="view-modal-table">
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td><span className="view-modal-label"><r.icon size={15} /> {r.label}</span></td>
                  <td>{renderValue(r)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptionModal;
