import React from "react";
import { motion } from "framer-motion";
import "./KpiCard.css";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: "spent" | "subscriptions" | "next-payment" | "budget";
  progress?: number;
  badge?: { text: string; color: string };
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = "spent",
  progress,
  badge,
}) => {
  const colorMap = {
    spent: { bg: "var(--kpi-bg-spent)", icon: "var(--kpi-color-spent)", bar: "var(--kpi-color-spent)" },
    subscriptions: { bg: "var(--kpi-bg-subscriptions)", icon: "var(--kpi-color-subscriptions)", bar: "var(--kpi-color-subscriptions)" },
    "next-payment": { bg: "var(--kpi-bg-next-payment)", icon: "var(--kpi-color-next-payment)", bar: "var(--kpi-color-next-payment)" },
    budget: { bg: "var(--kpi-bg-budget)", icon: "var(--kpi-color-budget)", bar: "var(--kpi-color-budget)" },
  };

  return (
    <motion.div
      className="kpi-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
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
