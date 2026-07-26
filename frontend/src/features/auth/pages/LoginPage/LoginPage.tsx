// frontend/src/features/auth/pages/LoginPage/LoginPage.tsx
import React from "react";
import { LoginForm } from "../../components/LoginForm";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { AuthBrand } from "../../components/AuthBrand/AuthBrand";
import { AuthCard } from "../../components/AuthCard/AuthCard";
import '../../../../styles/auth/auth.css';
import '../../../../styles/auth/LoginPage.css';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <AuthLayout
        brand={<AuthBrand />}
      >
        <AuthCard
          title="Bienvenido de vuelta"
          subtitle="Inicia sesión para gestionar tus suscripciones"
        >
          <LoginForm />
          <div className="auth-footer" style={{ marginTop: 0, borderTop: "none", paddingTop: 0 }}>
            <p className="auth-footer-text" style={{ fontSize: "var(--text-xs)" }}>
              Al iniciar sesión, aceptas nuestros{" "}
              <Link to="/terms" className="auth-footer-link">términos</Link> y{" "}
              <Link to="/privacy" className="auth-footer-link">política de privacidad</Link>.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    </div>
  );
};

export default LoginPage;