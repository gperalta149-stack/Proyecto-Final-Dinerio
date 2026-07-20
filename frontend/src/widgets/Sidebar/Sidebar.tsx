// frontend/src/widgets/Sidebar/Sidebar.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  CreditCard,
  CalendarDays,
  FileBarChart2,
  Wallet,
  Landmark,
  ChevronsLeft,
  ChevronsRight,
  UserCircle2,
  LogOut,
  Home,
} from "lucide-react"
import { useAuth } from "../../shared/contexts/AuthContext"
import { debtService } from "../../features/debts/service/debtService"
import "./Sidebar.css"

const NAV_ITEMS = [
  { path: "/dashboard", label: "Inicio", icon: Home },
  { path: "/subscriptions", label: "Suscripciones", icon: CreditCard },
  { path: "/calendar", label: "Calendario", icon: CalendarDays },
  { path: "/reports", label: "Análisis", icon: FileBarChart2 },
  { path: "/budget", label: "Presupuesto", icon: Wallet },
  { path: "/debts", label: "Deudas", icon: Landmark, badgeKey: "debts" as const },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [pendingDebts, setPendingDebts] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    debtService.getSummary()
      .then((s) => setPendingDebts(s.pendingCount || 0))
      .catch(() => setPendingDebts(0))
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fullName = user?.name || user?.first_name || "Usuario"
  const initial = fullName.charAt(0).toUpperCase()

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Top - Logo con wrapper */}
      <div className="sidebar-top">
        <div className="sidebar-logo-wrap">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">D</div>
            <span className="sidebar-logo-text">Dinerio</span>
          </Link>
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="sidebar-menu">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname === "/")
          const Icon = item.icon
          const badge = item.badgeKey === "debts" ? pendingDebts : 0
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="sidebar-item-icon">
                <Icon size={20} />
              </span>
              <span className="sidebar-item-label">{item.label}</span>
              {badge > 0 && (
                <span className={`sidebar-badge ${collapsed ? "sidebar-badge-collapsed" : ""}`}>
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Profile - Siempre abajo */}
      <div className="sidebar-profile" ref={menuRef}>
        <button 
          className="sidebar-profile-btn" 
          onClick={() => setShowUserMenu(!showUserMenu)}
          title={fullName}
        >
          <span className="sidebar-avatar">{initial}</span>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{fullName}</div>
            <div className="sidebar-profile-role">Premium</div>
          </div>
        </button>

        {showUserMenu && (
          <div className="sidebar-profile-menu">
            <button
              className="sidebar-profile-menu-item"
              onClick={() => {
                setShowUserMenu(false)
                navigate("/profile")
              }}
            >
              <UserCircle2 size={16} />
              Perfil
            </button>
            <button
              className="sidebar-profile-menu-item danger"
              onClick={() => {
                setShowUserMenu(false)
                logout()
              }}
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}