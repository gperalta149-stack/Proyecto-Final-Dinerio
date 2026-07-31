import React, { useState, useEffect } from "react";
import { X, CheckCircle2, CreditCard, Smartphone, Banknote, Building2 } from "lucide-react";
import type { Debt } from "../../types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import "../../../../styles/debts/DebtModal.css";
import "../../../../styles/debts/PayDebtModal.css";

const PAYMENT_METHODS = [
  { value: "debito", label: "Débito", icon: CreditCard, desc: "Visa, Mastercard, etc." },
  { value: "credito", label: "Crédito", icon: CreditCard, desc: "Visa, Mastercard, etc." },
  { value: "billetera_virtual", label: "Billetera virtual", icon: Smartphone, desc: "Mercado Pago, etc." },
  { value: "efectivo", label: "Efectivo", icon: Banknote, desc: "Pago en mano" },
  { value: "transferencia", label: "Transferencia", icon: Building2, desc: "Transferencia bancaria" },
] as const;

interface PayDebtModalProps {
  debt: Debt;
  onConfirm: (paymentMethod: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({ debt, onConfirm, onClose, loading }) => {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleConfirm = () => {
    if (selected) onConfirm(selected);
  };

  return (
    <div className="debt-modal-overlay" onClick={onClose}>
      <div className="paydebt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="debt-modal-header">
          <div className="debt-modal-header-info">
            <div className="paydebt-header-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="debt-modal-title">¿Con qué medio pagaste?</h2>
              <p className="debt-modal-subtitle">Seleccioná el método de pago</p>
            </div>
          </div>
          <button className="debt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="debt-modal-form">
          <div className="paydebt-info">
            <span className="paydebt-debt-name">{debt.name}</span>
            <span className="paydebt-debt-amount">{formatCurrency(parseAmount(debt.amount), debt.currency)}</span>
          </div>

          <div className="paydebt-options">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selected === method.value;
              return (
                <button
                  key={method.value}
                  className={`paydebt-option ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelected(method.value)}
                >
                  <Icon size={18} className={`paydebt-option-icon ${method.value === "credito" ? "icon-rotate" : ""}`} />
                  <div className="paydebt-option-info">
                    <span className="paydebt-option-label">{method.label}</span>
                    <span className="paydebt-option-desc">{method.desc}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="paydebt-check" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="debt-modal-actions">
          <button onClick={onClose} className="debt-modal-btn secondary">
            Cancelar
          </button>
          <button
            className="debt-modal-btn primary paydebt-confirm-btn"
            disabled={!selected || loading}
            onClick={handleConfirm}
          >
            {loading ? "Procesando..." : "Marcar como pagada"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayDebtModal;