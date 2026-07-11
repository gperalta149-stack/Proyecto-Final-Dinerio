// frontend/src/features/debts/pages/DebtsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, History, DollarSign } from 'lucide-react';
import { useDebts } from '../hooks';
import { DebtCard } from '../components/DebtCard/DebtCard';
import { DebtStats } from '../components/DebtStats/DebtStats';
import { DebtFilters, type DebtFilter } from '../components/DebtFilters/DebtFilters';
import { DebtEmptyState } from '../components/DebtEmptyState/DebtEmptyState';
import { DebtHistory } from '../components/DebtHistory/DebtHistory';
import { Modal } from '../../../shared/components/ui/Modal';
import { categoryService } from '../../categories/service/categoryService';
import type { Category } from '../../categories/types';
import type { Debt } from '../types';
import { getDaysUntilNextPayment } from '../../../shared/utils/formatters';
import '../styles/debts.css';

export const DebtsPage: React.FC = () => {
  const { pendingDebts, paidDebts, summary, loading, createDebt, markAsPaid, postpone, removeDebt } = useDebts();
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<DebtFilter>('pending');
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'ARS',
    due_date: '',
    category_id: '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

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
    try {
      setActionLoading(true);
      await markAsPaid(id);
    } catch (err) {
      console.error(err);
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
    setFormData({
      name: debt.name,
      amount: debt.amount.toString(),
      currency: debt.currency,
      due_date: debt.due_date,
      category_id: debt.category_id || '',
      notes: debt.notes || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.amount || !formData.due_date) {
      setFormError('Completá nombre, monto y fecha de vencimiento');
      return;
    }

    try {
      setActionLoading(true);
      await createDebt({
        name: formData.name.trim(),
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        due_date: formData.due_date,
        category_id: formData.category_id || undefined,
        notes: formData.notes || undefined,
      });
      setShowForm(false);
      setEditingDebt(null);
      setFormData({ name: '', amount: '', currency: 'ARS', due_date: '', category_id: '', notes: '' });
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Error al registrar la deuda');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDebt(null);
    setFormData({ name: '', amount: '', currency: 'ARS', due_date: '', category_id: '', notes: '' });
    setFormError('');
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
          <div className="debt-header-left">
            <div className="debt-header-icon">
              <DollarSign size={20} />
            </div>
            <div>
              <h1 className="debt-title">Deudas</h1>
              <p className="debt-subtitle">
                {showHistory
                  ? `${paidDebts.length} pago${paidDebts.length !== 1 ? 's' : ''} realizados`
                  : pendingDebts.length > 0 
                    ? `${pendingDebts.length} pago${pendingDebts.length !== 1 ? 's' : ''} pendiente${pendingDebts.length !== 1 ? 's' : ''}`
                    : 'Todos los pagos al día'}
              </p>
            </div>
          </div>
          <button className="debt-history-btn" onClick={() => setShowHistory(!showHistory)}>
            <History size={16} />
            {showHistory ? 'Deudas pendientes' : 'Historial de pagos'}
          </button>
        </div>

        {summary && <DebtStats 
          summary={summary}
          pendingCount={counts.pending}
          overdueCount={counts.overdue}
          upcomingCount={pendingDebts.filter(d => getDaysUntilNextPayment(d.due_date) > 0 && getDaysUntilNextPayment(d.due_date) <= 7).length}
          paidCount={paidDebts.length}
        />}

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
            <DebtFilters
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              counts={counts}
            />

            <div className={`debt-card-list${filteredDebts.length === 0 ? ' empty' : ''}`}>
              {filteredDebts.length === 0 ? (
                <DebtEmptyState onAdd={() => setShowForm(true)} />
              ) : (
                filteredDebts.map((debt) => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onMarkAsPaid={handleMarkAsPaid}
                    onPostpone={handlePostpone}
                    onDelete={removeDebt}
                    onEdit={handleEdit}
                    loading={actionLoading}
                  />
                ))
              )}
            </div>
          </>
        )}

        <Modal isOpen={showForm} onClose={handleCloseForm} title={editingDebt ? "Editar deuda" : "Registrar deuda"}>
          <form onSubmit={handleSubmit} className="debt-form">
            {formError && <div className="debt-form-error">{formError}</div>}

            <div className="debt-form-group">
              <label className="debt-form-label">Nombre *</label>
              <input
                type="text"
                className="debt-form-input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Netflix, HBO Max..."
                disabled={actionLoading}
              />
            </div>

            <div className="debt-form-row">
              <div className="debt-form-group">
                <label className="debt-form-label">Monto *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="debt-form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  disabled={actionLoading}
                />
              </div>
              <div className="debt-form-group">
                <label className="debt-form-label">Moneda</label>
                <select
                  className="debt-form-input"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  disabled={actionLoading}
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="debt-form-group">
              <label className="debt-form-label">Fecha de vencimiento *</label>
              <input
                type="date"
                className="debt-form-input"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                disabled={actionLoading}
              />
            </div>

            {categories.length > 0 && (
              <div className="debt-form-group">
                <label className="debt-form-label">Categoría (opcional)</label>
                <select
                  className="debt-form-input"
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  disabled={actionLoading}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="debt-form-group">
              <label className="debt-form-label">Notas (opcional)</label>
              <textarea
                className="debt-form-input debt-form-textarea"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ej: La tarjeta fue rechazada..."
                rows={3}
                disabled={actionLoading}
              />
            </div>

            <div className="debt-form-actions">
              <button type="button" className="debt-form-btn secondary" onClick={handleCloseForm} disabled={actionLoading}>
                Cancelar
              </button>
              <button type="submit" className="debt-form-btn primary" disabled={actionLoading}>
                {actionLoading ? 'Guardando...' : editingDebt ? 'Actualizar' : 'Registrar deuda'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default DebtsPage;