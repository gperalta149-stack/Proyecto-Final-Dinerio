import { ArrowLeft, Calendar, Check, FileText, Pencil, Plus, Search, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useToast } from '../../../../shared/hooks/useToast';
import ExchangeRateService from "../../../../shared/services/exchangeRateService";
import '../../../../styles/subscriptions/SubscriptionModal.css';
import { CategoryModal } from '../../../categories/components/CategoryModal/CategoryModal';
import { categoryService } from '../../../categories/service/categoryService';
import type { CategoryFormData } from '../../../categories/types';
import { getCategoryIcon } from '../../../categories/utils/getCategoryIcon';
import type { Category, Subscription } from "../../types";

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

// Helper de normalización: pasa a minúsculas y elimina tildes/acentos, usado para
  // comparar nombres (de suscripciones y categorías) ignorando diferencias de mayúsculas.
const normalize = (value: string) =>
  value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

interface SubscriptionModalProps {
  subscription?: Subscription;
  categories: Category[];
  existingSubscriptions?: Subscription[];
  onSave: (data: Partial<Subscription>) => Promise<void>;
  onClose: () => void;
  onCategoriesChanged?: () => Promise<void>;
}

type ModalView = "form" | "category-picker";

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  categories: externalCategories,
  existingSubscriptions = [],
  onSave,
  onClose,
  onCategoriesChanged,
}) => {
  const isEditing = !!subscription;
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [view, setView] = useState<ModalView>("form");
  const [categorySearch, setCategorySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const { showToast } = useToast();
  const [amountStr, setAmountStr] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
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

  // Al editar, precarga el formulario con los datos existentes. Si la suscripción se
  // guardó originalmente en USD, se muestra el monto en su moneda original en lugar del convertido.
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
        if (view === "category-picker") {
          setView("form");
          return;
        }
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showCreateCategory, view]);

  useEffect(() => {
    if (!showCurrencyDropdown) return;
    const handleClick = () => setShowCurrencyDropdown(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showCurrencyDropdown]);

  // Conjunto de nombres ya usados (normalizados) para validar duplicados. Excluye la
  // propia suscripción cuando se edita, para permitir conservar el mismo nombre.
  const takenNames = useMemo(() => {
    return new Set(
      existingSubscriptions
        .filter((s) => !isEditing || s.id !== subscription?.id)
        .map((s) => normalize(s.name || ""))
    );
  }, [existingSubscriptions, isEditing, subscription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "name") setNameError(null);
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? (parseFloat(value) || 0) : value,
    }));
  };

  const setField = (name: keyof Subscription, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validación del formulario antes de guardar: nombre obligatorio y sin duplicados,
  // categoría y fecha de próximo pago requeridas. Devuelve temprano con un toast de error.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = (formData.name || "").trim();
    if (!trimmedName) {
      showToast('Ingresá el nombre del servicio', 'error');
      return;
    }

    if (takenNames.has(normalize(trimmedName))) {
      setNameError("Ya tenés una suscripción activa con este nombre");
      showToast('Esa suscripción ya existe', 'error');
      return;
    }

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
        name: trimmedName,
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
    const normalized = normalize(data.name);
    const exists = externalCategories.some((c) => normalize(c.name) === normalized);
    if (exists) {
      showToast("Ya existe una categoría con ese nombre", "error");
      return;
    }
    try {
      const created = await categoryService.create({
        name: data.name.trim(),
        color: data.color,
      });

      await onCategoriesChanged?.();
      setField("category_id", created.id);
      setShowCreateCategory(false);
      setView("form");
      showToast("Categoría creada", "success");
    } catch {
      showToast("Error al crear la categoría", "error");
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
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } } };
      const msg = axiosErr.response?.data?.error || "Error al eliminar la categoría";
      showToast(msg, "error");
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.value === formData.currency) || CURRENCIES[0];
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === formData.status) || STATUS_OPTIONS[0];
  const selectedCategory = externalCategories.find((c) => c.id === formData.category_id);
  const amount = Number(formData.amount) || 0;

  // Vista previa en vivo: si la moneda es USD se convierte a ARS con el tipo de cambio
  // "tarjeta" para mostrar el equivalente aproximado dentro del formulario.
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

  const filteredCategories = useMemo(() => {
    const q = normalize(categorySearch);
    if (!q) return externalCategories;
    return externalCategories.filter((c) => normalize(c.name || "").includes(q));
  }, [externalCategories, categorySearch]);

  return (
    <div className="subs-modal-overlay" onClick={onClose}>
      <div className="subs-modal" onClick={(e) => e.stopPropagation()}>

        {/* ===================== VISTA: SELECCIÓN DE CATEGORÍA ===================== */}
        {view === "category-picker" ? (
          <>
            <div className="subs-modal-header">
              <div className="subs-modal-header-info">
                <button
                  type="button"
                  className="subs-modal-back"
                  onClick={() => { setView("form"); setCategorySearch(""); }}
                  aria-label="Volver"
                >
                  <ArrowLeft size={16} />
                </button>
                <div>
                  <h2 className="subs-modal-title">Elegir categoría</h2>
                  <p className="subs-modal-subtitle">Tocá una para seleccionarla</p>
                </div>
              </div>
              <button className="subs-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
                <X size={18} />
              </button>
            </div>

            <div className="subs-category-search-wrapper">
              <Search size={15} className="subs-category-search-icon" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Buscar categoría..."
                className="subs-category-search-input"
                autoFocus
              />
            </div>

            {/* Único scroll de esta vista: la lista de categorías */}
            <div className="subs-category-fullist">
              <div
                className={`subs-category-option${!formData.category_id ? ' selected' : ''}`}
                onClick={() => { setField("category_id", ""); setView("form"); }}
              >
                <span className="subs-category-option-icon" style={{ color: '#6b6b7b' }}>
                  {getCategoryIcon('otros')}
                </span>
                <span>Sin categoría</span>
              </div>
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`subs-category-option${formData.category_id === cat.id ? ' selected' : ''}`}
                  onClick={() => { setField("category_id", cat.id); setView("form"); }}
                >
                  <span className="subs-category-option-icon" style={{ color: cat.color }}>
                    {getCategoryIcon(cat.name || '')}
                  </span>
                  <span style={{ flex: 1 }}>{cat.name}</span>
                  {formData.category_id === cat.id && <Check size={15} />}
                  {!cat.is_default && cat.subscription_count === 0 && (
                    <button
                      type="button"
                      className="subs-category-delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                      title="Eliminar categoría"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
              {filteredCategories.length === 0 && (
                <p className="subs-category-empty">No hay categorías que coincidan</p>
              )}
            </div>

            <div className="subs-modal-actions">
              <button
                type="button"
                className="subs-modal-btn primary full"
                onClick={() => setShowCreateCategory(true)}
              >
                <Plus size={16} /> Nueva categoría
              </button>
            </div>
          </>
        ) : (
        /* ===================== VISTA: FORMULARIO ===================== */
        <>
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

        {/* Único contenedor con scroll en toda esta vista */}
        <div className="subs-modal-scroll">

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

          <form onSubmit={handleSubmit} className="subs-modal-form" id="subs-form">

            <div className="subs-form-group">
              <label className="subs-form-label" htmlFor="subs-name">
                Nombre del servicio <span className="required">*</span>
              </label>
              <div className={`subs-name-wrapper${nameError ? ' has-error' : ''}`}>
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
                  autoFocus={isEditing}
                />
              </div>
              {nameError && <p className="subs-form-error">{nameError}</p>}
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
                <button
                  type="button"
                  className="subs-category-trigger-btn"
                  onClick={() => setView("category-picker")}
                  disabled={loading}
                >
                  <span className="subs-category-icon-inline" style={{ color: selectedCategory?.color || '#6b6b7b' }}>
                    {selectedCategory ? getCategoryIcon(selectedCategory.name || '') : getCategoryIcon('otros')}
                  </span>
                  <span style={{ color: selectedCategory?.color || 'var(--subs-text-tertiary)' }}>
                    {selectedCategory?.name || "Sin categoría"}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.5 }}>
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m6 8 4 4 4-4" />
                  </svg>
                </button>
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
          </form>
        </div>

        <div className="subs-modal-actions">
          <div className="subs-modal-actions-buttons">
            <button type="button" onClick={onClose} className="subs-modal-btn secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" form="subs-form" className="subs-modal-btn primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear suscripción"}
            </button>
          </div>
        </div>
        </>
        )}

        {/* Create Category Modal */}
        {showCreateCategory && (
          <CategoryModal
            existingCategories={externalCategories}
            onSave={handleCreateCategory}
            onClose={() => setShowCreateCategory(false)}
          />
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;