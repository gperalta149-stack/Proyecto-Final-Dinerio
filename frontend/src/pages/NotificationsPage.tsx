import type React from "react"
import { useEffect, useState } from "react"
import { notificationService } from "../services/notificationService.js"
import { subscriptionService } from "../services/subscriptionService.js"
import type { Notification, Subscription } from "../types"
import { formatCurrency, formatDate, getDaysUntilNextPayment, parseAmount } from "../utils/formatters"

interface SubscriptionWithDays extends Subscription {
  daysUntil: number;
}

// Iconos SVG
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.4 1 1 0 00-1.17-1.17 5.97 5.97 0 01-7.4 4.66 1 1 0 00-1.17 1.17 5.97 5.97 0 014.66 7.4 1 1 0 001.17 1.17 5.97 5.97 0 017.4-4.66 1 1 0 001.17-1.17z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const CreditCardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const PaymentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const BudgetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
)

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const EmptyStateIcon = () => (
  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.4 1 1 0 00-1.17-1.17 5.97 5.97 0 01-7.4 4.66 1 1 0 00-1.17 1.17 5.97 5.97 0 014.66 7.4 1 1 0 001.17 1.17 5.97 5.97 0 017.4-4.66 1 1 0 001.17-1.17z" />
  </svg>
)

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [upcomingSubscriptions, setUpcomingSubscriptions] = useState<SubscriptionWithDays[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [notificationsResponse, subscriptionsData] = await Promise.all([
        notificationService.getNotifications(),
        subscriptionService.getAll()
      ])
      
      let notificationsData: Notification[] = []
      if (Array.isArray(notificationsResponse)) {
        notificationsData = notificationsResponse
      } else if ((notificationsResponse as any)?.notifications) {
        notificationsData = (notificationsResponse as any).notifications
      }
      setNotifications(notificationsData)
      
      const activeSubscriptions = subscriptionsData.filter((sub: Subscription) => sub.status === 'active')
      const sortedSubscriptions: SubscriptionWithDays[] = activeSubscriptions
        .map((sub: Subscription) => ({
          ...sub,
          daysUntil: getDaysUntilNextPayment(sub.next_billing_date)
        }))
        .sort((a, b) => a.daysUntil - b.daysUntil)
      
      setUpcomingSubscriptions(sortedSubscriptions)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const getPaymentColor = (daysUntil: number): string => {
    if (daysUntil <= 3) return "text-red-400 border-red-500/20 bg-red-500/10"
    if (daysUntil <= 7) return "text-orange-400 border-orange-500/20 bg-orange-500/10"
    if (daysUntil <= 15) return "text-yellow-400 border-yellow-500/20 bg-yellow-500/10"
    if (daysUntil <= 30) return "text-green-400 border-green-500/20 bg-green-500/10"
    return "text-blue-400 border-blue-500/20 bg-blue-500/10"
  }

  const getTextColor = (daysUntil: number): string => {
    if (daysUntil <= 3) return "text-red-400"
    if (daysUntil <= 7) return "text-orange-400"
    if (daysUntil <= 15) return "text-yellow-400"
    if (daysUntil <= 30) return "text-green-400"
    return "text-blue-400"
  }

  const getPaymentText = (daysUntil: number): string => {
    if (daysUntil === 0) return "Hoy"
    if (daysUntil === 1) return "Mañana"
    if (daysUntil <= 30) return `En ${daysUntil} días`
    return `En ${daysUntil} días`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Centro de Notificaciones</h1>
            <p className="page-subtitle">Alertas sobre tus próximos pagos y suscripciones</p>
          </div>
          <div className="page-actions">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="subtrack-btn subtrack-btn-primary"
              >
                <CheckIcon />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        <div className="subtrack-grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Panel Principal - Próximos Pagos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Próximos Pagos */}
            <div className="subtrack-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <CreditCardIcon />
                  Próximos Pagos
                </h2>
                <span className="text-gray-400 text-sm">
                  {upcomingSubscriptions.length} suscripción{upcomingSubscriptions.length !== 1 ? 'es' : ''}
                </span>
              </div>
              
              {upcomingSubscriptions.length === 0 ? (
                <div className="empty-state">
                  <EmptyStateIcon />
                  <h3 className="empty-state-title">No hay pagos próximos</h3>
                  <p className="empty-state-description">Todas tus suscripciones están al día</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSubscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-[1.02] cursor-pointer ${getPaymentColor(subscription.daysUntil)}`}
                      onClick={() => window.location.href = `/subscriptions`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                              {subscription.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{subscription.name || 'Sin nombre'}</h3>
                            <p className="text-gray-300 text-sm">
                              {subscription.category_name || 'Sin categoría'} • {formatDate(subscription.next_billing_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-white font-semibold text-lg">
                            {formatCurrency(parseAmount(subscription.amount))}
                          </p>
                          <p className={`text-sm font-medium ${getTextColor(subscription.daysUntil)}`}>
                            {getPaymentText(subscription.daysUntil)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notificaciones del Sistema */}
            <div className="subtrack-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BellIcon />
                  Alertas del Sistema
                </h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                    {unreadCount} no leída{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <EmptyStateIcon />
                  <h3 className="empty-state-title">No tienes notificaciones</h3>
                  <p className="empty-state-description">Las notificaciones del sistema aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`subtrack-card cursor-pointer transition-all hover:scale-[1.02] ${
                        !notification.is_read ? "border-blue-500/30 bg-blue-500/5" : "opacity-70"
                      }`}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white ${
                          notification.type === "payment_reminder" ? "bg-green-600" :
                          notification.type === "budget_alert" ? "bg-orange-600" : "bg-indigo-600"
                        }`}>
                          {notification.type === "payment_reminder" ? <PaymentIcon /> :
                            notification.type === "budget_alert" ? <BudgetIcon /> : <AlertIcon />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium text-lg">{notification.title}</h3>
                            <div className="flex items-center gap-2">
                              {!notification.is_read && (
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                              )}
                              {notification.subscription_name && (
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                                  {notification.subscription_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 mb-3">{notification.message}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(notification.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CalendarIcon />
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Notificaciones totales</span>
                  <span className="text-white font-semibold">{notifications.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">No leídas</span>
                  <span className="text-red-400 font-semibold">{unreadCount}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Pagos próximos</span>
                  <span className="text-green-400 font-semibold">{upcomingSubscriptions.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Urgentes (≤3 días)</span>
                  <span className="text-red-400 font-semibold">
                    {upcomingSubscriptions.filter(sub => sub.daysUntil <= 3).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Leyenda de Colores */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4">Leyenda de Colores</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">≤ 3 días</p>
                    <p className="text-gray-400 text-xs">Urgente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">4-7 días</p>
                    <p className="text-gray-400 text-xs">Próximo</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">8-15 días</p>
                    <p className="text-gray-400 text-xs">Cercano</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">16-30 días</p>
                    <p className="text-gray-400 text-xs">Planificado</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-white text-sm font-medium">+30 días</p>
                    <p className="text-gray-400 text-xs">Futuro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="subtrack-card bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/subscriptions'}
                  className="w-full subtrack-btn subtrack-btn-secondary text-sm"
                >
                  <CreditCardIcon />
                  Ver todas las suscripciones
                </button>
                <button
                  onClick={() => window.location.href = '/calendar'}
                  className="w-full subtrack-btn subtrack-btn-secondary text-sm"
                >
                  <CalendarIcon />
                  Ver calendario
                </button>
                <button
                  onClick={loadData}
                  className="w-full subtrack-btn subtrack-btn-secondary text-sm"
                >
                  <RefreshIcon />
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}