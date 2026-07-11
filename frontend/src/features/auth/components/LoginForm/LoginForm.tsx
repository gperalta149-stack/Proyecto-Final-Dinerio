import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import "./LoginForm.css";

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  className = "" 
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`auth-form ${className}`}>
      {error && (
        <div className="auth-form-error">
          <span>{error}</span>
        </div>
      )}

      <div className="auth-form-group">
        <label htmlFor="login-email" className="auth-form-label">
          <Mail size={16} />
          Correo Electrónico
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-form-input"
          placeholder="tu@email.com"
          disabled={loading}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-form-group">
        <label htmlFor="login-password" className="auth-form-label">
          <Lock size={16} />
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-form-input"
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="auth-btn auth-btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="auth-spinner" />
            Iniciando sesión...
          </>
        ) : (
          <>
            Iniciar Sesión
            <ArrowRight size={18} />
          </>
        )}
      </button>

      <div className="auth-footer">
        <p className="auth-footer-text">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="auth-footer-link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;