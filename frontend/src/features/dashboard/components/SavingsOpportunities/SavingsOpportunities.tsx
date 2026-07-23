import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, DollarSign, Clock, Calendar, RefreshCw, CheckCircle2 } from "lucide-react";
import type { Subscription } from "../../types";
import { formatCurrency, parseAmount } from "../../../../shared/utils/formatters";
import '../../../../styles/dashboard/SavingsOpportunities.css';

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
      type: "expensive" | "duplicate" | "inactive" | "annual";
    }> = [];

    const active = subscriptions.filter(s => s.status === "active");
    const avgAmount = active.length > 0
      ? active.reduce((sum, s) => sum + parseAmount(s.amount), 0) / active.length
      : 0;

    // 1. Expensive subscriptions
    active.forEach((sub) => {
      const amount = parseAmount(sub.amount);
      if (amount > avgAmount * 1.5 && active.length > 1) {
        ops.push({
          id: `expensive-${sub.id}`,
          title: `${sub.name} cuesta mucho más que el promedio`,
          description: `Cuesta ${((amount / avgAmount - 1) * 100).toFixed(0)}% más que el promedio de tus suscripciones`,
          potentialSavings: amount * 0.3,
          type: "expensive",
        });
      }
    });

    // 2. Duplicate streaming platforms
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
          title: `Tenés dos plataformas de streaming similares`,
          description: `${subs[0].name} aparece ${subs.length} veces`,
          potentialSavings: total * 0.5,
          type: "duplicate",
        });
      }
    });

    // 3. Inactive subscriptions (no usage)
    subscriptions.forEach((sub) => {
      const updatedAt = new Date(sub.updated_at || sub.created_at || Date.now());
      const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 120 && sub.status === "active") {
        ops.push({
          id: `inactive-${sub.id}`,
          title: `${sub.name} lleva ${Math.floor(daysSinceUpdate / 30)} meses sin uso`,
          description: "No se registró actividad reciente",
          potentialSavings: parseAmount(sub.amount),
          type: "inactive",
        });
      }
    });

    // 4. Annual plan savings
    active.forEach((sub) => {
      const amount = parseAmount(sub.amount);
      if (sub.billing_cycle === "monthly" && amount * 12 > 0) {
        const annualCost = amount * 12;
        const estimatedAnnualDiscount = annualCost * 0.15;
        ops.push({
          id: `annual-${sub.id}`,
          title: `Pasar a plan anual en ${sub.name}`,
          description: "Un plan anual suele ser 15% más barato",
          potentialSavings: estimatedAnnualDiscount / 12,
          type: "annual",
        });
      }
    });

    // Limit to 3 best opportunities
    return ops
      .sort((a, b) => b.potentialSavings - a.potentialSavings)
      .slice(0, 3);
  }, [subscriptions]);

  const totalSavings = opportunities.reduce((sum, op) => sum + op.potentialSavings, 0);

  const typeIcons: Record<string, React.ReactNode> = {
    expensive: <DollarSign size={18} />,
    duplicate: <RefreshCw size={18} />,
    inactive: <Clock size={18} />,
    annual: <Calendar size={18} />,
  };

  const typeColors: Record<string, string> = {
    expensive: "#ef4444",
    duplicate: "#8b5cf6",
    inactive: "#f59e0b",
    annual: "#22c55e",
  };

  if (opportunities.length === 0) {
    return (
      <div className="savings-container">
        <div className="savings-header">
          <div className="savings-header-left">
            <Lightbulb size={18} className="savings-icon" />
            <span className="savings-title">Oportunidades de ahorro</span>
          </div>
        </div>
        <div className="savings-empty">
          <CheckCircle2 size={48} className="empty-icon" />
          <p>No encontramos oportunidades de ahorro.</p>
          <p className="savings-empty-sub">Tus gastos son consistentes con el historial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="savings-container">
      <div className="savings-header">
        <div className="savings-header-left">
          <Lightbulb size={18} className="savings-icon" />
          <span className="savings-title">Oportunidades de ahorro</span>
        </div>
        <div className="savings-total">
          <span className="savings-total-label">Podrías ahorrar</span>
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
              <span className="savings-item-icon" style={{ color: typeColors[op.type] }}>
                {typeIcons[op.type]}
              </span>
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