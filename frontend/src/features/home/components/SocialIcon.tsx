// frontend/src/features/home/components/SocialIcon.tsx
import React from "react";
import { SocialIconProps } from "../types";

export const SocialIcon: React.FC<SocialIconProps> = ({ 
  icon, 
  href, 
  label, 
  className = "social-link" 
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label}
    >
      {typeof icon === 'string' ? (
        <span className="text-xl">{icon}</span>
      ) : (
        icon
      )}
    </a>
  );
};