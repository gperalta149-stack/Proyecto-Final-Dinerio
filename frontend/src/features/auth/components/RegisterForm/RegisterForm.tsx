import React, { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Lock, 
  UserPlus, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { useAuth } from "../../../../shared/contexts/AuthContext";
import { validateEmail, validatePassword } from "../../../../shared/utils/validators";
import { useEmailCheck } from "../../hooks/useEmailCheck";
import '../../../../styles/auth/RegisterForm.css';

interface RegisterFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  className = "" 
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { checking: emailChecking, checkEmail } = useEmailCheck();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: "" }));
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && validateEmail(email)) {
      const isAvailable = await checkEmail(email);
      if (!isAvailable) {
        setErrors((prev) => ({ 
          ...prev, 
          email: "Este email ya está registrado" 
        }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es requerido";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Mínimo 2 caracteres";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es requerido";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Mínimo 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) {
      newErrors.password = passwordResult.message || "Contraseña inválida";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      if (result.success) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

        if (onSuccess) {
          onSuccess();
        } else {
          navigate("/login", {
            state: {
              message: "¡Registro exitoso! Ahora inicia sesión.",
              registeredEmail: formData.email
            }
          });
        }
      } else {
        setErrors({ submit: result.error || "Error al registrarse" });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Error al registrarse";
      
      if (errorMessage.includes("Email already registered") || 
          errorMessage.includes("ya existe") ||
          errorMessage.includes("already")) {
        setErrors({
          email: "Este email ya está registrado",
          submit: "El email ya está en uso. Por favor, inicia sesión."
        });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatus = (field: string) => {
    const value = formData[field as keyof typeof formData];
    if (!value) return null;
    if (errors[field]) return "error";
    return "valid";
  };

  return (
    <form onSubmit={handleSubmit} className={`auth-form ${className}`}>
      {errors.submit && (
        <div className="auth-form-error">
          <AlertCircle size={16} />
          <span>{errors.submit}</span>
        </div>
      )}

      <div className="auth-row">
        <div className="auth-form-group">
          <label htmlFor="firstName" className="auth-form-label">
            <User size={16} />
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            className={`auth-form-input ${errors.firstName ? "error" : ""}`}
            placeholder="Juan"
            disabled={loading}
            required
            autoComplete="given-name"
          />
          {errors.firstName && (
            <span className="auth-field-error">{errors.firstName}</span>
          )}
        </div>

        <div className="auth-form-group">
          <label htmlFor="lastName" className="auth-form-label">
            <User size={16} />
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            className={`auth-form-input ${errors.lastName ? "error" : ""}`}
            placeholder="Pérez"
            disabled={loading}
            required
            autoComplete="family-name"
          />
          {errors.lastName && (
            <span className="auth-field-error">{errors.lastName}</span>
          )}
        </div>
      </div>

      <div className="auth-form-group">
        <label htmlFor="email" className="auth-form-label">
          <Mail size={16} />
          Correo Electrónico
          {emailChecking && <Loader2 size={14} className="auth-spinner" />}
          {getFieldStatus("email") === "valid" && !emailChecking && (
            <CheckCircle size={14} className="auth-valid-icon" />
          )}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleEmailBlur}
          className={`auth-form-input ${errors.email ? "error" : ""}`}
          placeholder="tu@email.com"
          disabled={loading || emailChecking}
          required
          autoComplete="email"
        />
        {errors.email && (
          <span className="auth-field-error">{errors.email}</span>
        )}
      </div>

      <div className="auth-form-group">
        <label htmlFor="password" className="auth-form-label">
          <Lock size={16} />
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          className={`auth-form-input ${errors.password ? "error" : ""}`}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />
        {errors.password && (
          <span className="auth-field-error">{errors.password}</span>
        )}
        <span className="auth-hint">Mínimo 6 caracteres</span>
      </div>

      <div className="auth-form-group">
        <label htmlFor="confirmPassword" className="auth-form-label">
          <Lock size={16} />
          Confirmar Contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={`auth-form-input ${errors.confirmPassword ? "error" : ""}`}
          placeholder="••••••••"
          disabled={loading}
          required
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <span className="auth-field-error">{errors.confirmPassword}</span>
        )}
      </div>

      <button
        type="submit"
        className="auth-btn auth-btn-primary"
        disabled={loading || emailChecking}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="auth-spinner" />
            Creando cuenta...
          </>
        ) : (
          <>
            Crear Cuenta
            <UserPlus size={18} />
          </>
        )}
      </button>

      <div className="auth-footer">
        <p className="auth-footer-text">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="auth-footer-link">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;