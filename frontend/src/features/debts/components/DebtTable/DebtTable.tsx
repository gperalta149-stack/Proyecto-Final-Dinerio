import React from "react";
import {
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { Debt } from "../../types";
import { formatCurrency, formatShortDate, getDaysUntilNextPayment, parseAmount } from "../../../../shared/utils/formatters";
import "./DebtTable.css";

interface DebtTableProps {
  debts: Debt[];
  onMarkAsPaid: (id: string) => void;
  onPostpone: (id: string, days: number) => void;
  onDelete: (id: string) => void;
  onEdit: (debt: Debt) => void;
  loading?: boolean;
}

const AVATAR_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

const colorFor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getStatusInfo = (debt: Debt) => {
  const isPending = debt.status === 'pending';
  if (!isPending) return { text: "Pagada", color: "#22c55e", class: "paid" };
  const days = getDaysUntilNextPayment(debt.due_date);
  if (days < 0) return { text: "Vencida", color: "#ef4444", class: "overdue" };
  if (days === 0) return { text: "Hoy", color: "#f59e0b", class: "today" };
  return { text: "Pendiente", color: "#3b82f6", class: "pending" };
};

export const DebtTable: React.FC<DebtTableProps> = ({
  debts,
  onMarkAsPaid,
  onPostpone,
  onDelete,
  onEdit,
  loading,
}) => {
  if (debts.length === 0) {
    return (
      <div className="debt-table-empty">
        <div className="debt-table-empty-icon">
          <AlertCircle size={32} />
        </div>
        <p className="debt-table-empty-title">No hay deudas</p>
        <p className="debt-table-empty-sub">Todas las deudas están al día</p>
      </div>
    );
  }

  return (
    <div className="debt-table-wrapper">
      <table className="debt-table">
        <thead>
          <tr>
            <th>Deuda</th>
            <th>Vencimiento</th>
            <th>Monto</th>
            <th>Estado</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => {
            const isPending = debt.status === 'pending';
            const days = getDaysUntilNextPayment(debt.due_date);
            const status = getStatusInfo(debt);

            return (
              <tr key={debt.id} className={`debt-table-row-${status.class}`}>
                <td>
                  <div className="debt-table-service">
                    <span className="debt-table-avatar" style={{ background: colorFor(debt.name) }}>
                      {debt.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    <div>
                      <div className="debt-table-name">{debt.name}</div>
                      <div className="debt-table-muted">{debt.category_name || "Sin categoría"}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="debt-table-date" style={{ color: days < 0 ? "#ef4444" : days === 0 ? "#f59e0b" : "var(--debt-text-secondary)" }}>
                    {formatShortDate(debt.due_date)}
                  </span>
                  {isPending && days < 0 && (
                    <span className="debt-table-overdue-label">{Math.abs(days)} día{Math.abs(days) !== 1 ? 's' : ''}</span>
                  )}
                </td>
                <td className="debt-table-amount">
                  {formatCurrency(parseAmount(debt.amount), debt.currency)}
                </td>
                <td>
                  <span className={`debt-status-badge ${status.class}`}>
                    <span className="debt-status-dot" style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }} />
                    {status.text}
                  </span>
                </td>
                <td>
                  <div className="debt-table-actions">
                    {isPending && (
                      <button
                        className="debt-action-btn pay"
                        onClick={() => onMarkAsPaid(debt.id)}
                        disabled={loading}
                        title="Marcar como pagada"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    {isPending && (
                      <button
                        className="debt-action-btn postpone"
                        onClick={() => onPostpone(debt.id, 7)}
                        disabled={loading}
                        title="Posponer 7 días"
                      >
                        <Clock size={15} />
                      </button>
                    )}
                    {isPending && (
                      <button
                        className="debt-action-btn edit"
                        onClick={() => onEdit(debt)}
                        disabled={loading}
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    <button
                      className="debt-action-btn delete"
                      onClick={() => onDelete(debt.id)}
                      disabled={loading}
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

export default DebtTable;
