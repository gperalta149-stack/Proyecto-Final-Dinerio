import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  ChartIcon,
  SubscriptionIcon,
  CalendarIcon,
  ReportIcon,
  TargetIcon,
} from "../ui/icons"

export const Sidebar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <ChartIcon className="w-5 h-5" />,
    },
    {
      path: "/subscriptions",
      label: "Suscripciones",
      icon: <SubscriptionIcon className="w-5 h-5" />,
    },
    {
      path: "/categories",
      label: "Categorías",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      path: "/calendar",
      label: "Calendario",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
    {
      path: "/reports",
      label: "Reportes",
      icon: <ReportIcon className="w-5 h-5" />,
    },
    {
      path: "/budget",
      label: "Presupuesto",
      icon: <TargetIcon className="w-5 h-5" />,
    },
    {
      path: "/notifications",
      label: "Notificaciones",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4.857 4.857l14.286 14.286M15 17h5l-5 5v-5z"
          />
        </svg>
      ),
    },
    {
      path: "/profile",
      label: "Perfil",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen">
      
      
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent"
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}>
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-indigo-400 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}