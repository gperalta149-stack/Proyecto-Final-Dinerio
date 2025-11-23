"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Subscription, Category } from "../../types"
import { useExchangeRate } from "../../hooks/useExchangeRate"

interface SubscriptionModalProps {
  subscription?: Subscription
  categories: Category[] // Asegurar que siempre sea un array
  onClose: () => void
  onSave: (subscriptionData: Partial<Subscription>) => Promise<void>
}

interface FormData {
  name: string
  amount: string
  currency: string
  billingCycle: string
  nextBillingDate: string
  categoryId: string
  description: string
  notes: string
  status: 'active' | 'cancelled' | 'paused'
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  subscription,
  categories = [], // Valor por defecto para evitar undefined
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    amount: "",
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: "",
    categoryId: "",
    description: "",
    notes: "",
    status: "active",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { convertUSDToARS, currentRate, loading: rateLoading } = useExchangeRate('blue')

  const usdAmount = formData.currency === 'USD' && formData.amount ? parseFloat(formData.amount) : 0
  const arsEquivalent = formData.currency === 'USD' && usdAmount > 0 ? convertUSDToARS(usdAmount, true) : 0

  useEffect(() => {
    console.log('[MODAL] Modal inicializado:', {
      isEditing: !!subscription,
      subscriptionId: subscription?.id,
      categoriesCount: categories?.length || 0
    })

    if (subscription) {
      setFormData({
        name: subscription.name || "",
        amount: subscription.amount?.toString() || "0",
        currency: subscription.currency || "USD",
        billingCycle: subscription.billing_cycle || "monthly",
        nextBillingDate: subscription.next_billing_date?.split("T")[0] || "",
        categoryId: subscription.category_id || "",
        description: subscription.description || "",
        notes: subscription.notes || "",
        status: subscription.status || "active",
      })
    } else {
      const today = new Date().toISOString().split('T')[0]
      
      setFormData({
        name: "",
        amount: "",
        currency: "USD",
        billingCycle: "monthly",
        nextBillingDate: today,
        categoryId: "",
        description: "",
        notes: "",
        status: "active",
      })
    }
  }, [subscription, categories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prevFormData => {
      let processedValue: string | 'active' | 'cancelled' | 'paused' = value
      
      if (name === 'status') {
        processedValue = value as 'active' | 'cancelled' | 'paused'
      }
      
      return {
        ...prevFormData,
        [name]: processedValue,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log('[MODAL] handleSubmit ejecutado', {
      isEditing: !!subscription,
      formData,
      categoriesCount: categories?.length
    })

    // Validar que hay categorías disponibles
    if (!categories || categories.length === 0) {
      setError("No hay categorías disponibles. Por favor, crea al menos una categoría primero.")
      setLoading(false)
      return
    }

    // Validar que se seleccionó una categoría
    if (!formData.categoryId) {
      setError("Por favor selecciona una categoría")
      setLoading(false)
      return
    }

    try {
      const amountValue = formData.amount ? parseFloat(formData.amount) : 0
      
      const subscriptionData: Partial<Subscription> = {
        name: formData.name.trim(),
        amount: amountValue,
        currency: formData.currency,
        billing_cycle: formData.billingCycle,
        next_billing_date: formData.nextBillingDate,
        start_date: formData.nextBillingDate,
        category_id: formData.categoryId,
        description: formData.description.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        status: formData.status,
      }

      console.log('📤 [MODAL] Enviando datos:', subscriptionData)

      await onSave(subscriptionData)
      
      console.log('✅ [MODAL] Guardado exitoso, cerrando modal')
      
    } catch (err: any) {
      console.error('❌ [MODAL] Error en handleSubmit:', err)
      const errorMessage = err.response?.data?.error || err.message || "Error al guardar la suscripción"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Verificar si hay categorías disponibles
  const hasCategories = categories && categories.length > 0

  return (
    <div className="subtrack-modal-overlay" onClick={onClose}>
      <div className="subtrack-modal" onClick={(e) => e.stopPropagation()}>
        <div className="subtrack-modal-header">
          <h3 className="subtrack-modal-title">
            {subscription ? "Editar Suscripción" : "Nueva Suscripción"}
          </h3>
          <button
            className="subtrack-close-btn"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="subtrack-modal-form">
          {error && (
            <div className="subtrack-error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Información del tipo de cambio */}
          {!rateLoading && currentRate > 0 && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">💵 Dólar Blue Actual:</span>
                <span className="text-white font-semibold">${currentRate.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="subtrack-form-row">
            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="subtrack-form-input"
                placeholder="Netflix, Spotify, etc."
                required
                disabled={loading}
              />
            </div>

            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Categoría *</label>
              
              {!hasCategories ? (
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-orange-400 text-sm">
                    <strong>No hay categorías disponibles.</strong>{" "}
                    <a
                      href="/categories"
                      className="underline hover:text-orange-300"
                      onClick={(e) => {
                        e.preventDefault()
                        onClose()
                        window.location.href = '/categories'
                      }}
                    >
                      Crear categorías primero
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="subtrack-form-input"
                    required
                    disabled={loading || !hasCategories}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {categories.length} categoría(s) disponible(s)
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="subtrack-form-row">
            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Costo *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="subtrack-form-input"
                placeholder="0.00"
                required
                disabled={loading || !hasCategories}
              />
              
              {/* Mostrar conversión automática */}
              {formData.currency === 'USD' && formData.amount && parseFloat(formData.amount) > 0 && (
                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-xs text-blue-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Precio original:</span>
                      <span>US$ {parseFloat(formData.amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>+ Impuestos (75%):</span>
                      <span>US$ {(parseFloat(formData.amount) * 0.75).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-blue-500/30 pt-1">
                      <span>Total en ARS:</span>
                      <span>${arsEquivalent.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {formData.currency === 'ARS' && formData.amount && parseFloat(formData.amount) > 0 && (
                <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="text-xs text-green-400">
                    <div className="flex justify-between">
                      <span>Precio local:</span>
                      <span>${parseFloat(formData.amount).toLocaleString('es-AR')}</span>
                    </div>
                    <div className="text-green-300 text-xs mt-1">
                      ✅ Sin impuestos adicionales
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Moneda</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="subtrack-form-input"
                disabled={loading || !hasCategories}
              >
                <option value="USD">USD $ - Dólares</option>
                <option value="ARS">ARS $ - Pesos Argentinos</option>
              </select>
              
              {/* Info sobre moneda seleccionada */}
              {formData.currency === 'USD' && (
                <div className="mt-2 text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
                  💡 Se aplicará conversión automática a ARS con impuestos incluidos
                </div>
              )}
              
              {formData.currency === 'ARS' && (
                <div className="mt-2 text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                  💰 Precio final sin conversión adicional
                </div>
              )}
            </div>
          </div>

          <div className="subtrack-form-row">
            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Ciclo de Facturación *</label>
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                className="subtrack-form-input"
                required
                disabled={loading || !hasCategories}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>

            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Próximo Pago *</label>
              <input
                type="date"
                name="nextBillingDate"
                value={formData.nextBillingDate}
                onChange={handleChange}
                className="subtrack-form-input"
                required
                disabled={loading || !hasCategories}
              />
            </div>
          </div>

          <div className="subtrack-form-group">
            <label className="subtrack-form-label">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="subtrack-form-input"
              rows={2}
              placeholder="Descripción breve de la suscripción..."
              disabled={loading || !hasCategories}
            />
          </div>

          <div className="subtrack-form-group">
            <label className="subtrack-form-label">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="subtrack-form-input"
              rows={3}
              placeholder="Información adicional, detalles de pago, etc..."
              disabled={loading || !hasCategories}
            />
          </div>

          {subscription && (
            <div className="subtrack-form-group">
              <label className="subtrack-form-label">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="subtrack-form-input"
                disabled={loading || !hasCategories}
              >
                <option value="active">Activa</option>
                <option value="cancelled">Cancelada</option>
                <option value="paused">Pausada</option>
              </select>
            </div>
          )}

          <div className="subtrack-modal-actions">
            <button
              type="button"
              className="subtrack-btn subtrack-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="subtrack-btn subtrack-btn-primary"
              disabled={loading || !hasCategories || !formData.categoryId}
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small mr-2"></div>
                  {subscription ? "Actualizando..." : "Creando..."}
                </>
              ) : subscription ? (
                "Actualizar Suscripción"
              ) : (
                "Crear Suscripción"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubscriptionModal