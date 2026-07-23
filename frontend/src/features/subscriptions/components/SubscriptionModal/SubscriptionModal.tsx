import React, { useState, useEffect, useMemo } from "react";
import ExchangeRateService from "../../../../shared/services/exchangeRateService";
import { X, Plus, Pencil, Calendar, FileText } from "lucide-react";
import { getCategoryIcon } from '../../../categories/utils/getCategoryIcon';
import { categoryService } from '../../../categories/service/categoryService';
import { CategoryForm } from '../../../categories/components/CategoryForm/CategoryForm';
import type { CategoryFormData } from '../../../categories/types';
import type { Subscription, Category } from "../../types";
import { useToast } from '../../../../shared/hooks/useToast';
import '../../../../styles/subscriptions/SubscriptionModal.css';

const BILLING_CYCLES = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
  { value: "weekly", label: "Semanal" },
];

const CURRENCIES = [
  { value: "ARS", label: "ARS", symbol: "$" },
  { value: "USD", label: "USD", symbol: "US$" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activa", color: "#3b82f6" },
  { value: "paused", label: "Pausada", color: "#f59e0b" },
  { value: "cancelled", label: "Pagada", color: "#22c55e" },
];

interface SubscriptionModalProps {
  subscription?: Subscription;
  categories: Category[];
  onSave: (data: Partial<Subscription>) => Promise<void>;
  onClose: () => void;
  onCategoriesChanged?: () => Promise<void>;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  categories: externalCategories,
  onSave,
  onClose,
  onCategoriesChanged,
}) => {
  const isEditing = !!subscription;
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const { showToast } = useToast();
  const [amountStr, setAmountStr] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    name: "",
    amount: 0,
    currency: "ARS",
    billing_cycle: "monthly",
    category_id: "",
    next_billing_date: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    if (subscription) {
      const isUSDOriginal = subscription.originalCurrency === 'USD' && subscription.originalAmount;
      const amt = isUSDOriginal
        ? subscription.originalAmount!
        : (typeof subscription.amount === "string"
          ? parseFloat(subscription.amount)
          : subscription.amount || 0);
      const currency = isUSDOriginal ? 'USD' : (subscription.currency || "ARS");

      setFormData({
        name: subscription.name || "",
        amount: amt,
        currency: currency,
        billing_cycle: subscription.billing_cycle || "monthly",
        category_id: subscription.category_id || "",
        next_billing_date: subscription.next_billing_date || "",
        status: subscription.status || "active",
        description: subscription.description || "",
      });
      setAmountStr(amt ? amt.toString().replace('.', ',') : "");
    }
  }, [subscription]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCreateCategory) {
          setShowCreateCategory(false);
          return;
        }
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showCreateCategory]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? (parseFloat(value) || 0) : value,
    }));
  };

  const setField = (name: keyof Subscription, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      showToast('Seleccioná una categoría', 'error');
      return;
    }

    if (!formData.next_billing_date) {
      showToast('Seleccioná la fecha del próximo pago', 'error');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        category_id: formData.category_id,
        description: formData.description || "",
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error("Error saving subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    const normalized = data.name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const exists = externalCategories.some(
      (c) => c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalized
    );
    if (exists) {
      showToast("Ya existe una categoría con ese nombre", "error");
      return;
    }
    setCreatingCategory(true);
    try {
      const created = await categoryService.create({
        name: data.name.trim(),
        color: data.color,
      });

      await onCategoriesChanged?.();
      setField("category_id", created.id);
      setShowCreateCategory(false);
      setShowCategoryDropdown(false);
      showToast("Categoría creada", "success");
    } catch (error) {
      showToast("Error al crear la categoría", "error");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await categoryService.delete(categoryId);

      await onCategoriesChanged?.();

      if (formData.category_id === categoryId) {
        setField("category_id", "");
      }
      showToast("Categoría eliminada", "success");
    } catch (error: any) {
      const msg = error.response?.data?.error || "Error al eliminar la categoría";
      showToast(msg, "error");
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.value === formData.currency) || CURRENCIES[0];
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === formData.status) || STATUS_OPTIONS[0];
  const selectedCategory = externalCategories.find((c) => c.id === formData.category_id);
  const amount = Number(formData.amount) || 0;

  const convertedAmount = useMemo(() => {
    if (formData.currency === "USD" && amount > 0) {
      return ExchangeRateService.convertUSDToARS(amount, 'tarjeta');
    }
    return null;
  }, [amount, formData.currency]);

  const previewName = formData.name?.trim() || "Nueva suscripción";
  const previewDate = (() => {
    if (!formData.next_billing_date) return null;
    const date = new Date(`${formData.next_billing_date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  })();

  const formatAmount = (value: number, currency: string) => {
    const symbol = currency === "USD" ? "US$" : "$";
    if (value === 0) return `${symbol} 0,00`;
    const formatted = value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol} ${formatted}`;
  };

  return (
    <div className="subs-modal-overlay" onClick={onClose}>
      <div className="subs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="subs-modal-header">
          <div className="subs-modal-header-info">
            <span className="subs-modal-header-icon">
              {isEditing ? <Pencil size={16} /> : <Plus size={18} />}
            </span>
            <div>
              <h2 className="subs-modal-title">
                {isEditing ? "Editar suscripción" : "Nueva suscripción"}
              </h2>
              <p className="subs-modal-subtitle">
                {isEditing ? "Actualizá los datos de este servicio" : "Registrá un nuevo gasto recurrente"}
              </p>
            </div>
          </div>
          <button className="subs-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
            <X size={18} />
          </button>
        </div>

        {/* Preview card */}
        <div className="subs-preview-card">
          <div className="subs-preview-name">{previewName}</div>
          <div className="subs-preview-amount">{formatAmount(amount, formData.currency || 'ARS')}</div>
          <div className="subs-preview-currency">{formData.currency || 'ARS'}</div>
          {formData.currency === "USD" && convertedAmount && (
            <div className="subs-preview-conversion">
              ≈ {formatAmount(convertedAmount, 'ARS')}
            </div>
          )}
          <div className="subs-preview-meta">
            <span className="subs-preview-category">
              {selectedCategory ? getCategoryIcon(selectedCategory.name || '') : getCategoryIcon('otros')}
              {selectedCategory?.name || "Sin categoría"}
            </span>
            <span className="subs-preview-status" style={{ color: selectedStatus.color }}>
              <span className="subs-status-dot" style={{ background: selectedStatus.color }} />
              {selectedStatus.label}
            </span>
          </div>
          <div className="subs-preview-next">
            Próximo pago: {previewDate || "—"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="subs-modal-form">
          <div className="subs-form-group">
            <label className="subs-form-label" htmlFor="subs-name">
              Nombre del servicio <span className="required">*</span>
            </label>
            <div className="subs-name-wrapper">
              <input
                id="subs-name"
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="subs-form-input large"
                placeholder="Notion, Linear, Vercel..."
                required
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label" htmlFor="subs-amount">
              Monto <span className="required">*</span>
            </label>
            <div className="subs-form-input-wrapper">
              <span className="subs-form-input-prefix">{selectedCurrency.symbol}</span>
              <input
                id="subs-amount"
                type="text"
                name="amount"
                value={amountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9,]/g, '');
                  setAmountStr(raw);
                  const parsed = parseFloat(raw.replace(',', '.'));
                  setFormData((prev) => ({ ...prev, amount: isNaN(parsed) ? 0 : parsed }));
                }}
                onFocus={(e) => e.currentTarget.select()}
                className="subs-form-input large"
                placeholder="0,00"
                required
                disabled={loading}
              />
              <div
                className="subs-currency-trigger"
                onClick={(e) => { e.stopPropagation(); if (!loading) setShowCurrencyDropdown(!showCurrencyDropdown); }}
              >
                <span>{formData.currency || 'ARS'}</span>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4" />
                </svg>
              </div>
              {showCurrencyDropdown && (
                <div className="subs-currency-dropdown" onClick={(e) => e.stopPropagation()}>
                  {CURRENCIES.map((c) => (
                    <div
                      key={c.value}
                      className={`subs-currency-option${formData.currency === c.value ? ' selected' : ''}`}
                      onClick={() => { setField("currency", c.value); setShowCurrencyDropdown(false); }}
                    >
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formData.currency === "USD" && amount > 0 && convertedAmount && (
              <div className="subs-form-conversion">
                ≈ <strong>{convertedAmount.toLocaleString("es-AR")}</strong> ARS
              </div>
            )}
          </div>

          <div className="subs-form-grid">
            <div className="subs-form-group">
              <label className="subs-form-label">Categoría <span className="required">*</span></label>
              <div className="subs-category-wrapper">
                <span className="subs-category-icon" style={{ color: selectedCategory?.color || '#6b6b7b' }}>
                  {selectedCategory ? getCategoryIcon(selectedCategory.name || '') : getCategoryIcon('otros')}
                </span>
                <div
                  className="subs-category-trigger"
                  onClick={(e) => { e.stopPropagation(); if (!loading) setShowCategoryDropdown(!showCategoryDropdown); }}
                >
                  <span style={{ color: selectedCategory?.color || 'var(--subs-text-tertiary)' }}>
                    {selectedCategory?.name || "Sin categoría"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.5 }}>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4" />
                  </svg>
                </div>
                {showCategoryDropdown && (
                  <div className="subs-category-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div
                      className={`subs-category-option${!formData.category_id ? ' selected' : ''}`}
                      onClick={() => { setField("category_id", ""); setShowCategoryDropdown(false); }}
                    >
                      <span className="subs-category-option-icon" style={{ color: '#6b6b7b' }}>
                        {getCategoryIcon('otros')}
                      </span>
                      <span>Sin categoría</span>
                    </div>
                    {externalCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`subs-category-option${formData.category_id === cat.id ? ' selected' : ''}`}
                        onClick={() => { setField("category_id", cat.id); setShowCategoryDropdown(false); }}
                      >
                        <span className="subs-category-option-icon" style={{ color: cat.color }}>
                          {getCategoryIcon(cat.name || '')}
                        </span>
                        <span style={{ flex: 1 }}>{cat.name}</span>
                        {!cat.is_default && cat.subscription_count === 0 && (
                          <button
                            type="button"
                            className="subs-category-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategory(cat.id);
                            }}
                            title="Eliminar categoría"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="subs-category-divider" />
                    <div
                      className="subs-category-option subs-category-add"
                      onClick={(e) => { e.stopPropagation(); setShowCreateCategory(true); setShowCategoryDropdown(false); }}
                    >
                      <span className="subs-category-option-icon" style={{ color: 'var(--subs-accent-1)' }}>
                        <Plus size={16} />
                      </span>
                      <span style={{ color: 'var(--subs-accent-1)', fontWeight: 500 }}>Nueva categoría</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="subs-form-group">
              <label className="subs-form-label">Próximo pago <span className="required">*</span></label>
              <div className="subs-date-wrapper">
                <input
                  type="date"
                  name="next_billing_date"
                  value={formData.next_billing_date || ""}
                  onChange={handleChange}
                  className="subs-form-input"
                  disabled={loading}
                />
                <Calendar size={15} className="subs-date-icon" />
              </div>
            </div>
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label">Frecuencia</label>
            <div className="subs-pill-group" role="radiogroup" aria-label="Ciclo de facturación">
              {BILLING_CYCLES.map((cycle) => (
                <button
                  key={cycle.value}
                  type="button"
                  role="radio"
                  aria-checked={formData.billing_cycle === cycle.value}
                  className={`subs-pill ${formData.billing_cycle === cycle.value ? "active" : ""}`}
                  onClick={() => setField("billing_cycle", cycle.value)}
                  disabled={loading}
                >
                  {cycle.label}
                </button>
              ))}
            </div>
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label">Estado</label>
            <div className="subs-pill-group" role="radiogroup" aria-label="Estado">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  role="radio"
                  aria-checked={formData.status === status.value}
                  className={`subs-pill ${formData.status === status.value ? "active" : ""}`}
                  style={formData.status === status.value ? { background: `${status.color}18` } : undefined}
                  onClick={() => setField("status", status.value)}
                  disabled={loading}
                >
                  <span className="subs-pill-dot" style={{ background: status.color }} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="subs-form-notes-toggle" onClick={() => setShowNotes(!showNotes)}>
            <FileText size={14} />
            <span>Agregar Notas (Opcional)</span>
          </div>

          {showNotes && (
            <div className="subs-form-notes-expanded">
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                className="subs-form-textarea"
                placeholder="Tarjeta registrada, motivo de la baja, recordatorios..."
                rows={3}
                disabled={loading}
              />
            </div>
          )}

          <div className="subs-modal-actions">
            <div className="subs-modal-actions-buttons">
              <button type="button" onClick={onClose} className="subs-modal-btn secondary" disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="subs-modal-btn primary" disabled={loading}>
                {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear suscripción"}
              </button>
            </div>
          </div>
        </form>

        {/* Create Category Modal */}
        <CategoryForm
          isOpen={showCreateCategory}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCreateCategory(false)}
          loading={creatingCategory}
        />
      </div>
    </div>
  );
};

export default SubscriptionModal;