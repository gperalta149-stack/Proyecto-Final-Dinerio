"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom" // ← AGREGAR ESTE IMPORT
import type { User, AuthContextType } from "../types"
import { authService } from "../services/authService"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate() // ← AGREGAR ESTO

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          console.log("Inicializando autenticación...")
          const response = await authService.getCurrentUser()
          console.log("Usuario cargado:", response.user)
          
          const normalizedUser = normalizeUser(response.user)
          setUser(normalizedUser)
        } catch (error) {
          console.error("Error cargando usuario:", error)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const normalizeUser = (userData: any): User => {
    const normalized = {
      ...userData,
      name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      monthlyBudget: userData.monthly_budget || userData.monthlyBudget || 0
    }
    
    console.log("Usuario normalizado:", normalized)
    return normalized
  }

  const login = async (email: string, password: string) => {
    try {
      console.log("Iniciando sesión...", email)
      const { token, user: userData } = await authService.login(email, password)
      
      localStorage.setItem("token", token)
      const normalizedUser = normalizeUser(userData)
      setUser(normalizedUser)
      
      console.log("Sesión iniciada exitosamente")
      return { success: true }
    } catch (error) {
      console.error("Error en login:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al iniciar sesión"
      }
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      console.log("Registrando usuario...", email)
      const { token, user: _userData } = await authService.register(email, password, firstName, lastName)
      
      // ✅ NO guardar el token ni establecer el usuario
      // localStorage.setItem("token", token) ← ELIMINAR ESTO
      // setUser(normalizedUser) ← ELIMINAR ESTO
      
      console.log("Usuario registrado exitosamente - NO autenticado automáticamente")
      return { 
        success: true,
        token: token // ← Opcional: devolver el token si lo necesitas
      }
    } catch (error) {
      console.error("Error en registro:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al registrar usuario" 
      }
    }
  }

  const logout = () => {
    console.log("🚪 Cerrando sesión...")
    localStorage.removeItem("token")
    setUser(null)
    
    // REDIRIGIR A LA PÁGINA PRINCIPAL ← AGREGAR ESTO
    navigate('/')
    
    authService.logout().catch(() => {
      console.log("ℹ️  Logout del backend falló, pero sesión local cerrada")
    })
  }

  const updateBudget = async (monthlyBudget: number) => {
    try {
      console.log("Actualizando presupuesto:", monthlyBudget)
      const response = await authService.updateBudget(monthlyBudget)
      
      setUser(prev => prev ? normalizeUser({
        ...prev,
        ...response.user
      }) : null)
      
      console.log("Presupuesto actualizado exitosamente")
      return { success: true }
    } catch (error) {
      console.error("Error actualizando presupuesto:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al actualizar presupuesto"
      }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}