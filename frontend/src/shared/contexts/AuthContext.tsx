"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { authService } from "../../features/auth/service/authService"
import type { AuthContextType, User } from "../types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// NOTA: este archivo no vino incluido en lo que se pasó para el refactor.
// Se construyó tomando authService.ts como base, respetando la firma
// { success, error } que ya esperan LoginPage, RegisterForm, RegisterPage y App.tsx.
// Estado global de sesión: guarda el usuario y el flag "loading".
// loading evita destellos de pantallas mientras se verifica el token al iniciar.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Al montar la app se valida la sesión existente (token en localStorage).
  useEffect(() => {
    checkAuth()
  }, [])

  // Si hay token, pide el usuario actual al backend; si la petición
  // falla (token vencido) limpia el token y el usuario.
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

  // Login: delega en authService, persiste el token en localStorage
  // y actualiza el estado. Devuelve { success } para que la UI maneje el error.
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, token } = await authService.login(email, password)
      localStorage.setItem("token", token)
      setUser(user)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al iniciar sesión"
      return { success: false, error: errorMessage }
    }
  }

  // Registro: crea la cuenta pero NO inicia la sesión. El usuario debe
  // loguearse después, por eso no se persiste el token ni el estado (el
  // RegisterForm redirige a /login). Devuelve { success } para que la UI lo maneje.
  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await authService.register(email, password, firstName, lastName)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Error al registrarse"
      return { success: false, error: errorMessage }
    }
  }

  // Logout: avisa al backend y siempre limpia el token y el usuario
  // en un "finally" implícito, garantizando cerrar la sesión local.
  const logout = () => {
    authService.logout().finally(() => {
      localStorage.removeItem("token")
      setUser(null)
    })
  }

  // Actualiza el presupuesto mensual: tras persistir en el backend,
  // refleja el cambio en el estado global para que lo vean todos los módulos.
  const updateBudget = async (monthlyBudget: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: updatedUser } = await authService.updateBudget(monthlyBudget)
      setUser(updatedUser)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      const errorMessage = err.response?.data?.error || "Error al actualizar presupuesto"
      return { success: false, error: errorMessage }
    }
  }

  // Actualización optimista del usuario en memoria
  // (ej. avatar) sin esperar al servidor.
  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  }

  // Valor expuesto por el contexto: reúne el estado y las acciones;
  // isAuthenticated deriva de la existencia del usuario.
  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateBudget,
    updateUser,
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
