"use client"

import { useMemo } from "react"
import Card from "../ui/Card"
import type { Subscription } from "../../types"
import { formatCurrency, parseAmount } from "../../utils/formatters"
import type { JSX } from "react"

interface ChartSectionProps {
  subscriptions: Subscription[] | null | undefined
  currency?: string
}

export default function ChartSection({ subscriptions, currency = "ARS" }: ChartSectionProps) {
  const safeSubscriptions = useMemo(() => {
    if (Array.isArray(subscriptions)) {
      return subscriptions
    }
    console.warn("ChartSection: subscriptions no es un array, usando array vacío")
    return []
  }, [subscriptions])

  const categoryData = useMemo(() => {
    try {
      const categories = safeSubscriptions.reduce(
        (acc, sub) => {
          const category = sub.category_name || "Otros"
          if (!acc[category]) {
            acc[category] = { total: 0, count: 0 }
          }
          acc[category].total += parseAmount(sub.amount)
          acc[category].count += 1
          return acc
        },
        {} as Record<string, { total: number; count: number }>,
      )

      return Object.entries(categories).map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        percentage: 0,
      }))
    } catch (error) {
      console.error("Error processing category data:", error)
      return []
    }
  }, [safeSubscriptions])

  const total = useMemo(() =>
    categoryData.reduce((sum, cat) => sum + cat.total, 0),
    [categoryData]
  )

  const dataWithPercentage = useMemo(() =>
    categoryData.map((cat) => ({
      ...cat,
      percentage: total > 0 ? (cat.total / total) * 100 : 0,
    })),
    [categoryData, total]
  )

  const colors = [
    "#6366f1", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
    "#f97316", "#a855f7", "#d946ef", "#0ea5e9"
  ]

  if (safeSubscriptions.length === 0) {
    return (
      <Card>
        <h3 className="text-xl font-semibold text-white mb-6">Distribución por Categoría</h3>
        <div className="text-gray-400 text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p>No hay suscripciones para mostrar</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-white mb-6">Distribución por Categoría</h3>

      <div className="flex flex-col lg:flex-row gap-8 items-center">
        <div className="flex-1 flex items-center justify-center min-h-80">
          <div className="relative w-72 h-72">
            <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
              {
                dataWithPercentage.reduce(
                  (acc, cat, index) => {
                    const startAngle = acc.angle
                    const angle = (cat.percentage / 100) * 360
                    const endAngle = startAngle + angle
                    const radius = 85
                    const x1 = 100 + radius * Math.cos((startAngle * Math.PI) / 180)
                    const y1 = 100 + radius * Math.sin((startAngle * Math.PI) / 180)
                    const x2 = 100 + radius * Math.cos((endAngle * Math.PI) / 180)
                    const y2 = 100 + radius * Math.sin((endAngle * Math.PI) / 180)

                    const largeArc = angle > 180 ? 1 : 0

                    const path = `M 100 100 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

                    acc.elements.push(
                      <path
                        key={cat.name}
                        d={path}
                        fill={colors[index % colors.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}
                      />,
                    )

                    acc.angle = endAngle
                    return acc
                  },
                  { angle: 0, elements: [] as JSX.Element[] },
                ).elements
              }
            </svg>
            
            {/*Centro del gráfico */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-gray-800/80 rounded-full w-24 h-24 flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
                <div>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(total, currency)}
                  </p>
                  <p className="text-gray-300 text-xs">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*Legend*/}
        <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-2">
          {dataWithPercentage
            .sort((a, b) => b.total - a.total)
            .map((cat, index) => (
            <div
              key={cat.name}
              className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/30"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-white/20"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{cat.name}</p>
                  <p className="text-gray-400 text-sm">{cat.count} suscripción{cat.count !== 1 ? 'es' : ''}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-semibold text-sm">
                  {formatCurrency(cat.total, currency)}
                </p>
                <p className="text-gray-400 text-sm">{cat.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*Estadísticas adicionales */}
      {dataWithPercentage.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <p className="text-gray-400 text-sm">Categorías</p>
              <p className="text-white font-semibold">{dataWithPercentage.length}</p>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <p className="text-gray-400 text-sm">Mayor categoría</p>
              <p className="text-white font-semibold text-sm truncate">
                {dataWithPercentage[0]?.name}
              </p>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <p className="text-gray-400 text-sm">Promedio/cat</p>
              <p className="text-white font-semibold text-sm">
                {formatCurrency(total / dataWithPercentage.length, currency)}
              </p>
            </div>
            <div className="p-3 bg-gray-800/30 rounded-lg">
              <p className="text-gray-400 text-sm">Suscripciones</p>
              <p className="text-white font-semibold">
                {safeSubscriptions.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { ChartSection }