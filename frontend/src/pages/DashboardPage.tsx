"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { subscriptionService } from "../services/subscriptionService"
import type { Subscription, DashboardStats } from "../types"
import { StatsCard } from "../components/dashboard/StatsCard"
import { BudgetAlert } from "../components/dashboard/BudgetAlert"
import { UpcomingPayments } from "../components/dashboard/UpcomingPayments"
import { useExchangeRate } from "../hooks/useExchangeRate"
import Card from "../components/ui/Card"
import { formatCurrency, parseAmount } from "../utils/formatters"


const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const SubscriptionIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
)

/*const DollarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)*/

const PesoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0M8 10.5h4m-4 3h4m5-1.5a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const CategoryDistribution = ({ subscriptions, currency = "ARS" }: { subscriptions: Subscription[], currency?: string }) => {
  const categoryData = subscriptions.reduce((acc, sub) => {
    const category = sub.category_name || "Otros"
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += parseAmount(sub.amount)
    acc[category].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const sortedCategories = Object.entries(categoryData)
    .map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total)

  const total = sortedCategories.reduce((sum, cat) => sum + cat.total, 0)

  const colors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
  ]

  if (subscriptions.length === 0) {
    return (
      <Card>
        <h3 className="text-xl font-semibold text-white mb-6">Distribución por Categoría</h3>
        <div className="text-gray-400 text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p>No hay suscripciones para mostrar</p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-6">Distribución por Categoría</h3>
      
      <div className="space-y-4">
        {sortedCategories.map((cat, index) => {
          const percentage = total > 0 ? (cat.total / total) * 100 : 0
          return (
            <div
              key={cat.name}
              className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white/20"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">{cat.name}</p>
                    <p className="text-gray-400 text-sm">
                      {cat.count} suscripción{cat.count !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-white font-semibold text-sm">
                    {formatCurrency(cat.total, currency)}
                  </p>
                  <p className="text-gray-400 text-sm">{percentage.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[index % colors.length],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-sm">Categorías</p>
            <p className="text-white font-semibold">{sortedCategories.length}</p>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-sm">Mayor categoría</p>
            <p className="text-white font-semibold text-sm truncate">
              {sortedCategories[0]?.name}
            </p>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-sm">Promedio/cat</p>
            <p className="text-white font-semibold text-sm">
              {formatCurrency(total / sortedCategories.length, currency)}
            </p>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <p className="text-gray-400 text-sm">Suscripciones</p>
            <p className="text-white font-semibold">{subscriptions.length}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Nuevo componente: Resumen Mensual
const MonthlySummary = ({ subscriptions, exchangeRate }: { subscriptions: Subscription[], exchangeRate: number }) => {
  const monthlyStats = subscriptions.reduce((acc, sub) => {
    const amount = parseAmount(sub.amount);
    
    let amountInARS = amount;
    if (sub.currency === 'USD') {
      amountInARS = amount * exchangeRate * 1.75;
    }
    
    acc.total += amountInARS;
    
    if (sub.currency === 'USD') {
      acc.usdTotal += amount;
      acc.usdTotalARS += amountInARS;
    } else {
      acc.arsTotal += amount;
    }
    
    if (sub.status === 'active') {
      acc.activeTotal += amountInARS;
    } else if (sub.status === 'cancelled') {
      acc.cancelledTotal += amountInARS;
    }
    
    return acc;
  }, {
    total: 0,
    usdTotal: 0,
    usdTotalARS: 0,
    arsTotal: 0,
    activeTotal: 0,
    cancelledTotal: 0
  });

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled').length;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Resumen Mensual</h3>
        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <CalendarIcon />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm mb-1">Activas</p>
            <p className="text-white font-bold text-lg">{activeSubscriptions}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-gray-400 text-sm mb-1">Canceladas</p>
            <p className="text-white font-bold text-lg">{cancelledSubscriptions}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
            <span className="text-gray-300 text-sm">Total USD</span>
            <span className="text-yellow-400 font-semibold">
              US$ {monthlyStats.usdTotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
            <span className="text-gray-300 text-sm">Total ARS</span>
            <span className="text-green-400 font-semibold">
              $ {monthlyStats.arsTotal.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border-t border-white/10 pt-3">
            <span className="text-white font-semibold">Total General</span>
            <span className="text-white font-bold">
              $ {Math.round(monthlyStats.total).toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Estado actual:</span>
            <span className="text-green-400 font-semibold">
              {activeSubscriptions > 0 ? 'Activo' : 'Sin suscripciones'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { currentRate, loading: rateLoading, convertUSDToARS } = useExchangeRate('blue')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const [statsData, subscriptionsData] = await Promise.all([
        subscriptionService.getDashboardStats(),
        subscriptionService.getAll()
      ])
      
      setStats(statsData)
      setSubscriptions(subscriptionsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalARS = () => {
    return subscriptions.reduce((total, sub) => {
      const amount = parseAmount(sub.amount);
      if (sub.currency === 'USD') {
        return total + convertUSDToARS(amount, true);
      } else {
        return total + amount;
      }
    }, 0);
  };

  const totalARS = calculateTotalARS();
  const totalUSDSubscriptions = subscriptions.filter(sub => sub.currency === 'USD').length;
  const totalARSSubscriptions = subscriptions.filter(sub => sub.currency === 'ARS').length;
  
  const upcomingPayments = subscriptions
    .filter(sub => sub.status === 'active')
    .sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime())
    .slice(0, 5);

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
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Resumen financiero de tus suscripciones
            </p>
          </div>
          
          {!rateLoading && currentRate > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2">
              <div className="text-sm text-blue-400">Dólar Blue</div>
              <div className="text-lg font-bold text-white">${currentRate.toLocaleString()}</div>
              <div className="text-xs text-blue-300">+75% impuestos incluidos</div>
            </div>
          )}
        </div>

        {stats && <BudgetAlert stats={stats} />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Gasto Mensual Total"
            value={`$${Math.round(totalARS).toLocaleString('es-AR')}`}
            subtitle="ARS (con impuestos)"
            trend="monthly"
            icon={<MoneyIcon />}
            color="blue"
            currency="ARS"
          />
          
          <StatsCard
            title="Suscripciones Activas"
            value={subscriptions.filter(sub => sub.status === 'active').length.toString()}
            subtitle="total"
            trend="subscriptions"
            icon={<SubscriptionIcon />}
            color="purple"
          />
          
          {/*<StatsCard
            title="En Dólares"
            value={totalUSDSubscriptions.toString()}
            subtitle="suscripciones"
            trend="currency"
            icon={<DollarIcon />}
            color="yellow"
          />*/}
          
          <StatsCard
            title="En Pesos"
            value={totalARSSubscriptions.toString()}
            subtitle="suscripciones"
            trend="currency"
            icon={<PesoIcon />}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          <div className="xl:col-span-2">
            <CategoryDistribution subscriptions={subscriptions} />
          </div>

          <div className="space-y-8">
            <UpcomingPayments subscriptions={upcomingPayments} />
            <MonthlySummary subscriptions={subscriptions} exchangeRate={currentRate} />
          </div>
        </div>

        <div className="subtrack-card mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Resumen por Moneda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-400 text-lg">💵</span>
                <h4 className="font-semibold text-yellow-400">Suscripciones en USD</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-300">Cantidad:</span>
                  <span className="text-white">{totalUSDSubscriptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-300">Total original:</span>
                  <span className="text-white">
                    US$ {subscriptions
                      .filter(sub => sub.currency === 'USD')
                      .reduce((sum, sub) => sum + parseFloat(sub.amount.toString()), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-300">Tipo de cambio:</span>
                  <span className="text-white">${currentRate.toLocaleString()} ARS</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-yellow-500/30 pt-2">
                  <span className="text-yellow-300">Total con impuestos:</span>
                  <span className="text-white">
                    $ {subscriptions
                      .filter(sub => sub.currency === 'USD')
                      .reduce((sum, sub) => {
                        return sum + convertUSDToARS(parseFloat(sub.amount.toString()), true);
                      }, 0)
                      .toLocaleString('es-AR')} ARS
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-400 text-lg">💰</span>
                <h4 className="font-semibold text-green-400">Suscripciones en ARS</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-300">Cantidad:</span>
                  <span className="text-white">{totalARSSubscriptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-300">Total mensual:</span>
                  <span className="text-white">
                    ${subscriptions
                      .filter(sub => sub.currency === 'ARS')
                      .reduce((sum, sub) => sum + parseFloat(sub.amount.toString()), 0)
                      .toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-green-500/30 pt-2">
                  <span className="text-green-300">Impuestos:</span>
                  <span className="text-white">✅ Incluidos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}