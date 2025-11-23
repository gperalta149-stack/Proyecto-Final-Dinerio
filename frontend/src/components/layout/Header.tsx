"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

export const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="header header-gradient">
      <div className="w-full px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo con descripción */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-white/10">
              <img
                src="/icons/DinarioLogo.ico"
                alt="Dinario"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dinerio</h1>
              <p className="text-xs text-gray-400">Gestión Inteligente de Suscripciones</p>
            </div>
          </div>

          <div className="flex-1 min-w-0"></div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Información del usuario */}
            <div className="relative">
              <button 
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-400">Bienvenido de vuelta</p>
                  <p className="text-sm font-semibold text-white">{user?.name || "Usuario"}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon />
                </div>
              </button>

              {/* Menú desplegable del usuario */}
              {showUserMenu && (
                <div className="absolute right-0 top-12 mt-2 w-48 subtrack-card rounded-lg shadow-xl border border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user?.name || "Usuario"}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  
                  <div className="p-2 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <LogoutIcon />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de cerrar sesión (solo en móvil) */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="header-button"
              >
                <LogoutIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar el menú al hacer click fuera */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  )
}