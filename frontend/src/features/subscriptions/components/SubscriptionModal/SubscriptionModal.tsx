// frontend/src/features/subscriptions/components/SubscriptionModal/SubscriptionModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import { X, Calendar, Tag, RefreshCcw, FileText, Plus, Pencil } from "lucide-react";
import type { Subscription, Category } from "../../types";
import "./SubscriptionModal.css";

const BILLING_CYCLES = [
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
  { value: "weekly", label: "Semanal" },
];

const CURRENCIES = [
  { value: "ARS", label: "Pesos", symbol: "$" },
  { value: "USD", label: "Dólares", symbol: "US$" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Activa", color: "#22c55e" },
  { value: "paused", label: "Pausada", color: "#f59e0b" },
  { value: "cancelled", label: "Cancelada", color: "#ef4444" },
];

const AVATAR_COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

const colorForName = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatPreviewAmount = (value: number, currency: string) => {
  const symbol = currency === "USD" ? "US$" : "$";
  const formatted = value.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol} ${formatted}`;
};

const formatPreviewDate = (value: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
};

interface SubscriptionModalProps {
  subscription?: Subscription;
  categories: Category[];
  onSave: (data: Partial<Subscription>) => Promise<void>;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  categories,
  onSave,
  onClose,
}) => {
  const isEditing = !!subscription;
  const [loading, setLoading] = useState(false);
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
      setFormData({
        name: subscription.name || "",
        amount: typeof subscription.amount === "string"
          ? parseFloat(subscription.amount)
          : subscription.amount || 0,
        currency: subscription.currency || "ARS",
        billing_cycle: subscription.billing_cycle || "monthly",
        category_id: subscription.category_id || "",
        next_billing_date: subscription.next_billing_date || "",
        status: subscription.status || "active",
        description: subscription.description || "",
      });
    }
  }, [subscription]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        category_id: formData.category_id || null,
        description: formData.description || "",
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error("Error saving subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = CURRENCIES.find((c) => c.value === formData.currency) || CURRENCIES[0];
  const selectedStatus = STATUS_OPTIONS.find((s) => s.value === formData.status) || STATUS_OPTIONS[0];
  const selectedCategory = categories.find((c) => c.id === formData.category_id);
  const amount = Number(formData.amount) || 0;

  const convertedAmount = useMemo(() => {
    if (formData.currency === "USD" && amount > 0) {
      return Math.round(amount * 1513 * 1.51);
    }
    return null;
  }, [amount, formData.currency]);

  const previewName = formData.name?.trim() || "Nueva suscripción";
  const previewDate = formatPreviewDate(formData.next_billing_date || "");

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
                {isEditing ? "Actualizá los datos de este servicio" : "Sumala a tu lista de gastos recurrentes"}
              </p>
            </div>
          </div>
          <button className="subs-modal-close" onClick={onClose} aria-label="Cerrar" type="button">
            <X size={18} />
          </button>
        </div>

        {/* Vista previa en vivo: así se va a ver la fila en la tabla */}
        <div className="subs-modal-preview">
          <span className="subs-modal-preview-avatar" style={{ background: colorForName(previewName) }}>
            {previewName.charAt(0).toUpperCase()}
          </span>
          <div className="subs-modal-preview-info">
            <span className="subs-modal-preview-name">{previewName}</span>
            <span className="subs-modal-preview-meta">
              {selectedCategory?.name || "Sin categoría"} · {BILLING_CYCLES.find((c) => c.value === formData.billing_cycle)?.label}
            </span>
          </div>
          <div className="subs-modal-preview-amount-block">
            <span className="subs-modal-preview-amount">{formatPreviewAmount(amount, formData.currency || "ARS")}</span>
            {previewDate && <span className="subs-modal-preview-date">Próx. {previewDate}</span>}
          </div>
          <span className="subs-modal-preview-status" style={{ color: selectedStatus.color, background: `${selectedStatus.color}1a` }}>
            <span className="subs-modal-preview-dot" style={{ background: selectedStatus.color }} />
            {selectedStatus.label}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="subs-modal-form">
          {/* Nombre + monto: los dos datos que más importan, arriba y grandes */}
          <div className="subs-form-group">
            <label className="subs-form-label" htmlFor="subs-name">
              Nombre del servicio <span className="required">*</span>
            </label>
            <input
              id="subs-name"
              type="text"
              name="name"
              value={formData.name || ""}
              onChange={handleChange}
              className="subs-form-input subs-form-input-hero"
              placeholder="Netflix, Spotify, GitHub..."
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label" htmlFor="subs-amount">
              Monto <span className="required">*</span>
            </label>
            <div className="subs-amount-row">
              <div className="subs-form-input-wrapper subs-amount-input">
                <span className="subs-form-input-prefix">{selectedCurrency.symbol}</span>
                <input
                  id="subs-amount"
                  type="number"
                  name="amount"
                  value={formData.amount === 0 ? "" : formData.amount}
                  onChange={handleChange}
                  onFocus={(e) => e.currentTarget.select()}
                  className="subs-form-input subs-form-input-hero"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
              <div className="subs-pill-group subs-currency-pills" role="radiogroup" aria-label="Moneda">
                {CURRENCIES.map((curr) => (
                  <button
                    key={curr.value}
                    type="button"
                    role="radio"
                    aria-checked={formData.currency === curr.value}
                    className={`subs-pill ${formData.currency === curr.value ? "active" : ""}`}
                    onClick={() => setField("currency", curr.value)}
                    disabled={loading}
                  >
                    {curr.value}
                  </button>
                ))}
              </div>
            </div>

            {formData.currency === "USD" && amount > 0 && convertedAmount && (
              <div className="subs-form-conversion">
                <span>≈ <strong>{convertedAmount.toLocaleString("es-AR")}</strong> ARS</span>
                <span className="subs-form-rate-detail">cotización {amount} USD × 1.513 × 1,51</span>
              </div>
            )}
          </div>

          <div className="subs-modal-divider" />

          <div className="subs-modal-grid">
            <div className="subs-form-group">
              <label className="subs-form-label">
                <Tag size={13} /> Categoría
              </label>
              <select
                name="category_id"
                value={formData.category_id || ""}
                onChange={handleChange}
                className="subs-form-input select"
                disabled={loading}
              >
                <option value="">Sin categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="subs-form-group">
              <label className="subs-form-label" htmlFor="subs-date">
                <Calendar size={13} /> Próximo pago
              </label>
              <input
                id="subs-date"
                type="date"
                name="next_billing_date"
                value={formData.next_billing_date || ""}
                onChange={handleChange}
                className="subs-form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label">
              <RefreshCcw size={13} /> Ciclo de facturación
            </label>
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
                  className={`subs-pill subs-pill-status ${formData.status === status.value ? "active" : ""}`}
                  style={formData.status === status.value ? { borderColor: status.color, color: status.color, background: `${status.color}14` } : undefined}
                  onClick={() => setField("status", status.value)}
                  disabled={loading}
                >
                  <span className="subs-pill-dot" style={{ background: status.color }} />
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          <div className="subs-form-group">
            <label className="subs-form-label" htmlFor="subs-description">
              <FileText size={13} /> Notas <span className="subs-form-label-optional">(opcional)</span>
            </label>
            <textarea
              id="subs-description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="subs-form-input subs-form-textarea"
              placeholder="Tarjeta registrada, motivo de la baja, recordatorios..."
              rows={2}
              disabled={loading}
            />
          </div>

          <div className="subs-modal-actions">
            <button type="button" onClick={onClose} className="subs-modal-btn secondary" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="subs-modal-btn primary" disabled={loading}>
              {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear suscripción"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionModal;