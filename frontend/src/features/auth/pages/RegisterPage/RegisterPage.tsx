// frontend/src/features/auth/pages/RegisterPage/RegisterPage.tsx
import React from "react";
import { RegisterForm } from "../../components/RegisterForm";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { AuthBrand } from "../../components/AuthBrand/AuthBrand";
import { AuthCard } from "../../components/AuthCard/AuthCard";
import '../../../../styles/auth/auth.css';
import '../../../../styles/auth/RegisterPage.css';
import { Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  return (
    <div className="register-page">
      <AuthLayout
        brand={<AuthBrand />}
      >
        <AuthCard
          title="Crear Cuenta"
          subtitle="Comienza a gestionar tus suscripciones hoy"
        >
          <RegisterForm />
          <div className="auth-footer" style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
            <p className="auth-footer-text" style={{ fontSize: "var(--text-xs)" }}>
              Al registrarte, aceptas nuestros{" "}
              <Link to="/terms" className="auth-footer-link">términos</Link> y{" "}
              <Link to="/privacy" className="auth-footer-link">política de privacidad</Link>.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    </div>
  );
};

export default RegisterPage;