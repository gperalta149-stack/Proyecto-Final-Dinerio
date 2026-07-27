import { formatCurrency } from "../../../../shared/utils/formatters"
import '../../../../styles/dashboard/BudgetAlert.css'
import type { DashboardStats } from "../../../../shared/types"

interface BudgetAlertProps {
  totalSpent?: number | string
  budget?: number | string
  stats?: DashboardStats
}

const safeParseNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export default function BudgetAlert({ totalSpent, budget, stats }: BudgetAlertProps) {
  let spent = safeParseNumber(totalSpent)
  let monthlyBudget = safeParseNumber(budget)

  if (stats) {
    if (stats.monthlyTotal !== undefined) spent = safeParseNumber(stats.monthlyTotal)
    if (stats.monthlyBudget !== undefined) monthlyBudget = safeParseNumber(stats.monthlyBudget)
  }
  if (monthlyBudget <= 0) {
    return null
  }
  const percentage = (spent / monthlyBudget) * 100
  const isWarning = percentage >= 80
  const isDanger = percentage >= 100
  if (!isWarning) {
    return null
  }
  const mod = isDanger ? "danger" : "warning"
  return (
    <div className={`budget-alert border-${mod}`}>
      <div className="budget-alert-inner">
        <div className={`budget-alert-icon ${mod}`}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="budget-alert-body">
          <h3 className={`budget-alert-title ${mod}`}>
            {isDanger ? "¡Presupuesto Excedido!" : "Alerta de Presupuesto"}
          </h3>
          <p className="budget-alert-text">
            {isDanger
              ? `Has excedido tu presupuesto mensual en ${formatCurrency(spent - monthlyBudget)}.`
              : `Estás cerca de alcanzar tu presupuesto mensual (${percentage.toFixed(0)}%).`}
          </p>
          <div className="budget-alert-bar">
            <div
              className="budget-alert-fill"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                background: isDanger ? "#ef4444" : "#f59e0b",
              }}
            />
          </div>
          <div className="budget-alert-footer">
            <span>{formatCurrency(spent)} gastado</span>
            <span>{formatCurrency(monthlyBudget)} presupuesto</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export { BudgetAlert }
