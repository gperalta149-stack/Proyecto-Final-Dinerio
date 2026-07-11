// frontend/src/features/debts/components/DebtCard/DebtCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatShortDate, getDaysUntilNextPayment, parseAmount } from '../../../../shared/utils/formatters';
import type { Debt } from '../../types';
import './DebtCard.css';

interface DebtCardProps {
  debt: Debt;
  onMarkAsPaid: (id: string) => void;
  onPostpone: (id: string, days: number) => void;
  onDelete: (id: string) => void;
  onEdit: (debt: Debt) => void;
  loading?: boolean;
}

const POSTPONE_OPTIONS = [
  { label: '7 días', value: 7 },
  { label: '15 días', value: 15 },
  { label: '30 días', value: 30 },
];

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  onMarkAsPaid,
  onPostpone,
  onDelete,
  onEdit,
  loading,
}) => {
  console.log('DebtCard montado:', debt.id, debt.name);
  const [showPostponeMenu, setShowPostponeMenu] = useState(false);

  const days = getDaysUntilNextPayment(debt.due_date);
  const isPending = debt.status === 'pending';
  const isOverdue = isPending && days < 0;
  const daysOverdue = Math.abs(days);

  const getStateClass = () => {
    if (!isPending) return 'paid';
    if (isOverdue) return 'overdue';
    if (days <= 3) return 'upcoming';
    return 'pending';
  };

  const getStateIcon = () => {
    if (!isPending) return CheckCircle2;
    if (isOverdue) return AlertCircle;
    return Clock;
  };

  const getBadge = () => {
    if (!isPending) return { text: 'Pagada', tone: 'paid' };
    if (days < 0) return { text: `${daysOverdue} día${daysOverdue !== 1 ? 's' : ''} vencida`, tone: 'overdue' };
    if (days === 0) return { text: 'Vence hoy', tone: 'upcoming' };
    if (days === 1) return { text: 'Vence mañana', tone: 'upcoming' };
    return { text: `Vence en ${days} días`, tone: 'pending' };
  };

  const getSubtitle = () => {
    if (debt.category_name) return debt.category_name;
    if (!isPending && debt.paid_at) return `Pagada el ${formatShortDate(debt.paid_at)}`;
    return `Vence el ${formatShortDate(debt.due_date)}`;
  };

  const getProgressInfo = () => {
    if (!isPending) return { width: 100, text: 'Completada' };
    if (isOverdue) {
      const pct = Math.min(daysOverdue / 30, 1) * 100;
      return { width: pct, text: `${daysOverdue} día${daysOverdue !== 1 ? 's' : ''} de atraso` };
    }
    if (days <= 7) return { width: 75, text: 'Por vencer' };
    if (days <= 30) return { width: 40, text: `${days} días restantes` };
    return { width: 15, text: `${days} días restantes` };
  };

  const badge = getBadge();
  const StateIcon = getStateIcon();
  const progress = getProgressInfo();
  const stateClass = getStateClass();

  return (
    <motion.div
      className={`category-card debt-card ${stateClass}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="category-card-header">
        <div className="header-left">
          <div className="icon-container">
            <StateIcon size={18} />
          </div>
          <div className="card-title-wrapper">
            <h3 className="card-title">{debt.name}</h3>
            <div className="card-badges-row">
              <span className="badge-default">{badge.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body">
        <span className="amount-text">
          {formatCurrency(parseAmount(debt.amount), debt.currency)}
        </span>
        <span className="amount-label">{getSubtitle()}</span>
      </div>

      <div className="card-footer">
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${progress.width}%` }}
          />
          <span className="progress-text">{progress.text}</span>
        </div>
      </div>

      <div className="category-card-actions">
        {isPending && (
          <>
            <button
              className="category-action pay"
              onClick={() => onMarkAsPaid(debt.id)}
              disabled={loading}
              title="Marcar como pagada"
            >
              <CheckCircle2 size={14} />
            </button>
            <div style={{ position: 'relative' }}>
              <button
                className="category-action postpone"
                onClick={() => setShowPostponeMenu(!showPostponeMenu)}
                disabled={loading}
                title="Posponer"
              >
                <Clock size={14} />
              </button>
              <AnimatePresence>
                {showPostponeMenu && (
                  <motion.div
                    className="debt-postpone-menu"
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  >
                    {POSTPONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className="debt-postpone-option"
                        onClick={() => {
                          onPostpone(debt.id, option.value);
                          setShowPostponeMenu(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
        {isPending && (
          <button
            className="category-action edit"
            onClick={() => onEdit(debt)}
            title="Editar"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          className="category-action delete"
          onClick={() => onDelete(debt.id)}
          title="Eliminar"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
};

export default DebtCard;
