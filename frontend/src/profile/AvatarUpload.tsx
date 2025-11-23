"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { User } from "../types"

interface AvatarUploadProps {
  user: User
  onUpdate: (userData: Partial<User>) => void
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onUpdate }) => {
  const [previewUrl, setPreviewUrl] = useState(user.avatar_url || "")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreviewUrl(result)
        handleAvatarUpdate(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpdate = async (avatarUrl: string) => {
    setLoading(true)
    try {
      await onUpdate({ avatar_url: avatarUrl })
    } catch (error) {
      console.error("Error updating avatar:", error)
      alert("Error al actualizar la foto de perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    setLoading(true)
    try {
      await onUpdate({ avatar_url: "" })
      setPreviewUrl("")
    } catch (error) {
      console.error("Error removing avatar:", error)
      alert("Error al eliminar la foto de perfil")
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    const first = user.first_name?.[0] || ''
    const last = user.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Foto de Perfil</h3>
        <p className="text-sm text-gray-600 mb-6">
          Actualiza tu foto de perfil. Se recomienda una imagen cuadrada de al menos 200x200 píxeles.
        </p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Avatar */}
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-white text-2xl font-bold">
                {getInitials()}
              </span>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {previewUrl ? "Cambiar Foto" : "Subir Foto"}
          </button>

          {previewUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>

        {/* Texto de Ayuda */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Formatos soportados: JPG, PNG, GIF
          </p>
          <p className="text-xs text-gray-500">
            Tamaño máximo: 5MB
          </p>
        </div>
      </div>

      {/* Info Avatar */}
      {user.avatar_url && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            Foto actual
          </h4>
          <p className="text-xs text-blue-700">
            Tu foto de perfil está visible para otros usuarios en la aplicación.
          </p>
        </div>
      )}
    </div>
  )
}