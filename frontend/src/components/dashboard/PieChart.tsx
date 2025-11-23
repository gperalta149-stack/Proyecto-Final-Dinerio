"use client"

import type React from "react"
import { useMemo } from "react"
import type { Subscription } from "../../types"
import { parseAmount, formatCurrency } from "../../utils/formatters"

interface PieChartProps {
  subscriptions: Subscription[]
}

export const PieChart: React.FC<PieChartProps> = ({ subscriptions }) => {
  const { categoryData, total } = useMemo(() => {
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

    const total = Object.values(categories).reduce((sum, val) => sum + val, 0)
    const data = Object.entries(categories).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))

    return { categoryData: data, total }
  }, [subscriptions])

  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

  if (categoryData.length === 0) {
    return <div className="text-center py-8 text-gray-400">No hay datos para mostrar</div>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {
            categoryData.reduce(
              (acc, cat, index) => {
                const startAngle = acc.angle
                const angle = (cat.percentage / 100) * 360
                const endAngle = startAngle + angle

                const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180)
                const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180)
                const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180)
                const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180)

                const largeArc = angle > 180 ? 1 : 0
                const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`

                acc.elements.push(
                  <path
                    key={cat.name}
                    d={path}
                    fill={colors[index % colors.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />,
                )

                acc.angle = endAngle
                return acc
              },
              { angle: 0, elements: [] as React.JSX.Element[] },
            ).elements
          }
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
            <p className="text-gray-400 text-sm">Total mensual</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {categoryData.map((cat, index) => (
          <div key={cat.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-sm text-gray-300">{cat.name}</span>
            </div>
            <span className="text-sm text-white font-medium">{cat.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}