"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { validateEmail, validatePassword } from "../../utils/validators"
import { Button } from "../ui/Button"
import Card from "../ui/Card"
import Input from "../ui/Input"

// Iconos SVG
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const PasswordIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }))
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!validateEmail(email)) return
    
    setEmailChecking(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Error checking email:", error)
    } finally {
      setEmailChecking(false)
    }
  }

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value
    if (email && validateEmail(email)) {
      checkEmailAvailability(email)
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "El apellido debe tener al menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido"
    }

    const passwordResult = validatePassword(formData.password)
    if (!passwordResult.valid) {
      newErrors.password = passwordResult.message || "Contraseña inválida"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const result = await register(formData.email, formData.password, formData.firstName, formData.lastName)
      
      if (result.success) {
        // ✅ Limpiar el formulario
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
        
        // ✅ Redirigir inmediatamente al login SIN mensaje
        navigate("/login", { 
          state: { 
            message: "¡Registro exitoso! Ahora inicia sesión con tus credenciales.",
            registeredEmail: formData.email 
          }
        })
      } else {
        setErrors({ submit: result.error || "Error al registrarse" })
      }
      
    } catch (err: any) {
      // Manejar específicamente el error de email duplicado
      const errorMessage = err.response?.data?.error || "Error al registrarse"
      
      if (errorMessage.includes("Email already registered") || errorMessage.includes("email") || errorMessage.includes("ya existe")) {
        setErrors({
          email: "Este email ya está registrado. ¿Quieres iniciar sesión?",
          submit: "El email ya está en uso. Por favor, usa otro email o inicia sesión."
        })
      } else {
        setErrors({ submit: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container max-w-md mx-auto">
        <Card className="subtrack-card">
          <div className="text-center mb-8">
            <h1 className="page-title text-3xl">Crear Cuenta</h1>
            <p className="page-subtitle">Comienza a gestionar tus suscripciones hoy</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="subtrack-error-message">
                <div className="flex items-center gap-2">
                  <ErrorIcon />
                  <span>{errors.submit}</span>
                </div>
                {errors.submit.includes("inicia sesión") && (
                  <div className="mt-2">
                    <Link
                      to="/login"
                      className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                    >
                      ¿Ya tienes cuenta? Inicia sesión aquí
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Iconos separados de los labels */}
            <div className="subtrack-form-row">
              <div className="subtrack-form-group">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon />
                  <label className="subtrack-form-label">Nombre</label>
                </div>
                <Input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Juan"
                  error={errors.firstName}
                  required
                  className="subtrack-form-input"
                  disabled={loading}
                />
              </div>

              <div className="subtrack-form-group">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon />
                  <label className="subtrack-form-label">Apellido</label>
                </div>
                <Input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Pérez"
                  error={errors.lastName}
                  required
                  className="subtrack-form-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="subtrack-form-group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <EmailIcon />
                  <label className="subtrack-form-label">Email</label>
                </div>
                {emailChecking && (
                  <div className="flex items-center gap-1 text-blue-400 text-xs">
                    <div className="loading-spinner-small"></div>
                    Verificando...
                  </div>
                )}
                {formData.email && validateEmail(formData.email) && !errors.email && !emailChecking && (
                  <div className="flex items-center gap-1 text-green-400 text-xs">
                    <CheckIcon />
                    Formato válido
                  </div>
                )}
              </div>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="tu@email.com"
                error={errors.email}
                required
                className="subtrack-form-input"
                disabled={loading}
              />
              {errors.email && errors.email.includes("inicia sesión") && (
                <div className="mt-1">
                  <Link
                    to="/login"
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                  >
                    ¿Ya tienes cuenta? Inicia sesión aquí
                  </Link>
                </div>
              )}
            </div>

            <div className="subtrack-form-group">
              <div className="flex items-center gap-2 mb-2">
                <PasswordIcon />
                <label className="subtrack-form-label">Contraseña</label>
              </div>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.password}
                required
                className="subtrack-form-input"
                disabled={loading}
              />
              <div className="text-xs text-gray-400 mt-1">
                Mínimo 6 caracteres
              </div>
            </div>

            <div className="subtrack-form-group">
              <div className="flex items-center gap-2 mb-2">
                <PasswordIcon />
                <label className="subtrack-form-label">Confirmar contraseña</label>
              </div>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                error={errors.confirmPassword}
                required
                className="subtrack-form-input"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || emailChecking}
              className="subtrack-btn subtrack-btn-primary w-full py-3 text-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="loading-spinner-small"></div>
                  Creando cuenta...
                </div>
              ) : (
                "Crear Cuenta"
              )}
            </Button>

            <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
              >
                Inicia sesión
              </Link>
            </div>
            </form>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
            </div>
            </div>
        )
}

export { RegisterForm }