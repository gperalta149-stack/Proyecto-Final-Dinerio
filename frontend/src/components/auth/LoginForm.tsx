"use client"

import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Button } from "../ui/Button"
import Card from "../ui/Card"
import Input from "../ui/Input"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido a Dinerio</h1>
          <p className="text-gray-400">Inicia sesión para gestionar tus suscripciones</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">{error}</div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          <div className="text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}

export { LoginForm }
