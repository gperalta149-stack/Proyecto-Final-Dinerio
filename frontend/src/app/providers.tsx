// frontend/src/app/providers.tsx
"use client"

import type React from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../shared/contexts/AuthContext"
import { ToastProvider } from "../shared/hooks/useToast"
import { ToastContainer } from "../shared/components/ui/Toast"

// Composición de providers: el orden de anidación importa porque
// cada provider debe poder usar los otros (ej. ToastProvider no depende de Auth,
// pero los toasts deben estar disponibles en toda la app). BrowserRouter provee
// el historial del cliente para el enrutado.
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {children}
          {/* ToastContainer se renderiza aquí: es un portal global
              que muestra los toasts en pantalla, independiente de las páginas. */}
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}