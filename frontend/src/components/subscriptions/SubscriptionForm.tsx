"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { subscriptionService } from "../../services/subscriptionService"
import type { Subscription, Category } from "../../types"
import { Input } from "../ui/Input"
import { Select } from "../ui/Select"
import { Button } from "../ui/Button"
import { useExchangeRate } from "../../hooks/useExchangeRate"

interface SubscriptionFormProps {
  subscription?: Subscription
  onSubmit: (data: Partial<Subscription>) => void
  onCancel: () => void
}

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ subscription, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "USD",
    billing_cycle: "monthly",
    category_id: "",
    next_billing_date: "",
    status: "active",
    description: "",
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const { convertUSDToARS, currentRate, loading: rateLoading } = useExchangeRate('blue')

  // Calcular conversión automática
  const usdAmount = formData.currency === 'USD' && formData.amount ? parseFloat(formData.amount) : 0
  const arsEquivalent = formData.currency === 'USD' && usdAmount > 0 ? convertUSDToARS(usdAmount, true) : 0

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        const cats = await subscriptionService.getCategories()
        console.log('📋 Categorías cargadas:', cats)
        setCategories(cats)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    if (subscription) {
      console.log("📝 Cargando suscripción para editar:", subscription)
      
      setFormData({
        name: subscription.name || "",
        amount: subscription.amount?.toString() || "",
        currency: subscription.currency || "USD",
        billing_cycle: subscription.billing_cycle || "monthly",
        category_id: subscription.category_id || "",
        next_billing_date: subscription.next_billing_date?.split("T")[0] || "",
        status: subscription.status || "active",
        description: subscription.description || "",
      })
    }
  }, [subscription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!formData.name.trim() || !formData.amount || !formData.next_billing_date) {
        alert("Por favor completa todos los campos requeridos: Nombre, Monto y Fecha de próximo pago")
        return
      }

      if (!formData.category_id) {
        alert("Por favor selecciona una categoría. Si no tienes categorías, crea una primero en la página de Categorías.")
        return
      }

      console.log('🎯 Categoría ID seleccionada:', formData.category_id)
      console.log('📋 Categorías disponibles:', categories)

      const selectedCategory = categories.find(cat => cat.id === formData.category_id)
      if (!selectedCategory) {
        alert("La categoría seleccionada no existe. Por favor selecciona una categoría válida.")
        return
      }

      const subscriptionData: Partial<Subscription> = {
        name: formData.name.trim(),
        amount: Number.parseFloat(formData.amount),
        currency: formData.currency,
        billing_cycle: formData.billing_cycle,
        start_date: formData.next_billing_date,
        next_billing_date: formData.next_billing_date,
        status: formData.status as 'active' | 'cancelled' | 'paused',
        description: formData.description,
        category_id: formData.category_id
      }

      console.log("Enviando datos al backend:", subscriptionData)
      await onSubmit(subscriptionData)
    } catch (error) {
      console.error("Error en el formulario:", error)
      alert("Error al procesar la suscripción. Revisa la consola para más detalles.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del servicio *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Netflix, Spotify, etc."
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Monto *"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            required
            placeholder="9.99"
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
                {!rateLoading && currentRate > 0 && (
                  <div className="flex justify-between text-blue-300 text-xs">
                    <span>Tipo de cambio:</span>
                    <span>${currentRate.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {formData.currency === 'ARS' && formData.amount && (
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

        <Select
          label="Moneda"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={[
            { value: "USD", label: "USD - Dólares" },
            { value: "ARS", label: "ARS - Pesos Argentinos" },
          ]}
        />
      </div>

      <Select
        label="Ciclo de facturación"
        name="billing_cycle"
        value={formData.billing_cycle}
        onChange={handleChange}
        options={[
          { value: "weekly", label: "Semanal" },
          { value: "monthly", label: "Mensual" },
          { value: "yearly", label: "Anual" },
        ]}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Categoría <span className="text-red-400">*</span>
        </label>
        {categoriesLoading ? (
          <div className="text-gray-400 text-sm">Cargando categorías...</div>
        ) : categories.length === 0 ? (
          <div className="text-orange-400 text-sm mb-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <strong>No tienes categorías.</strong>{" "}
            <a
              href="/categories"
              className="underline hover:text-orange-300"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/categories';
              }}
            >
              Crea una categoría primero
            </a>{" "}
            para poder agregar suscripciones.
          </div>
        ) : (
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Input
        label="Fecha de próximo pago *"
        name="next_billing_date"
        type="date"
        value={formData.next_billing_date}
        onChange={handleChange}
        required
      />

      <Select
        label="Estado"
        name="status"
        value={formData.status}
        onChange={handleChange}
        options={[
          { value: "active", label: "Activa" },
          { value: "cancelled", label: "Cancelada" },
          { value: "paused", label: "Pausada" },
        ]}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción (opcional)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Notas adicionales sobre esta suscripción..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading || !formData.name || !formData.amount || !formData.next_billing_date || !formData.category_id || categories.length === 0} // CAMBIADO: validar category_id
        >
          {loading ? "Procesando..." : (subscription ? "Actualizar" : "Agregar suscripción")}
        </Button>
      </div>
    </form>
  )
}