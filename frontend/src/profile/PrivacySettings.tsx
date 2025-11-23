"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { User } from "../types"
import { userService } from "../services/userService"

interface PrivacySettingsProps {
  user: User
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user }) => {
  const [settings, setSettings] = useState({
    currency: user.currency || "USD",
    language: user.language || "es",
    notifications_enabled: user.notifications_enabled ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userService.updateSettings(settings)
      setMessage("Configuración actualizada exitosamente")
    } catch (error) {
      console.error("Error updating settings:", error)
      setMessage("Error al actualizar la configuración")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Preferencias</h3>
        <p className="text-sm text-gray-600 mb-6">
          Personaliza cómo quieres usar Dinerio
        </p>
      </div>

      {/* Mensaje de Alerta */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.includes("éxito")
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuración de Moneda */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
            Moneda Predeterminada
          </label>
          <select
            id="currency"
            value={settings.currency}
            onChange={(e) => handleSettingChange("currency", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="USD">USD - Dólar Americano</option>
            <option value="EUR">EUR - Euro</option>
            <option value="ARS">ARS - Peso Argentino</option>
            <option value="MXN">MXN - Peso Mexicano</option>
            <option value="COP">COP - Peso Colombiano</option>
            <option value="CLP">CLP - Peso Chileno</option>
            <option value="BRL">BRL - Real Brasileño</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Esta moneda se usará para mostrar todos los montes en la aplicación
          </p>
        </div>

        {/* Configuración de Idioma */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            Idioma
          </label>
          <select
            id="language"
            value={settings.language}
            onChange={(e) => handleSettingChange("language", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            El idioma de la interfaz de la aplicación
          </p>
        </div>

        {/* Configuración de Notificaciones */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifications" className="block text-sm font-medium text-gray-700 mb-1">
                Notificaciones por Email
              </label>
              <p className="text-xs text-gray-500">
                Recibe recordatorios de pagos y resúmenes mensuales
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => handleSettingChange("notifications_enabled", !settings.notifications_enabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  settings.notifications_enabled ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Gestión de Datos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Gestión de Datos</h4>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-300"
            >
              📥 Exportar mis datos
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              🗑️ Eliminar mi cuenta
            </button>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      </form>
    </div>
  )
}