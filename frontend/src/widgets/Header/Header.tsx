// frontend/src/widgets/Header/Header.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Menu, TrendingUp, TrendingDown, Minus, Loader2, Home, CreditCard, CalendarDays, BarChart3, Wallet, Landmark, Tags, Bell, UserCircle2 } from "lucide-react"
import { useExchangeRate } from "../../shared/hooks/useExchangeRate"
import { NotificationBell } from "../../features/notifications/components/NotificationBell/NotificationBell"
import "./Header.css"

// Mapeo de rutas a nombres, descripciones e íconos
const PAGE_INFO: Record<string, { title: string; description: string; icon: React.ElementType }> = {
  "/dashboard": { title: "Inicio", description: "Controla todos tus gastos recurrentes desde un solo lugar.", icon: Home },
  "/subscriptions": { title: "Suscripciones", description: "Gestiona todas tus suscripciones activas.", icon: CreditCard },
  "/categories": { title: "Categorías", description: "Organiza tus suscripciones por categorías.", icon: Tags },
  "/calendar": { title: "Calendario", description: "Visualiza todos tus pagos programados.", icon: CalendarDays },
  "/reports": { title: "Análisis", description: "Analiza la evolución de tus gastos.", icon: BarChart3 },
  "/budget": { title: "Presupuesto", description: "Controla tu presupuesto mensual.", icon: Wallet },
  "/debts": { title: "Deudas", description: "Gestiona tus pagos pendientes.", icon: Landmark },
  "/profile": { title: "Perfil", description: "Administra tu información personal.", icon: UserCircle2 },
  "/notifications": { title: "Notificaciones", description: "Centro de notificaciones.", icon: Bell },
}

interface HeaderProps {
  onMenuToggle?: () => void
  sidebarCollapsed?: boolean
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, sidebarCollapsed = false }) => {
  const location = useLocation()
  const { rates, loading: rateLoading, forceUpdate } = useExchangeRate("oficial")
  const [refreshing, setRefreshing] = useState(false)
  const [oficialAnimated, setOficialAnimated] = useState(false)
  const [tarjetaAnimated, setTarjetaAnimated] = useState(false)

  const sidebarWidth = sidebarCollapsed ? 64 : 256
  const pageInfo = PAGE_INFO[location.pathname] || PAGE_INFO["/dashboard"]

  // Detectar cambios en el dólar para animación
  useEffect(() => {
    if (!rateLoading && rates.oficialTrend && rates.oficialTrend !== 'same') {
      setOficialAnimated(true)
      setTimeout(() => setOficialAnimated(false), 500)
    }
  }, [rates.oficialTrend, rateLoading])

  useEffect(() => {
    if (!rateLoading && rates.tarjetaTrend && rates.tarjetaTrend !== 'same') {
      setTarjetaAnimated(true)
      setTimeout(() => setTarjetaAnimated(false), 500)
    }
  }, [rates.tarjetaTrend, rateLoading])

  const formatRate = (value: number) => {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  const handleRefresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    await forceUpdate()
    setRefreshing(false)
  }

  // Componente de tendencia
  const TrendIcon = ({ trend, animated }: { trend: string; animated: boolean }) => {
    if (trend === 'up') {
      return <TrendingUp size={12} className={`header-rate-trend up ${animated ? 'animated' : ''}`} />
    }
    if (trend === 'down') {
      return <TrendingDown size={12} className={`header-rate-trend down ${animated ? 'animated' : ''}`} />
    }
    return <Minus size={12} className="header-rate-trend same" />
  }

  return (
    <header 
      className="header" 
      style={{ 
        left: window.innerWidth <= 768 ? 0 : sidebarWidth 
      }}
    >
      <div className="header-content">
        {/* HEADER LEFT - Título y descripción */}
        <div className="header-left">
          <button className="sidebar-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
            <Menu size={20} />
          </button>
          <div className="header-icon-box">
            <pageInfo.icon size={20} />
          </div>
          <div className="header-info">
            <h1 className="header-title">{pageInfo.title}</h1>
            <p className="header-description">{pageInfo.description}</p>
          </div>
        </div>

        {/* HEADER RIGHT - Cotizaciones y notificaciones */}
        <div className="header-right">
          {/* Grupo de cotizaciones - click para actualizar */}
          <div 
            className="header-rate-group" 
            onClick={handleRefresh} 
            role="button" 
            title="Actualizar cotización"
          >
            {/* Dólar Oficial - Compra y Venta con tendencia */}
            <div className="header-rate">
              <span className="header-rate-label">Oficial</span>
              <div className="header-rate-values">
                <span className="header-rate-compra">{formatRate(rates.oficialCompra)}</span>
                <span className="header-rate-sep">/</span>
                <span className="header-rate-venta">{formatRate(rates.oficialVenta)}</span>
              </div>
              <TrendIcon trend={rates.oficialTrend} animated={oficialAnimated} />
            </div>

            {/* Dólar Tarjeta - Compra y Venta con tendencia */}
            <div className="header-rate">
              <span className="header-rate-label">Tarjeta</span>
              <div className="header-rate-values">
                <span className="header-rate-compra">{formatRate(rates.tarjetaCompra)}</span>
                <span className="header-rate-sep">/</span>
                <span className="header-rate-venta">{formatRate(rates.tarjetaVenta)}</span>
              </div>
              <TrendIcon trend={rates.tarjetaTrend} animated={tarjetaAnimated} />
            </div>

            {/* Spinner de refresco */}
            {refreshing && (
              <span className="header-rate-spinner">
                <Loader2 size={14} className="spinning" />
              </span>
            )}
          </div>

          {/* Notificaciones */}
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}