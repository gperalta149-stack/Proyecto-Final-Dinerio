// frontend/src/features/debts/pages/DebtsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, History, CheckCircle2, X } from 'lucide-react';
import { useToast } from '../../../shared/hooks/useToast';
import { useDebts } from '../hooks';
import { DebtTable } from '../components/DebtTable/DebtTable';
import { DebtStats } from '../components/DebtStats/DebtStats';
import { DebtFilters, type DebtFilter } from '../components/DebtFilters/DebtFilters';
import { DebtEmptyState } from '../components/DebtEmptyState/DebtEmptyState';
import { DebtHistory } from '../components/DebtHistory/DebtHistory';
import { DebtModal } from '../components/DebtModal/DebtModal';
import { PayDebtModal } from '../components/PayDebtModal/PayDebtModal';
import { categoryService } from '../../categories/service/categoryService';
import type { Category } from '../../categories/types';
import type { Debt } from '../types';
import ExchangeRateService from '../../../shared/services/exchangeRateService';
import { getDaysUntilNextPayment } from '../../../shared/utils/formatters';
import '../../../styles/debts/debts.css';

export const DebtsPage: React.FC = () => {
  const { pendingDebts, paidDebts, summary, loading, createDebt, markAsPaid, postpone, removeDebt } = useDebts();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DebtFilter>('pending');
const [showHistory, setShowHistory] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  const filteredDebts = useMemo(() => {
    let debts: Debt[];

    switch (activeFilter) {
      case 'paid':
        debts = paidDebts;
        break;
      case 'overdue':
        debts = pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) < 0);
        break;
      case 'today':
        debts = pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) === 0);
        break;
      case 'pending':
        debts = pendingDebts;
        break;
      case 'all':
      default:
        debts = [...pendingDebts, ...paidDebts];
        break;
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      debts = debts.filter(d => 
        d.name.toLowerCase().includes(term) ||
        (d.category_name && d.category_name.toLowerCase().includes(term))
      );
    }

    return debts.sort((a, b) => {
      const daysA = getDaysUntilNextPayment(a.due_date);
      const daysB = getDaysUntilNextPayment(b.due_date);
      return daysA - daysB;
    });
  }, [pendingDebts, paidDebts, activeFilter, searchTerm]);

  const counts = useMemo(() => ({
    all: pendingDebts.length + paidDebts.length,
    pending: pendingDebts.length,
    overdue: pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) < 0).length,
    today: pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) === 0).length,
    paid: paidDebts.length,
  }), [pendingDebts, paidDebts]);

  const handleMarkAsPaid = async (id: string) => {
    const debt = pendingDebts.find(d => d.id === id);
    if (debt) setPayingDebt(debt);
  };

  const handlePayConfirm = async (paymentMethod: string) => {
    if (!payingDebt) return;
    try {
      setActionLoading(true);
      const amount = parseFloat(String(payingDebt.amount));
      const amountArs = payingDebt.currency === 'USD'
        ? Math.round(ExchangeRateService.convertUSDToARS(amount, 'tarjeta') * 100) / 100
        : amount;
      await markAsPaid(payingDebt.id, paymentMethod, amountArs);
      setPayingDebt(null);
      setPaymentSuccess(true);
    } catch (err) {
      console.error(err);
      showToast("Error al marcar la deuda como pagada", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostpone = async (id: string, days: number) => {
    try {
      setActionLoading(true);
      await postpone(id, days);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setShowForm(true);
  };

  if (loading && !summary) {
    return (
      <div className="debt-page">
        <div className="debt-container">
          <div className="debt-loading">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="debt-page">
      <div className="debt-container">
        <div className="debt-header">
          <button className="debt-history-btn" onClick={() => setShowHistory(!showHistory)}>
            <History size={16} />
            {showHistory ? 'Deudas pendientes' : 'Historial de pagos'}
          </button>
        </div>

        {summary && <div className="debt-kpis-container"><DebtStats 
          summary={summary}
          pendingCount={counts.pending}
          overdueCount={counts.overdue}
          upcomingCount={pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) > 0 && getDaysUntilNextPayment(d.due_date) <= 7).length}
          paidCount={paidDebts.length}
        /></div>}

        {pendingDebts.length > 0 && (
          <div className="debt-alert-banner">
            <AlertTriangle size={18} />
            <span>
              Tenés {pendingDebts.length} pago{pendingDebts.length !== 1 ? 's' : ''} sin cubrir.
              Si una suscripción sigue impaga, te avisamos antes de que se interrumpa el servicio.
            </span>
          </div>
        )}

        {showHistory ? (
          <DebtHistory debts={paidDebts} />
        ) : (
          <>
            <div className="debt-filters-wrapper"><DebtFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              counts={counts}
            /></div>

            <div className="debt-table-container">
              {filteredDebts.length === 0 ? (
                <DebtEmptyState onAdd={() => setShowForm(true)} />
              ) : (
                <DebtTable
                  debts={filteredDebts}
                  onMarkAsPaid={handleMarkAsPaid}
                  onPostpone={handlePostpone}
                  onDelete={removeDebt}
                  onEdit={handleEdit}
                  loading={actionLoading}
                />
              )}
            </div>
          </>
        )}

        {showForm && (
          <DebtModal
            debt={editingDebt}
            categories={categories}
            onSave={async (data) => {
              await createDebt(data);
              setShowForm(false);
              setEditingDebt(null);
            }}
            onClose={() => {
              setShowForm(false);
              setEditingDebt(null);
            }}
          />
        )}

        {payingDebt && (
          <PayDebtModal
            debt={payingDebt}
            onConfirm={handlePayConfirm}
            onClose={() => setPayingDebt(null)}
          />
        )}

        {paymentSuccess && (
          <div className="debt-modal-overlay" onClick={() => setPaymentSuccess(false)}>
            <div className="paydebt-success-modal" onClick={(e) => e.stopPropagation()}>
              <button className="debt-modal-close paydebt-success-close" onClick={() => setPaymentSuccess(false)}>
                <X size={18} />
              </button>
              <div className="paydebt-success-icon">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="paydebt-success-title">Su pago se realizó correctamente</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtsPage;