"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../../features/auth/service/authService"
import type { AuthContextType, User } from "../types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// NOTA: este archivo no vino incluido en lo que se pasó para el refactor.
// Se construyó tomando authService.ts como base, respetando la firma
// { success, error } que ya esperan LoginPage, RegisterForm, RegisterPage y App.tsx.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token")
      if (token) {
        const response = await authService.getCurrentUser()
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error)
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, token } = await authService.login(email, password)
      localStorage.setItem("token", token)
      setUser(user)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error al iniciar sesión"
      return { success: false, error: errorMessage }
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, token } = await authService.register(email, password, firstName, lastName)
      localStorage.setItem("token", token)
      setUser(user)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error al registrarse"
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    authService.logout().finally(() => {
      localStorage.removeItem("token")
      setUser(null)
    })
  }

  const updateBudget = async (monthlyBudget: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: updatedUser } = await authService.updateBudget(monthlyBudget)
      setUser(updatedUser)
      return { success: true }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Error al actualizar presupuesto"
      return { success: false, error: errorMessage }
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateBudget,
    isAuthenticated: !!user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}
