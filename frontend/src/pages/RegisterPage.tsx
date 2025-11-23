import type React from "react"
import { RegisterForm } from "../components/auth/RegisterForm"

const MoneyIcon = () => (
  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen subtrack-page bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MoneyIcon />
            </div>
            <h1 className="text-4xl font-bold text-white">Dinario</h1>
          </div>
          <p className="text-gray-400 text-lg">Crea tu cuenta y comienza a ahorrar</p>
        </div>
        <div className="subtrack-card">
          <RegisterForm />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>
    </div>
  )
}