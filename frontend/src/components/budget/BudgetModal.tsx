"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "../ui/Modal"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"

// SVG Icons
const MoneyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
)

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const CancelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (budget: number, alertThreshold: number) => void
  currentBudget?: number
  currentThreshold?: number
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentBudget = 0,
  currentThreshold = 80,
}) => {
  const [budget, setBudget] = useState(currentBudget.toString())
  const [threshold, setThreshold] = useState(currentThreshold.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(Number.parseFloat(budget), Number.parseFloat(threshold))
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Presupuesto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header con icono */}
        <div className="text-center mb-2">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TargetIcon />
          </div>
          <p className="text-gray-400 text-sm">
            Define tu límite de gasto mensual y el umbral de alerta para recibir notificaciones.
          </p>
        </div>

        {/* Presupuesto Mensual */}
        <div className="subtrack-form-group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <MoneyIcon />
            </div>
            <div>
              <label className="subtrack-form-label text-lg">Presupuesto Mensual</label>
              <p className="text-gray-400 text-sm">Establece el máximo que deseas gastar en suscripciones cada mes</p>
            </div>
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">$</span>
            <Input
              name="budget"
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
              placeholder="500.00"
              className="subtrack-form-input pl-8 text-lg font-semibold"
            />
          </div>
        </div>

        {/* Umbral de Alerta */}
        <div className="subtrack-form-group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <AlertIcon />
            </div>
            <div>
              <label className="subtrack-form-label text-lg">Umbral de Alerta</label>
              <p className="text-gray-400 text-sm">Recibirás una alerta cuando alcances este porcentaje de tu presupuesto</p>
            </div>
          </div>
          
          <div className="relative">
            <Input
              name="threshold"
              type="number"
              min="1"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              required
              placeholder="80"
              className="subtrack-form-input pr-12 text-lg font-semibold"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">%</span>
          </div>
          
          {/* Barra de progreso visual */}
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>0%</span>
              <span>{threshold}%</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${threshold}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Resumen */}
        {(budget && Number.parseFloat(budget) > 0) && (
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <TargetIcon />
              Resumen de Configuración
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Presupuesto:</span>
                <p className="text-white font-semibold">${Number.parseFloat(budget).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-400">Alerta en:</span>
                <p className="text-orange-400 font-semibold">${(Number.parseFloat(budget) * Number.parseFloat(threshold) / 100).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1 subtrack-btn subtrack-btn-secondary"
          >
            <CancelIcon />
            Cancelar
          </Button>
          <Button 
            type="submit" 
            className="flex-1 subtrack-btn subtrack-btn-primary"
          >
            <SaveIcon />
            Guardar Presupuesto
          </Button>
        </div>
      </form>
    </Modal>
  )
}