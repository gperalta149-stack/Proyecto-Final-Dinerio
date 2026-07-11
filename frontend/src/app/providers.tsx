// frontend/src/app/providers.tsx
"use client"

import type React from "react"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../shared/contexts/AuthContext"
import { ToastContainer } from "../shared/components/ui/Toast"
import { useToast } from "../shared/hooks/useToast"

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToast()

  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </AuthProvider>
    </BrowserRouter>
  )
}