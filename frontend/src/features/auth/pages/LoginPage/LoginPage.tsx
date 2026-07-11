// frontend/src/features/auth/pages/LoginPage/LoginPage.tsx
import React from "react";
import { LoginForm } from "../../components/LoginForm";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout";
import { AuthBrand } from "../../components/AuthBrand/AuthBrand";
import { AuthCard } from "../../components/AuthCard/AuthCard";
import "../../styles/auth.css";
import "./LoginPage.css";

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
              <a href="#" className="auth-footer-link">términos</a> y{" "}
              <a href="#" className="auth-footer-link">política de privacidad</a>.
            </p>
          </div>
        </AuthCard>
      </AuthLayout>
    </div>
  );
};

export default LoginPage;