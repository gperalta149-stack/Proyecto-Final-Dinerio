// frontend/src/features/auth/components/AuthLayout/AuthLayout.tsx
import React from "react";
import { motion } from "framer-motion";
import "./AuthLayout.css";

interface AuthLayoutProps {
  children: React.ReactNode;
  brand: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, brand }) => {
  return (
    <div className="auth-layout">
      <div className="auth-layout-container">
        {/* Panel Izquierdo - Branding */}
        <motion.div
          className="auth-brand-panel"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {brand}
        </motion.div>

        {/* Panel Derecho - Formulario */}
        <motion.div
          className="auth-form-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};