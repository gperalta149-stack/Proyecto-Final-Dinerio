"use client"

import type React from "react"
import { useMemo } from "react"
import type { Subscription } from "../../types"
import { parseAmount } from "../../utils/formatters"

interface LineChartProps {
  subscriptions: Subscription[]
}

export const LineChart: React.FC<LineChartProps> = ({ subscriptions }) => {
  const projectionData = useMemo(() => {
    const now = new Date()
    const months = []

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthName = date.toLocaleDateString("es-ES", { month: "short" })
      const year = date.getFullYear()

      let total = 0
      subscriptions.forEach((sub) => {
        const amount = parseAmount(sub.amount)
        const monthlyCost =
          sub.billing_cycle === "monthly"
            ? amount
            : sub.billing_cycle === "yearly"
              ? amount / 12
              : amount * 4
        total += monthlyCost
      })

      months.push({
        label: `${monthName} ${year}`,
        amount: total,
      })
    }

    return months
  }, [subscriptions])

  const maxAmount = Math.max(...projectionData.map((d) => d.amount), 1)
  const chartHeight = 200
  const chartWidth = 600
  const padding = 40

  const points = projectionData
    .map((d, i) => {
      const x = padding + (i * (chartWidth - padding * 2)) / (projectionData.length - 1)
      const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  if (subscriptions.length === 0) {
    return <div className="text-center py-8 text-gray-400">No hay datos para mostrar</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ minWidth: "600px" }}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + (i * (chartHeight - padding * 2)) / 4
          return <line key={i} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#374151" strokeWidth="1" />
        })}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => {
          const value = maxAmount - (i * maxAmount) / 4
          const y = padding + (i * (chartHeight - padding * 2)) / 4
          return (
            <text key={i} x={padding - 10} y={y + 5} fill="#9CA3AF" fontSize="10" textAnchor="end">
              ${value.toFixed(0)}
            </text>
          )
        })}

        {/* Line */}
        <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" />

        {/* Points */}
        {projectionData.map((d, i) => {
          const x = padding + (i * (chartWidth - padding * 2)) / (projectionData.length - 1)
          const y = chartHeight - padding - (d.amount / maxAmount) * (chartHeight - padding * 2)
          return <circle key={i} cx={x} cy={y} r="4" fill="#6366f1" />
        })}

        {/* X-axis labels */}
        {projectionData.map((d, i) => {
          const x = padding + (i * (chartWidth - padding * 2)) / (projectionData.length - 1)
          return (
            <text
              key={i}
              x={x}
              y={chartHeight - 10}
              fill="#9CA3AF"
              fontSize="10"
              textAnchor="middle"
              transform={`rotate(-45 ${x} ${chartHeight - 10})`}
            >
              {d.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}