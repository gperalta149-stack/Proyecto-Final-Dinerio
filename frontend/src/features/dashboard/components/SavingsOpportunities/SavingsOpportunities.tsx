// frontend/src/features/dashboard/components/dashboard/SavingsOpportunities/SavingsOpportunities.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, X, Moon, RefreshCw, DollarSign } from "lucide-react";
import type { Subscription } from "../../types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import "./SavingsOpportunities.css";

interface SavingsOpportunitiesProps {
  subscriptions: Subscription[];
  currency?: string;
}

export const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({
  subscriptions,
  currency = "ARS",
}) => {
  const opportunities = useMemo(() => {
    const ops: Array<{
      id: string;
      title: string;
      description: string;
      potentialSavings: number;
      type: "inactive" | "duplicate" | "expensive";
    }> = [];

    // 1. Buscar suscripciones inactivas (sin uso en los últimos 30 días)
    // Simulamos: si tiene más de 6 meses sin actualización
    subscriptions.forEach((sub) => {
      const updatedAt = new Date(sub.updated_at || sub.created_at || Date.now());
      const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 180 && sub.status === "active") {
        ops.push({
          id: `inactive-${sub.id}`,
          title: `${sub.name} sin uso`,
          description: "No has interactuado con esta suscripción en más de 6 meses",
          potentialSavings: parseAmount(sub.amount),
          type: "inactive",
        });
      }
    });

    // 2. Buscar duplicados (mismo nombre o categoría)
    const nameMap = new Map<string, Subscription[]>();
    subscriptions.forEach((sub) => {
      const key = sub.name?.toLowerCase() || "";
      if (!nameMap.has(key)) nameMap.set(key, []);
      nameMap.get(key)?.push(sub);
    });

    nameMap.forEach((subs) => {
      if (subs.length > 1 && subs.every(s => s.status === "active")) {
        const total = subs.reduce((sum, s) => sum + parseAmount(s.amount), 0);
        ops.push({
          id: `duplicate-${subs[0].id}`,
          title: `${subs[0].name} duplicado`,
          description: `Tienes ${subs.length} suscripciones similares`,
          potentialSavings: total * 0.5,
          type: "duplicate",
        });
      }
    });

    // 3. Buscar suscripciones caras (top 20%)
    const sorted = [...subscriptions]
      .filter(s => s.status === "active")
      .sort((a, b) => parseAmount(b.amount) - parseAmount(a.amount));
    const threshold = Math.ceil(sorted.length * 0.2);
    sorted.slice(0, threshold).forEach((sub) => {
      const amount = parseAmount(sub.amount);
      const avg = sorted.reduce((sum, s) => sum + parseAmount(s.amount), 0) / sorted.length;
      if (amount > avg * 1.5) {
        ops.push({
          id: `expensive-${sub.id}`,
          title: `${sub.name} es costosa`,
          description: `Cuesta ${((amount / avg - 1) * 100).toFixed(0)}% más que el promedio`,
          potentialSavings: amount * 0.3,
          type: "expensive",
        });
      }
    });

    // Limitar a 3 oportunidades y ordenar por ahorro potencial
    return ops
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 3);
  }, [subscriptions]);

  const typeIcons = {
    inactive: <Moon size={18} />,
    duplicate: <RefreshCw size={18} />,
    expensive: <DollarSign size={18} />,
  };

  const typeColors = {
    inactive: "#f59e0b",
    duplicate: "#8b5cf6",
    expensive: "#ef4444",
  };

  if (opportunities.length === 0) {
    return (
      <div className="savings-empty">
        <span className="empty-icon">✓</span>
        <p>Todo en orden. No hay oportunidades de ahorro.</p>
      </div>
    );
  }

  const totalSavings = opportunities.reduce((sum, op) => sum + op.potentialSavings, 0);

  return (
    <div className="savings-container">
      <div className="savings-header">
        <div className="savings-header-left">
          <Lightbulb size={18} className="savings-icon" />
          <span className="savings-title">Oportunidades de ahorro</span>
        </div>
        <div className="savings-total">
          <span className="savings-total-label">Ahorro potencial</span>
          <span className="savings-total-value">{formatCurrency(totalSavings, currency)}</span>
          <span className="savings-total-period">/mes</span>
        </div>
      </div>

      <div className="savings-list">
        {opportunities.map((op, index) => (
          <motion.div
            key={op.id}
            className="savings-item"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="savings-item-left">
              <span className="savings-item-icon">{typeIcons[op.type]}</span>
              <div>
                <div className="savings-item-title">{op.title}</div>
                <div className="savings-item-description">{op.description}</div>
              </div>
            </div>
            <div className="savings-item-right">
              <span className="savings-item-amount" style={{ color: typeColors[op.type] }}>
                -{formatCurrency(op.potentialSavings, currency)}
              </span>
              <button className="savings-item-action">
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavingsOpportunities;