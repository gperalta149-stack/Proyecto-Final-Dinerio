"use client"

import type React from "react"
import { useMemo } from "react"
import { formatCurrency } from "../../utils/formatters"

// Interface actualizada para coincidir con los datos convertidos
interface EvolutionData {
  year: number;
  month: number;
  monthName: string;
  monthly_total: number;
  cumulative_total?: number;
  subscription_count: number;
}

interface EvolutionChartProps {
  monthlyData: EvolutionData[]
  currency: string
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ monthlyData, currency }) => {
  const chartData = useMemo(() => {
    // Si los datos ya tienen monthName, usarlos, sino calcularlos
    return monthlyData.map(item => ({
      ...item,
      monthName: item.monthName || new Date(item.year, item.month - 1).toLocaleDateString('es-ES', { month: 'short' })
    }))
  }, [monthlyData])

  // Usar monthly_total para el gráfico (en lugar de cumulative_total)
  const maxAmount = Math.max(...chartData.map(d => d.monthly_total), 1)
  const chartHeight = 250
  const chartWidth = 800
  const padding = 50

  const points = chartData
    .map((d, i) => {
      const x = padding + (i * (chartWidth - padding * 2)) / (chartData.length - 1)
      const y = chartHeight - padding - (d.monthly_total / maxAmount) * (chartHeight - padding * 2)
      return `${x},${y}`
    })
    .join(" ")

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-lg">
        <div className="text-4xl mb-3">📈</div>
        <p>No hay datos de evolución mensual para mostrar</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Evolución Anual de Gastos</h3>
          <p className="text-gray-400 text-sm mt-1">
            Tendencias de gastos mensuales - {chartData[0]?.year}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total anual</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(
              chartData.reduce((sum, month) => sum + month.monthly_total, 0),
              currency
            )}
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          style={{ minWidth: "800px" }}
        >
          {/*Fondo con gradiente */}
          <defs>
            <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/*Área bajo la línea */}
          <path
            d={`M ${padding},${chartHeight - padding} ${points} L ${chartWidth - padding},${chartHeight - padding} Z`}
            fill="url(#areaGradient)"
          />

          {/*Grid lines horizontales */}
          {[0, 1, 2, 3, 4].map((i) => {
            const y = padding + (i * (chartHeight - padding * 2)) / 4
            return (
              <g key={i}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={chartWidth - padding} 
                  y2={y} 
                  stroke="#374151" 
                  strokeWidth="1" 
                  strokeDasharray="4 2"
                />
              </g>
            )
          })}

          {/*Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => {
            const value = maxAmount - (i * maxAmount) / 4
            const y = padding + (i * (chartHeight - padding * 2)) / 4
            return (
              <text
                key={i}
                x={padding - 15}
                y={y + 4}
                fill="#9CA3AF"
                fontSize="11"
                textAnchor="end"
                className="font-medium"
              >
                {formatCurrency(value, currency)}
              </text>
            )
          })}

          {/*Línea principal */}
          <polyline
            points={points}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/*Puntos interactivos */}
          {chartData.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2)) / (chartData.length - 1)
            const y = chartHeight - padding - (d.monthly_total / maxAmount) * (chartHeight - padding * 2)
            
            return (
              <g key={i}>
                {/* Línea vertical guía */}
                <line
                  x1={x}
                  y1={padding}
                  x2={x}
                  y2={chartHeight - padding}
                  stroke="#4B5563"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.5"
                />
                
                {/* Punto */}
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#10b981"
                  stroke="#059669"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-8 transition-all duration-200"
                />
                
                {/* Tooltip */}
                <text
                  x={x}
                  y={y - 15}
                  fill="#10b981"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="bold"
                  className="bg-gray-900 px-2 py-1 rounded"
                >
                  {formatCurrency(d.monthly_total, currency)}
                </text>
              </g>
            )
          })}

          {/*X-axis labels */}
          {chartData.map((d, i) => {
            const x = padding + (i * (chartWidth - padding * 2)) / (chartData.length - 1)
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 20}
                fill="#9CA3AF"
                fontSize="12"
                textAnchor="middle"
                fontWeight="500"
              >
                {d.monthName}
              </text>
            )
          })}
        </svg>
      </div>

      {/*Estadísticas*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
          <p className="text-sm text-gray-400 mb-2">Mes con mayor gasto</p>
          <p className="text-white font-semibold text-lg capitalize">
            {chartData.reduce((max, month) =>
              month.monthly_total > max.monthly_total ? month : max
            ).monthName}
          </p>
          <p className="text-green-400 text-sm font-medium">
            {formatCurrency(Math.max(...chartData.map(m => m.monthly_total)), currency)}
          </p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
          <p className="text-sm text-gray-400 mb-2">Promedio mensual</p>
          <p className="text-white font-semibold text-lg">
            {formatCurrency(
              chartData.reduce((sum, month) => sum + month.monthly_total, 0) / chartData.length,
              currency
            )}
          </p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <p className="text-sm text-gray-400 mb-2">Total suscripciones</p>
          <p className="text-white font-semibold text-lg">
            {chartData.reduce((sum, month) => sum + month.subscription_count, 0)}
          </p>
          <p className="text-purple-400 text-sm">
            Promedio: {Math.round(chartData.reduce((sum, month) => sum + month.subscription_count, 0) / chartData.length)}/mes
          </p>
        </div>
      </div>
    </div>
  )
}