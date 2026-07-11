// frontend/src/features/home/components/StatCard.tsx
import React from "react";
import { StatCardProps } from "../types";

export const StatCard: React.FC<StatCardProps> = ({ stat, delay = 0 }) => {
  return (
    <div 
      className="stat-card floating"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="stat-number">{stat.value}</div>
      <div className="stat-label">{stat.label}</div>
    </div>
  );
};