"use client"

import type React from "react"
import type { Subscription } from "../../types"
import { formatCurrency, formatDate, getBillingCycleLabel, parseAmount } from "../../utils/formatters"
import { useExchangeRate } from "../../hooks/useExchangeRate"

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (subscription: Subscription) => void
  onCancel: (id: string) => void
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onCancel
}) => {
  const { currentRate, loading: rateLoading } = useExchangeRate('blue')

  const getCategoryGradient = (category: string | undefined | null) => {
    if (!category || typeof category !== 'string') {
      return "from-gray-500 to-gray-600"
    }

    const gradients: Record<string, string> = {
      entretenimiento: "from-purple-500 to-purple-600",
      música: "from-pink-500 to-pink-600",
      productividad: "from-blue-500 to-blue-600",
      educación: "from-green-500 to-green-600",
      fitness: "from-yellow-500 to-yellow-600",
      servicios: "from-red-500 to-red-600",
      otros: "from-gray-500 to-gray-600",
    }

    return gradients[category.toLowerCase()] || gradients.otros
  }

  const getFirstLetter = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') return '?'
    return name.charAt(0).toUpperCase()
  }

  const categoryName = subscription.category_name || subscription.category || "Otros"
  const displayName = subscription.name || "Sin nombre"
  const amount = parseAmount(subscription.amount)
  const billingCycle = subscription.billing_cycle || "monthly"
  const nextBillingDate = subscription.next_billing_date || subscription.start_date || new Date().toISOString()
  const currency = subscription.currency || "ARS"

  // Usar el monto convertido si está disponible, sino calcularlo
  const displayAmount = subscription.arsAmount || amount
  const displayCurrency = subscription.arsAmount ? 'ARS' : currency

  return (
    <div className="subscription-card">
      <div className="subscription-header">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryGradient(categoryName)} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
          >
            {getFirstLetter(subscription.name)}
          </div>
          <div>
            <h3 className="subscription-name">{displayName}</h3>
            <span className="subscription-category">{categoryName}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="subscription-amount">{formatCurrency(displayAmount, displayCurrency)}</p>
          <p className="text-sm text-gray-400">{getBillingCycleLabel(billingCycle)}</p>
          
          {/* Mostrar conversión si la suscripción es en USD */}
          {subscription.currency === 'USD' && subscription.arsAmount && (
            <div className="mt-1">
              <p className="text-xs text-gray-500 line-through">
                {formatCurrency(amount, 'USD')}
              </p>
              <p className="text-xs text-green-400 font-medium">
                +75% imp: {formatCurrency(subscription.arsAmount, 'ARS')}
              </p>
              {!rateLoading && currentRate > 0 && (
                <p className="text-xs text-blue-400">
                  TC: ${currentRate.toLocaleString()}
                </p>
              )}
            </div>
          )}
          
          {/* Mostrar info si es ARS original */}
          {subscription.currency === 'ARS' && (
            <p className="text-xs text-gray-500 mt-1">Precio local</p>
          )}
        </div>
      </div>

      {/* Muestra notas o descripción */}
      {(subscription.notes || subscription.description) && (
        <div className="text-gray-300 text-sm mb-4 leading-relaxed p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              {subscription.notes ? 'NOTAS' : 'DESCRIPCIÓN'}
            </span>
          </div>
          <p className="text-gray-200">{subscription.notes || subscription.description}</p>
        </div>
      )}

      {/* Detalles de la suscripción */}
      <div className="subscription-details">
        <div className="detail-item">
          <span className="detail-label">Próximo Pago</span>
          <span className="detail-value">{formatDate(nextBillingDate)}</span>
        </div>
        
        {subscription.payment_method && (
          <div className="detail-item">
            <span className="detail-label">Método de Pago</span>
            <span className="detail-value capitalize">{subscription.payment_method}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Moneda Original</span>
          <span className="detail-value">
            {subscription.currency === 'USD' ? (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">💵 USD</span>
                {subscription.hasTax && (
                  <span className="text-xs text-red-400 bg-red-500/10 px-1 rounded">+imp</span>
                )}
              </span>
            ) : (
              <span className="text-green-400">💰 ARS</span>
            )}
          </span>
        </div>

        {subscription.status && (
          <div className="detail-item">
            <span className="detail-label">Estado</span>
            <span className={`status-badge ${
              subscription.status === 'active' ? 'status-active' :
              subscription.status === 'cancelled' ? 'status-cancelled' :
              'status-paused'
            }`}>
              {subscription.status === 'active' ? 'Activa' :
                subscription.status === 'cancelled' ? 'Cancelada' : 'Pausada'}
            </span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="subscription-actions">
        <button
          className="action-btn action-btn-edit"
          onClick={() => onEdit(subscription)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button
          className="action-btn action-btn-cancel"
          onClick={() => onCancel(subscription.id)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>
    </div>
  )
}