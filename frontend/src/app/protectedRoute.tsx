"use client"

import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../shared/contexts/AuthContext"

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-white text-xl font-semibold">Cargando Dinerio...</div>
        <p className="text-gray-400 mt-2">Preparando tu experiencia financiera</p>
      </div>
    </div>
  )
}

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>
}
