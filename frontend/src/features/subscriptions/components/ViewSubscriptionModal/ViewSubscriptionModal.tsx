import React from "react";
import { X, CreditCard, Calendar, DollarSign, Repeat, Tag, FileText, Globe, Clock } from "lucide-react";
import type { Subscription } from "../../../../shared/types";
import { formatCurrency, formatDate, formatShortDate, getBillingCycleLabel, parseAmount } from "../../../../shared/utils/formatters";
import "./ViewSubscriptionModal.css";

interface ViewSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
}

export const ViewSubscriptionModal: React.FC<ViewSubscriptionModalProps> = ({ subscription, onClose }) => {
  const sub = subscription;
  const amount = sub.arsAmount ?? parseAmount(sub.amount);
  const currency = sub.arsAmount ? "ARS" : sub.currency;

  const rows = [
    { label: "Nombre", value: sub.name, icon: CreditCard },
    { label: "Monto", value: formatCurrency(amount, currency), icon: DollarSign },
    { label: "Moneda original", value: sub.originalCurrency || sub.currency, icon: DollarSign },
    { label: "Ciclo de facturación", value: getBillingCycleLabel(sub.billing_cycle), icon: Repeat },
    { label: "Categoría", value: sub.category_name || "Sin categoría", icon: Tag },
    { label: "Estado", value: sub.status === "active" ? "Activa" : sub.status === "paused" ? "Pausada" : "Cancelada", icon: Clock },
    { label: "Próximo vencimiento", value: formatDate(sub.next_billing_date), icon: Calendar },
    { label: "Fecha de inicio", value: sub.start_date ? formatDate(sub.start_date) : "—", icon: Calendar },
    { label: "Descripción", value: sub.description || "—", icon: FileText },
    { label: "Sitio web", value: sub.website_url || "—", icon: Globe },
    { label: "Notas", value: sub.notes || "—", icon: FileText },
    { label: "Creada", value: formatDate(sub.created_at), icon: Calendar },
    { label: "Actualizada", value: formatDate(sub.updated_at), icon: Calendar },
  ];

  return (
    <div className="view-modal-overlay" onClick={onClose}>
      <div className="view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="view-modal-header">
          <div className="view-modal-title">
            <CreditCard size={20} />
            <h2>{sub.name}</h2>
          </div>
          <button className="view-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="view-modal-body">
          {rows.map((r) => (
            <div className="view-modal-row" key={r.label}>
              <span className="view-modal-label"><r.icon size={14} /> {r.label}</span>
              <span className="view-modal-value">{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptionModal;
