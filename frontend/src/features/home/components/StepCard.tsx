// frontend/src/features/home/components/StepCard.tsx
import React from "react";
import { StepCardProps } from "../types";

export const StepCard: React.FC<StepCardProps> = ({ step, index = 0 }) => {
  return (
    <div 
      className="step-card"
      style={{ animationDelay: `${index * 0.2}s` }}
    >
      <div className="step-number">{step.step}</div>
      <h3 className="step-title">{step.title}</h3>
      <p className="step-description">{step.description}</p>
    </div>
  );
};