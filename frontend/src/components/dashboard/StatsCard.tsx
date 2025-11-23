import React, { ReactNode } from 'react';
import Card from '../ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral" | "monthly" | "subscriptions" | "currency";
  color?: "indigo" | "green" | "orange" | "red" | "blue" | "purple" | "yellow";
  currency?: "ARS" | "USD";
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "indigo",
  currency
}) => {
  const colorClasses = {
    indigo: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30",
    green: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    orange: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
    red: "from-red-500/20 to-pink-500/20 border-red-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    purple: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
    yellow: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
  };

  const trendConfig = {
    up: { icon: "↗", color: "text-green-400", label: "Alza" },
    down: { icon: "↘", color: "text-red-400", label: "Baja" },
    neutral: { icon: "→", color: "text-gray-400", label: "Estable" },
    monthly: { icon: "📅", color: "text-blue-400", label: "Mensual" },
    subscriptions: { icon: "📱", color: "text-purple-400", label: "Suscripciones" },
    currency: { icon: "💵", color: "text-yellow-400", label: "USD" }
  };

  const formatValue = (val: string | number, curr?: string) => {
    if (typeof val === 'number' && curr === 'ARS') {
      return `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    if (typeof val === 'number' && curr === 'USD') {
      return `US$ ${val.toFixed(2)}`;
    }
    return val;
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm hover:scale-105 transition-all duration-300 p-6`}>
      <div className="flex items-start justify-between h-full">
        <div className="flex-1">
          <p className="text-gray-300 text-sm font-medium mb-3 uppercase tracking-wide">{title}</p>
          
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-3xl font-bold text-white">
              {formatValue(value, currency)}
            </p>
            
            {/* Badge de moneda */}
            {currency && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                currency === 'USD'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
              }`}>
                {currency === 'USD' ? 'USD' : 'ARS'}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-gray-400 text-sm mb-3 font-medium">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trendConfig[trend].color}`}>
              <span className="text-lg mr-2">{trendConfig[trend].icon}</span>
              <span>{trendConfig[trend].label}</span>
            </div>
          )}
        </div>
        
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;