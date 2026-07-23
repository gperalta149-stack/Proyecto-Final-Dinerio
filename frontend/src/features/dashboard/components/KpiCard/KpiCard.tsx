import React from "react";
import { motion } from "framer-motion";
import '../../../../styles/dashboard/KpiCard.css';

export type KpiCardColor = "spent" | "subscriptions" | "next-payment" | "budget" | "danger" | "warning" | "success" | "info" | "orange" | "red";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: KpiCardColor;
  progress?: number;
  badge?: { text: string; color: string };
  actions?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "spent",
  progress,
  badge,
  actions,
}) => {
  const colorMap = {
    spent: { bg: "rgba(99, 102, 241, 0.1)", icon: "#6366f1", bar: "#6366f1" },
    subscriptions: { bg: "rgba(139, 92, 246, 0.1)", icon: "#8b5cf6", bar: "#8b5cf6" },
    "next-payment": { bg: "rgba(6, 182, 212, 0.1)", icon: "#06b6d4", bar: "#06b6d4" },
    budget: { bg: "rgba(34, 197, 94, 0.1)", icon: "#22c55e", bar: "#22c55e" },
    danger: { bg: "rgba(239, 68, 68, 0.1)", icon: "#ef4444", bar: "#ef4444" },
    warning: { bg: "rgba(245, 158, 11, 0.1)", icon: "#f59e0b", bar: "#f59e0b" },
    success: { bg: "rgba(34, 197, 94, 0.1)", icon: "#22c55e", bar: "#22c55e" },
    info: { bg: "rgba(99, 102, 241, 0.1)", icon: "#818cf8", bar: "#818cf8" },
    orange: { bg: "rgba(245, 158, 11, 0.1)", icon: "#f59e0b", bar: "#f59e0b" },
    red: { bg: "rgba(239, 68, 68, 0.1)", icon: "#ef4444", bar: "#ef4444" },
  };

  return (
    <motion.div
      className="kpi-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      {actions && <div className="kpi-actions">{actions}</div>}
      <div className="kpi-icon-wrapper" style={{ background: colorMap[color].bg }}>
        <span style={{ color: colorMap[color].icon }}>{icon}</span>
      </div>
      <div className="kpi-title">{title}</div>
      <motion.div
        className="kpi-value"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {value}
      </motion.div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      {typeof progress === "number" && (
        <div className="kpi-progress-bar">
          <div className="kpi-progress-fill" style={{ width: `${Math.min(progress, 100)}%`, background: colorMap[color].bar }} />
        </div>
      )}
      {badge && (
        <div className="kpi-badge" style={{ background: `${badge.color}22`, color: badge.color }}>
          {badge.text}
        </div>
      )}
    </motion.div>
  );
};

export default KpiCard;

