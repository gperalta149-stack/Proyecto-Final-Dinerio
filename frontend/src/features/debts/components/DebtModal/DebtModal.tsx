import React, { useState, useEffect, useMemo } from "react";
import { X, DollarSign, Calendar, FileText, ChevronDown } from "lucide-react";
import { getCategoryIcon } from '../../../categories/utils/getCategoryIcon';
import type { Category } from '../../../categories/types';
import type { Debt } from '../../types';
import "./DebtModal.css";

const CURRENCIES = [
  { value: "ARS", label: "ARS", symbol: "$" },
  { value: "USD", label: "USD", symbol: "US$" },
];

interface DebtModalProps {
  debt: Debt | null;
  categories: Category[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  debt,
  categories,
  onSave,
  onClose,
}) => {
  const isEditing = !!debt;
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "ARS",
    due_date: "",
    category_id: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name || "",
        amount: debt.amount.toString(),
        currency: debt.currency || "ARS",
        due_date: debt.due_date || "",
        category_id: debt.category_id || "",
        notes: debt.notes || "",
      });
      if (debt.notes) setShowNotes(true);
    }
  }, [debt]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!showCategoryDropdown) return;
    const handleClick = () => setShowCategoryDropdown(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showCategoryDropdown]);

  useEffect(() => {
    if (!showCurrencyDropdown) return;
    const handleClick = () => setShowCurrencyDropdown(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showCurrencyDropdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setField = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name.trim() || !formData.amount || !formData.due_date) {
      setFormError("Completá nombre, monto y fecha de vencimiento");
      return;
    }
    if (!formData.category_id) {
      setFormError("Seleccioná una categoría");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        due_date: formData.due_date,
        category_id: formData.category_id || undefined,
        notes: formData.notes || undefined,
      });
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Error al registrar la deuda");
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.value === formData.currency) || CURRENCIES[0];
  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const amount = Number.parseFloat(formData.amount.replace(',', '.')) || 0;

  const convertedAmount = useMemo(() => {
    if (formData.currency === "USD" && amount > 0) {
      return Math.round(amount * 1513 * 1.51);
    }
    return null;
  }, [amount, formData.currency]);

  return (
    <div className="debt-modal-overlay" onClick={onClose}>
      <div className="debt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="debt-modal-header">
          <div className="debt-modal-header-info">
            <div className="debt-modal-header-icon">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="debt-modal-title">{isEditing ? "Editar deuda" : "Registrar deuda"}</h2>
              <p className="debt-modal-subtitle">Completá los datos de la deuda</p>
            </div>
          </div>
          <button className="debt-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="debt-modal-form">
          {formError && <div className="debt-modal-error">{formError}</div>}

          <div className="debt-modal-field">
            <label className="debt-modal-label">Nombre *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="debt-modal-input"
              placeholder="Ej: Netflix, HBO Max..."
              disabled={loading}
            />
          </div>

          <div className="debt-modal-row">
              <div className="debt-modal-field">
                <label className="debt-modal-label">Monto *</label>
                <div className="debt-modal-amount-wrapper">
                  <span className="debt-modal-amount-symbol">{selectedCurrency.symbol}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9,]/g, '');
                      setFormData((prev) => ({ ...prev, amount: raw }));
                    }}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder="0,00"
                    className="debt-modal-input debt-modal-amount-input"
                    disabled={loading}
                  />
                <div className="debt-modal-currency-selector">
                  <button
                    type="button"
                    className="debt-modal-currency-trigger"
                    onClick={(e) => { e.stopPropagation(); setShowCurrencyDropdown(!showCurrencyDropdown); }}
                  >
                    {selectedCurrency.label}
                    <ChevronDown size={12} />
                  </button>
                  {showCurrencyDropdown && (
                    <div className="debt-modal-currency-dropdown" onClick={(e) => e.stopPropagation()}>
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          className={`debt-modal-currency-option${formData.currency === c.value ? " selected" : ""}`}
                          onClick={() => { setField("currency", c.value); setShowCurrencyDropdown(false); }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {formData.currency === "USD" && amount > 0 && convertedAmount && (
              <div className="debt-modal-conversion">
                ≈ <strong>{convertedAmount.toLocaleString("es-AR")}</strong> ARS
              </div>
            )}
          </div>

          <div className="debt-modal-field">
            <label className="debt-modal-label">Fecha de vencimiento *</label>
            <div className="debt-modal-date-wrapper">
              <Calendar size={16} className="debt-modal-date-icon" />
              <input
                type="date"
                name="due_date"
                className="debt-modal-input debt-modal-date-input"
                value={formData.due_date}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

            <div className="debt-modal-field">
              <label className="debt-modal-label">Categoría *</label>
              <div className="debt-modal-category-selector">
                <span className="debt-modal-category-icon" style={{ color: selectedCategory?.color || '#6b6b7b' }}>{selectedCategory ? getCategoryIcon(selectedCategory.name) : getCategoryIcon("")}</span>
                <button
                  type="button"
                  className="debt-modal-category-trigger"
                  onClick={(e) => { e.stopPropagation(); setShowCategoryDropdown(!showCategoryDropdown); }}
                >
                  {selectedCategory ? (
                    <span>{selectedCategory.name}</span>
                  ) : (
                    <span className="debt-modal-category-placeholder">Seleccionar categoría</span>
                  )}
                  <ChevronDown size={14} className="debt-modal-chevron" />
                </button>
                {showCategoryDropdown && (
                  <div className="debt-modal-category-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={`debt-modal-category-option${!formData.category_id ? " selected" : ""}`}
                      onClick={() => { setField("category_id", ""); setShowCategoryDropdown(false); }}
                    >
                      <span className="debt-modal-category-option-icon" style={{ color: "#6b6b7b" }}>{getCategoryIcon("")}</span>
                      Sin categoría
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`debt-modal-category-option${formData.category_id === cat.id ? " selected" : ""}`}
                        onClick={() => { setField("category_id", cat.id); setShowCategoryDropdown(false); }}
                      >
                        <span className="debt-modal-category-option-icon" style={{ color: cat.color }}>{getCategoryIcon(cat.name)}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          <div className="debt-modal-field">
            <button
              type="button"
              className="debt-modal-notes-toggle"
              onClick={() => setShowNotes(!showNotes)}
            >
              <FileText size={14} />
              {showNotes ? "Ocultar notas" : "Notas (opcional)"}
            </button>
            {showNotes && (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="debt-modal-textarea"
                placeholder="Ej: La tarjeta fue rechazada..."
                rows={3}
                disabled={loading}
              />
            )}
          </div>

          <div className="debt-modal-actions">
            <button type="button" onClick={onClose} className="debt-modal-btn secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="debt-modal-btn primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Actualizar deuda" : "Registrar deuda"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebtModal;