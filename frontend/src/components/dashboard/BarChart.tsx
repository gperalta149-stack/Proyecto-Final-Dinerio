"use client"

import type React from "react"
import { useMemo } from "react"
import type { Subscription } from "../../types"
import { formatCurrency, parseAmount } from "../../utils/formatters"

interface BarChartProps {
  subscriptions: Subscription[]
  currency?: string
}

export const BarChart: React.FC<BarChartProps> = ({ subscriptions, currency = "ARS" }) => {
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}

    subscriptions.forEach((sub) => {
      const category = sub.category_name || "Otros"
      const amount = parseAmount(sub.amount)
      
      const monthlyCost =
        sub.billing_cycle === "monthly"
          ? amount
          : sub.billing_cycle === "yearly"
            ? amount / 12
            : amount * 4
      categories[category] = (categories[category] || 0) + monthlyCost
    })

    return Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
    }))
  }, [subscriptions])

  const maxAmount = Math.max(...categoryData.map((d) => d.amount), 1)

  return (
    <div className="space-y-4">
      {categoryData.map((cat) => (
        <div key={cat.name}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">{cat.name}</span>
            <span className="text-sm font-semibold text-white">
              {formatCurrency(cat.amount, currency)}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(cat.amount / maxAmount) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {categoryData.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para mostrar</div>}
    </div>
  )
}