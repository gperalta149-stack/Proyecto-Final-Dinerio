"use client"

import type React from "react"
import { useState } from "react"
import type { User } from "../types"

interface ProfileFormProps {
  user: User
  onUpdate: (userData: Partial<User>) => void
  onBudgetUpdate: (monthlyBudget: number) => void
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onUpdate,
  onBudgetUpdate
}) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
  })
  const [budget, setBudget] = useState(user.monthly_budget?.toString() || "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onUpdate(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const budgetValue = parseFloat(budget)
    if (!isNaN(budgetValue) && budgetValue > 0) {
      await onBudgetUpdate(budgetValue)
    }
  }

  return (
    <div className="space-y-8">
      {/* Información Personal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tu apellido"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

      {/* Presupuesto Mensual */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Presupuesto Mensual</h3>
        <form onSubmit={handleBudgetSubmit} className="space-y-4">
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto Mensual (USD)
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                id="budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Actualizar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Establece tu presupuesto mensual para recibir alertas cuando te acerques al límite
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}