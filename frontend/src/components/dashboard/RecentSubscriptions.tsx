"use client"

import type React from "react"
import { useMemo } from "react"
import type { Subscription } from "../../types"
import { formatCurrency, parseAmount, getBillingCycleLabel } from "../../utils/formatters"

interface RecentSubscriptionsProps {
  subscriptions: Subscription[]
}

export const RecentSubscriptions: React.FC<RecentSubscriptionsProps> = ({ subscriptions }) => {
  const recentSubs = useMemo(() => {
    return [...subscriptions]
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
  }, [subscriptions])

  if (recentSubs.length === 0) {
    return <div className="text-center py-8 text-gray-400">No hay suscripciones recientes</div>
  }

  return (
    <div className="space-y-3">
      {recentSubs.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <div className="flex-1">
            <h4 className="text-white font-medium">{sub.name || "Sin nombre"}</h4>
            <p className="text-sm text-gray-400">{sub.category_name || "Otros"}</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold">{formatCurrency(parseAmount(sub.amount))}</p>
            <p className="text-sm text-gray-400">{getBillingCycleLabel(sub.billing_cycle || "monthly")}</p>
          </div>
        </div>
      ))}
    </div>
  )
}