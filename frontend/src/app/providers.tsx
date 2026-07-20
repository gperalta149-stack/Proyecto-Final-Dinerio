// frontend/src/app/providers.tsx
"use client"

import type React from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../shared/contexts/AuthContext"
import { ToastProvider } from "../shared/hooks/useToast"
import { ToastContainer } from "../shared/components/ui/Toast"

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}