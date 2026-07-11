import Card from "../../../../shared/components/ui/Card"
import { formatCurrency } from "../../../../shared/utils/formatters"

interface BudgetAlertProps {
  totalSpent?: number | string
  budget?: number | string
  stats?: any
}

const safeParseNumber = (value: any): number => {
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
    const statsSpent = stats.monthlyTotal || stats.totalSpent || stats.spent
    const statsBudget = stats.monthlyBudget || stats.budget

    if (statsSpent !== undefined) spent = safeParseNumber(statsSpent)
    if (statsBudget !== undefined) monthlyBudget = safeParseNumber(statsBudget)
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
  return (
    <Card className={`border-2 ${isDanger ? "border-red-500 bg-red-500/5" : "border-orange-500 bg-orange-500/5"}`}>
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${isDanger ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold mb-2 ${isDanger ? "text-red-400" : "text-orange-400"}`}>
            {isDanger ? "¡Presupuesto Excedido!" : "Alerta de Presupuesto"}
          </h3>
          <p className="text-gray-300 mb-3">
            {isDanger
              ? `Has excedido tu presupuesto mensual en ${formatCurrency(spent - monthlyBudget)}.`
              : `Estás cerca de alcanzar tu presupuesto mensual (${percentage.toFixed(0)}%).`}
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${isDanger ? "bg-red-500" : "bg-orange-500"}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-gray-400">{formatCurrency(spent)} gastado</span>
            <span className="text-gray-400">{formatCurrency(monthlyBudget)} presupuesto</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
export { BudgetAlert }
