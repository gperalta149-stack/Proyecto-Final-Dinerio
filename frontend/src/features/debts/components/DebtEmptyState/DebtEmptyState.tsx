// frontend/src/features/debts/components/DebtEmptyState/DebtEmptyState.tsx
import React from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import '../../../../styles/debts/DebtEmptyState.css';

interface DebtEmptyStateProps {
  onAdd: () => void;
}

export const DebtEmptyState: React.FC<DebtEmptyStateProps> = ({ onAdd }) => {
  return (
    <div className="debt-empty-state">
      <div className="debt-empty-icon">
        <CheckCircle2 size={48} />
      </div>
      <h3 className="debt-empty-title">Excelente</h3>
      <p className="debt-empty-description">
        No tenés pagos pendientes. Todos tus servicios están al día.
      </p>
      <button onClick={onAdd} className="debt-empty-btn">
        <Plus size={18} />
        Registrar deuda manual
      </button>
    </div>
  );
};

export default DebtEmptyState;