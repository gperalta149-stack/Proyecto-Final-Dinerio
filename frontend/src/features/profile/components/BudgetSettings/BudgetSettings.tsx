// frontend/src/features/profile/components/BudgetSettings/BudgetSettings.tsx
import React, { useState } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import type { User } from '../../types';
import { formatCurrency } from '../../../../shared/utils/formatters';
import { useToast } from '../../../../shared/hooks/useToast';
import './BudgetSettings.css';

interface BudgetSettingsProps {
  user: User;
  onUpdate: (budget: number) => void;
}

export const BudgetSettings: React.FC<BudgetSettingsProps> = ({ user, onUpdate }) => {
  const [budget, setBudget] = useState(user.monthly_budget?.toString() || '');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      showToast('Ingresá un monto válido', 'error');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(budgetValue);
      showToast('Presupuesto actualizado exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar el presupuesto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currency = user.currency || 'ARS';

  return (
    <div className="app-card">
      <div className="app-card-header">
        <div>
          <h3 className="app-card-title">Configuración Financiera</h3>
          <p className="app-card-subtitle">Controla tu presupuesto mensual</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="app-card-content">
        <div className="budget-preview">
          <div className="budget-preview-item">
            <span className="budget-preview-label">Presupuesto mensual</span>
            <span className="budget-preview-value">
              {user.monthly_budget ? formatCurrency(user.monthly_budget, currency) : 'No definido'}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Monto ({currency})</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="form-input"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
          <span className="form-help">Define tu límite de gasto mensual</span>
        </div>

        <div className="app-card-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Actualizar Presupuesto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetSettings;