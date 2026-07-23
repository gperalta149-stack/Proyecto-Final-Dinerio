// frontend/src/features/auth/components/AuthCard/AuthCard.tsx
import React from "react";
import '../../../../styles/auth/AuthCard.css';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="auth-card-content">
      <div className="auth-header">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};