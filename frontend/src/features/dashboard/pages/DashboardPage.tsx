import React, { useState, useEffect } from "react";
import { Upload, Hand, CalendarClock, Lightbulb, ArrowRight, CheckCircle, Pencil, Plus, Trash2, TrendingDown, Zap, Award, AlertTriangle, BarChart3, Target, BookOpen, Bell, PieChart, Activity } from "lucide-react";
import { useDashboard, useDashboardData } from "../hooks";
import { useAuth } from "../../../shared/contexts/AuthContext";
import { BudgetAlert } from "../components/BudgetAlert";
import { DashboardKpis } from "../components/DashboardKpis";
import { auditService, type AuditLog } from "../../audit/service/auditService";
import { parseAmount } from "../../../shared/utils/formatters";
import '../../../styles/dashboard/dashboard.css';
import '../../../styles/shared/cards.css';

const DONUT_RADIUS = 60;
const DONUT_STROKE = 14;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const getDaysUntil = (date: string) => {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getDaysText = (days: number) => {
  if (days < 0) return `Vencida hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? "s" : ""}`;
  if (days === 0) return "Vence hoy";
  if (days <= 3) return `Vence en ${days} día${days !== 1 ? "s" : ""}`;
  return `Faltan ${days} días`;
};

const getUrgencyColor = (days: number) => {
  if (days < 0) return "#ef4444";
  if (days <= 3) return "#f59e0b";
  return "var(--text-secondary)";
};

const getAvatarColor = (name: string) => {
  const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatCurrency = (amount: number, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);

interface TipData {
  icon: React.ReactNode;
  text: string;
  priority: number;
}

const getSmartTip = (
  upcoming: any[],
  budgetPercentage: number,
  totalMonthly: number,
  budget: number,
  activeSubscriptions: number,
  categoryData: { name: string; amount: number }[],
  subscriptions: any[],
): TipData | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const dueToday = upcoming.find((s: any) => {
    const d = new Date(s.next_billing_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const dueTomorrow = upcoming.find((s: any) => {
    const d = new Date(s.next_billing_date);
    d.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.getTime() === tomorrow.getTime();
  });

  const dueThisWeek = upcoming.filter((s: any) => {
    const d = new Date(s.next_billing_date);
    d.setHours(0, 0, 0, 0);
    return d >= today && d <= weekEnd;
  });

  const overdue = upcoming.filter((s: any) => {
    const d = new Date(s.next_billing_date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });

  const topCat = categoryData[0];
  const mostExpensive = (subscriptions || [])
    .filter((s: any) => s.status === "active")
    .sort((a: any, b: any) => (parseAmount(b.amount) || 0) - (parseAmount(a.amount) || 0))[0];

  const tips: TipData[] = [];

  // 🔴 Critical alerts (priority 1)
  if (dueToday) {
    const amt = formatCurrency(dueToday.arsAmount || parseAmount(dueToday.amount) || 0, dueToday.currency || "ARS");
    tips.push({
      icon: <AlertTriangle size={16} />,
      text: `Hoy vence ${dueToday.name} (${amt}). Evitá cargos por atraso registrando el pago.`,
      priority: 1,
    });
  }
  if (overdue.length > 0) {
    tips.push({
      icon: <AlertTriangle size={16} />,
      text: `Tenés ${overdue.length} pago${overdue.length !== 1 ? "s" : ""} vencido${overdue.length !== 1 ? "s" : ""}. Regularizá tu situación para evitar cargos extras.`,
      priority: 1,
    });
  }

  // 🟠 Savings opportunities (priority 2)
  if (mostExpensive && parseAmount(mostExpensive.amount) > 50000) {
    tips.push({
      icon: <Zap size={16} />,
      text: `${mostExpensive.name} es tu suscripción más cara. Revisá si podés cambiarla por un plan más económico.`,
      priority: 2,
    });
  }
  if (activeSubscriptions >= 5) {
    tips.push({
      icon: <TrendingDown size={16} />,
      text: `Tenés ${activeSubscriptions} suscripciones activas. Revisá las que no usás hace tiempo y ahorrá.`,
      priority: 2,
    });
  }

  // 🟢 Budget status (priority 3)
  if (budgetPercentage >= 80) {
    tips.push({
      icon: <BarChart3 size={16} />,
      text: `Ya utilizaste el ${budgetPercentage.toFixed(0)}% de tu presupuesto mensual. Moderá los gastos para lo que queda del mes.`,
      priority: 3,
    });
  } else if (budgetPercentage <= 30) {
    const remaining = budget - totalMonthly;
    tips.push({
      icon: <BarChart3 size={16} />,
      text: `Tu presupuesto todavía tiene un ${(100 - budgetPercentage).toFixed(0)}% disponible (${formatCurrency(remaining)}). ¡Vas muy bien!`,
      priority: 3,
    });
  } else {
    const remaining = budget - totalMonthly;
    if (remaining > 0) {
      tips.push({
        icon: <BarChart3 size={16} />,
        text: `Todavía podés gastar ${formatCurrency(remaining)} sin superar tu límite mensual.`,
        priority: 3,
      });
    }
  }

  // 📅 Upcoming payments (priority 4)
  if (dueTomorrow) {
    tips.push({
      icon: <CalendarClock size={16} />,
      text: `Mañana vence ${dueTomorrow.name}. Preparate para registrar el pago.`,
      priority: 4,
    });
  }
  if (dueThisWeek.length >= 3) {
    tips.push({
      icon: <CalendarClock size={16} />,
      text: `Esta semana vencen ${dueThisWeek.length} suscripciones. Organizate para no atrasarte.`,
      priority: 4,
    });
  }
  if (dueThisWeek.length === 0 && upcoming.length === 0) {
    tips.push({
      icon: <CalendarClock size={16} />,
      text: `No tenés pagos programados para los próximos 7 días. Aprovechá para revisar tu presupuesto.`,
      priority: 4,
    });
  }

  // 🔵 Achievements (priority 5)
  if (overdue.length === 0 && activeSubscriptions > 0) {
    tips.push({
      icon: <Award size={16} />,
      text: `¡No tenés deudas pendientes! Todas tus suscripciones están al día.`,
      priority: 5,
    });
  }

  // 📉 Statistics (priority 6)
  if (topCat && topCat.amount > 0) {
    const pct = ((topCat.amount / categoryData.reduce((s, c) => s + c.amount, 0)) * 100).toFixed(0);
    tips.push({
      icon: <BarChart3 size={16} />,
      text: `${topCat.name} representa el ${pct}% de tus gastos mensuales.`,
      priority: 6,
    });
  }
  if (mostExpensive) {
    tips.push({
      icon: <BarChart3 size={16} />,
      text: `${mostExpensive.name} es tu suscripción más cara (${formatCurrency(mostExpensive.arsAmount || parseAmount(mostExpensive.amount) || 0, mostExpensive.currency || "ARS")} al mes).`,
      priority: 6,
    });
  }

  // 🎯 Optimization (priority 7)
  tips.push({
    icon: <Target size={16} />,
    text: `Revisá tus suscripciones cada mes. Cancelar una que no uses puede representar un ahorro importante.`,
    priority: 7,
  });

  // 📆 Reminders (priority 8)
  tips.push({
    icon: <Bell size={16} />,
    text: `Es un buen momento para revisar tu presupuesto y organizar tus gastos.`,
    priority: 8,
  });

  // 🎓 Financial education (priority 9)
  tips.push({
    icon: <BookOpen size={16} />,
    text: `Revisar tus gastos una vez por semana ayuda a mantener el control financiero.`,
    priority: 9,
  });

  // Return the highest priority tip
  tips.sort((a, b) => a.priority - b.priority);
  return tips[0] || null;
};

const getTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHr < 24) return `Hace ${diffHr} hora${diffHr !== 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
};

interface ActivityItem {
  icon: string;
  text: string;
  time: string;
}

const logToActivity = (log: AuditLog): ActivityItem => {
  const details = log.details || {};
  const name = (details as any).name || "";
  switch (log.action) {
    case "CREATE":
      return { icon: "plus", text: `Nueva suscripción "${name}"`, time: getTimeAgo(log.created_at) };
    case "UPDATE":
      return { icon: "edit", text: `Se editó "${name}"`, time: getTimeAgo(log.created_at) };
    case "DELETE":
      return { icon: "trash", text: `Se eliminó "${name}"`, time: getTimeAgo(log.created_at) };
    default:
      return { icon: "check", text: `"${name}" ${log.action.toLowerCase()}`, time: getTimeAgo(log.created_at) };
  }
};

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case "check": return <CheckCircle size={14} className="activity-icon activity-icon--check" />;
    case "edit": return <Pencil size={14} className="activity-icon activity-icon--edit" />;
    case "plus": return <Plus size={14} className="activity-icon activity-icon--plus" />;
    case "trash": return <Trash2 size={14} className="activity-icon activity-icon--trash" />;
    default: return null;
  }
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { stats, subscriptions, loading } = useDashboard();
  const data = useDashboardData(stats, subscriptions);
  const [activities, setActivities] = useState<ActivityItem[]>([
    { icon: "plus", text: "Cargando actividad...", time: "" },
  ]);
  const [activityPage, setActivityPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.max(1, Math.ceil(activities.length / perPage));
  const displayActivities = activities.slice(activityPage * perPage, (activityPage + 1) * perPage);

  useEffect(() => {
    const load = async () => {
      try {
        const logs = await auditService.getRecent(10);
        setActivities(logs.map(logToActivity));
      } catch {
        setActivities([]);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const categoryData = React.useMemo(() => {
    const cats: Record<string, number> = {};
    (subscriptions || []).forEach((sub) => {
      const category = sub.category_name || sub.category || "Otros";
      const amount = parseAmount(sub.amount) || 0;
      let monthly = amount;
      if (sub.billing_cycle === "yearly") monthly = amount / 12;
      else if (sub.billing_cycle === "weekly") monthly = amount * 4;
      cats[category] = (cats[category] || 0) + monthly;
    });
    return Object.entries(cats)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [subscriptions]);

  const totalCategory = categoryData.reduce((s, c) => s + c.amount, 0);
  const topCategory = categoryData[0];
  const topCategoryPct = totalCategory > 0 && topCategory ? (topCategory.amount / totalCategory) * 100 : 0;
  const topSubscriptions = (subscriptions || [])
    .filter((s: any) => s.status === "active")
    .sort((a: any, b: any) => (parseAmount(b.amount) || 0) - (parseAmount(a.amount) || 0))
    .slice(0, 3);
  const upcoming = (data.upcoming || []).filter((s: any) => s.status === "active").slice(0, 3);

  const tip = React.useMemo(
    () => getSmartTip(data.upcoming, data.budgetPercentage, data.totalMonthly, data.budget, data.activeSubscriptions, categoryData, subscriptions),
    [data.upcoming, data.budgetPercentage, data.totalMonthly, data.budget, data.activeSubscriptions, categoryData, subscriptions],
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-hero">
          <h1 className="dashboard-hero-greeting"><Hand size={22} className="dashboard-hero-icon" /> Hola, {user?.first_name || user?.name?.split(' ')[0] || "Usuario"}</h1>

        </div>

        {data.budgetPercentage > 80 && (
          <BudgetAlert totalSpent={data.totalMonthly} budget={data.budget} />
        )}

        <div className="dashboard-kpis-container">
          <DashboardKpis
            totalMonthly={data.totalMonthly}
            activeSubscriptions={data.activeSubscriptions}
            pausedSubscriptions={data.pausedSubscriptions}
            nextPayment={data.nextPayment}
            budget={data.budget}
            budgetPercentage={data.budgetPercentage}
            stats={stats}
            badgeForNextPayment={data.badgeForNextPayment}
          />
        </div>

        <div className="dashboard-grid-2">
          <div className="dashboard-card upcoming-detailed-card">
            <div className="upcoming-detailed-header">
              <CalendarClock size={14} /> {upcoming.length} próximos pagos
            </div>
            <div className="upcoming-detailed-list">
              {upcoming.map((sub: any) => {
                const days = getDaysUntil(sub.next_billing_date);
                return (
                  <div key={sub.id} className="upcoming-detailed-item">
                    <div className="upcoming-detailed-avatar" style={{ background: getAvatarColor(sub.name || "") }}>
                      {(sub.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="upcoming-detailed-info">
                      <span className="upcoming-detailed-name">{sub.name || "Sin nombre"}</span>
                      <span className="upcoming-detailed-date">
                        {new Date(sub.next_billing_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className="upcoming-detailed-right">
                      <span className="upcoming-detailed-amount">{formatCurrency(sub.arsAmount || parseAmount(sub.amount) || 0, sub.currency || "ARS")}</span>
                      <span className="upcoming-detailed-days" style={{ color: getUrgencyColor(days) }}>
                        {getDaysText(days)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {upcoming.length === 0 && <div className="upcoming-detailed-empty">No hay pagos próximos</div>}
            </div>
          </div>
          <div className="dashboard-card donut-card">
            <div className="donut-card-header"><PieChart size={14} /> Categoría principal</div>
            <div className="donut-card-body">
              <div className="donut-gauge">
                <svg viewBox="0 0 180 180" className="donut-gauge-ring">
                  <circle cx="90" cy="90" r={DONUT_RADIUS} fill="none"
                    stroke="var(--border-subtle)" strokeWidth={DONUT_STROKE} />
                  <circle cx="90" cy="90" r={DONUT_RADIUS} fill="none"
                    stroke="var(--accent-1)" strokeWidth={DONUT_STROKE}
                    strokeLinecap="round"
                    strokeDasharray={DONUT_CIRCUMFERENCE}
                    strokeDashoffset={DONUT_CIRCUMFERENCE - (topCategoryPct / 100) * DONUT_CIRCUMFERENCE}
                    transform="rotate(-90 90 90)"
                    className="donut-gauge-fill"
                  />
                </svg>
                <div className="donut-gauge-center">
                  <span className="donut-gauge-value">
                    {topCategoryPct.toFixed(0)}<span className="donut-gauge-percent">%</span>
                  </span>
                  <span className="donut-gauge-caption">{topCategory?.name || "—"}</span>
                </div>
              </div>
              <div className="donut-subs-list">
                {topSubscriptions.map((sub: any) => (
                  <div key={sub.id} className="donut-subs-item">
                    <div className="donut-subs-avatar" style={{ background: getAvatarColor(sub.name || "") }}>
                      {(sub.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="donut-subs-info">
                      <span className="donut-subs-name">{sub.name || "Sin nombre"}</span>
                      <span className="donut-subs-amount">{formatCurrency(sub.arsAmount || parseAmount(sub.amount) || 0, sub.currency || "ARS")}</span>
                    </div>
                  </div>
                ))}
                {topSubscriptions.length === 0 && <div className="donut-subs-empty">Sin suscripciones</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="dashboard-tip-card">
            <div className="dashboard-tip-header">
              <Lightbulb size={16} className="dashboard-tip-icon" /> Tip del día
            </div>
            {tip && (
              <div className="dashboard-tip-body">
                <span className="dashboard-tip-icon-badge">{tip.icon}</span>
                <p className="dashboard-tip-text">{tip.text}</p>
              </div>
            )}
            <a href="/reports" className="dashboard-tip-link">Ver análisis <ArrowRight size={12} /></a>
          </div>
          <div className="dashboard-card activity-card">
            <div className="activity-header"><Activity size={14} /> Actividad reciente</div>
            <div className="activity-list">
              {displayActivities.map((act, i) => (
                <div key={i} className="activity-item">
                  <span className="activity-icon-wrapper">
                    <ActivityIcon type={act.icon} />
                  </span>
                  <div className="activity-info">
                    <span className="activity-text">{act.text}</span>
                    <span className="activity-time">{act.time}</span>
                  </div>
                </div>
              ))}
              {activities.length > perPage && (
                <div className="activity-pages">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`activity-page-btn${i === activityPage ? ' active' : ''}`}
                      onClick={() => setActivityPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;