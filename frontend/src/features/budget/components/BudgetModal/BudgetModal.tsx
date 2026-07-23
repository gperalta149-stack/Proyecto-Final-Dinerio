// frontend/src/features/budget/components/BudgetModal/BudgetModal.tsx
import React, { useState, useEffect } from "react";
import { X, Wallet, AlertTriangle, Target } from "lucide-react";
import { formatCurrency } from "../../../../shared/utils/formatters";
import '../../../../styles/budget/BudgetModal.css';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: number, alertThreshold: number) => void;
  currentBudget?: number;
  currentThreshold?: number;
}

const RADIUS = 40;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBudget = 0,
  currentThreshold = 80,
}) => {
  const [budget, setBudget] = useState<string>(currentBudget.toString());
  const [threshold, setThreshold] = useState<string>(currentThreshold.toString());
  const [errors, setErrors] = useState<{ budget?: string; threshold?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setBudget(currentBudget.toString());
      setThreshold(currentThreshold.toString());
      setErrors({});
    }
  }, [isOpen, currentBudget, currentThreshold]);

  const validate = (): boolean => {
    const newErrors: { budget?: string; threshold?: string } = {};
    const budgetNum = parseFloat(budget);
    const thresholdNum = parseFloat(threshold);

    if (isNaN(budgetNum) || budgetNum <= 0) {
      newErrors.budget = "El presupuesto debe ser mayor a 0";
    }

    if (isNaN(thresholdNum) || thresholdNum < 1 || thresholdNum > 100) {
      newErrors.threshold = "El umbral debe estar entre 1 y 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(parseFloat(budget), parseFloat(threshold));
    onClose();
  };

  const budgetNum = parseFloat(budget) || 0;
  const thresholdNum = Math.min(Math.max(parseFloat(threshold) || 0, 0), 100);
  const alertAmount = (budgetNum * thresholdNum) / 100;

  const ringStatus = thresholdNum >= 90 ? "danger" : thresholdNum >= 70 ? "warning" : "success";
  const ringColorVar =
    ringStatus === "success" ? "var(--budget-green)" : ringStatus === "warning" ? "var(--budget-orange)" : "var(--budget-red)";
  const ringOffset = CIRCUMFERENCE - (thresholdNum / 100) * CIRCUMFERENCE;

  if (!isOpen) return null;

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div className="budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="budget-modal-header">
          <h2 className="budget-modal-title">Configurar Presupuesto</h2>
          <button className="budget-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="budget-modal-form">
          <p className="budget-modal-description">
            Define tu límite de gasto mensual y el umbral de alerta para recibir notificaciones.
          </p>

          <div className="budget-modal-group">
            <div className="budget-modal-label-wrapper">
              <span className="budget-modal-icon-badge">
                <Wallet size={16} />
              </span>
              <label className="budget-modal-label">Presupuesto Mensual</label>
            </div>
            <div className="budget-modal-input-wrapper">
              <span className="budget-modal-currency">$</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={`budget-modal-input budget-modal-input--amount ${errors.budget ? "error" : ""}`}
                placeholder="50000"
                step="100"
                min="0"
                autoFocus
              />
            </div>
            {errors.budget && <span className="budget-modal-error">{errors.budget}</span>}
          </div>

          <div className="budget-modal-group">
            <div className="budget-modal-label-wrapper budget-modal-label-wrapper--between">
              <div className="budget-modal-label-wrapper">
                <span className="budget-modal-icon-badge budget-modal-icon-badge--warning">
                  <AlertTriangle size={16} />
                </span>
                <label className="budget-modal-label">Umbral de Alerta</label>
              </div>
              <span className="budget-modal-threshold-badge">{thresholdNum || 0}%</span>
            </div>

            <input
              type="range"
              min={1}
              max={100}
              value={isNaN(thresholdNum) ? 80 : thresholdNum}
              onChange={(e) => setThreshold(e.target.value)}
              className="budget-modal-slider"
              style={{
                background: `linear-gradient(90deg, var(--budget-accent-1) ${thresholdNum}%, var(--budget-border-subtle) ${thresholdNum}%)`,
              }}
            />

            <div className="budget-modal-input-wrapper budget-modal-input-wrapper--small">
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className={`budget-modal-input ${errors.threshold ? "error" : ""}`}
                placeholder="80"
                min="1"
                max="100"
              />
              <span className="budget-modal-percent">%</span>
            </div>
            {errors.threshold && <span className="budget-modal-error">{errors.threshold}</span>}
          </div>

          {budgetNum > 0 && (
            <div className={`budget-modal-preview budget-modal-preview--${ringStatus}`}>
              <div className="budget-modal-preview-ring">
                <svg viewBox="0 0 96 96" className="budget-modal-preview-svg" aria-hidden="true">
                  <circle
                    cx="48"
                    cy="48"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--budget-border-subtle)"
                    strokeWidth={STROKE}
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r={RADIUS}
                    fill="none"
                    stroke={ringColorVar}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={ringOffset}
                    transform="rotate(-90 48 48)"
                    className="budget-modal-preview-ring-fill"
                  />
                </svg>
                <span className="budget-modal-preview-ring-value">{thresholdNum || 0}%</span>
              </div>

              <div className="budget-modal-preview-text">
                <span className="budget-modal-preview-label">
                  <Target size={13} /> Se activa la alerta al gastar
                </span>
                <strong className="budget-modal-preview-amount">
                  {formatCurrency(alertAmount, "ARS")}
                </strong>
              </div>
            </div>
          )}

          <div className="budget-modal-actions">
            <button type="button" onClick={onClose} className="budget-modal-btn secondary">
              Cancelar
            </button>
            <button type="submit" className="budget-modal-btn primary">
              Guardar Presupuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;