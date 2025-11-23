import React from 'react';
import Card from '../ui/Card';
import type { Subscription } from '../../types';
import { useExchangeRate } from '../../hooks/useExchangeRate';

interface UpcomingPaymentsProps {
  subscriptions: Subscription[];
}

// SVG Icons para estados de urgencia
const UrgentIcon = () => (
  <svg className="w-3 h-3" fill="#EF4444" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10"/>
  </svg>
)

const WarningIcon = () => (
  <svg className="w-3 h-3" fill="#F59E0B" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10"/>
  </svg>
)

const InfoIcon = () => (
  <svg className="w-3 h-3" fill="#10B981" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10"/>
  </svg>
)

const SuccessIcon = () => (
  <svg className="w-3 h-3" fill="#84CC16" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="10"/>
  </svg>
)

// SVG para el icono del reloj
const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// SVG para estado vacío
const CalendarEmptyIcon = () => (
  <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export const UpcomingPayments: React.FC<UpcomingPaymentsProps> = ({ subscriptions }) => {
  const { convertUSDToARS } = useExchangeRate('blue');

  const getDaysUntilNextPayment = (nextBillingDate: string): number => {
    const today = new Date();
    const nextDate = new Date(nextBillingDate);
    const diffTime = nextDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (amount: number, currency: string): string => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    } else {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const parseAmount = (amount: string | number): number => {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
  };

  const getCurrencyColor = (currency: string): string => {
    return currency === 'USD' ? 'text-yellow-400' : 'text-green-400';
  };

  const upcomingPayments = subscriptions
    .filter((sub) => sub.status === 'active')
    .map((sub) => ({
      ...sub,
      daysUntil: getDaysUntilNextPayment(sub.next_billing_date),
      amountInARS: sub.currency === 'USD' ? convertUSDToARS(parseAmount(sub.amount), true) : parseAmount(sub.amount)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  const getUrgencyColor = (daysUntil: number) => {
    if (daysUntil <= 1) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (daysUntil <= 3) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    if (daysUntil <= 7) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-400 bg-green-500/10 border-green-500/20";
  };

  const getUrgencyIcon = (daysUntil: number) => {
    if (daysUntil <= 1) return <UrgentIcon />;
    if (daysUntil <= 3) return <WarningIcon />;
    if (daysUntil <= 7) return <InfoIcon />;
    return <SuccessIcon />;
  };


  const calculateTotals = () => {
    return upcomingPayments.reduce((acc, sub) => {
      if (sub.currency === 'USD') {
        acc.totalUSD += parseAmount(sub.amount);
        acc.totalUSDinARS += sub.amountInARS;
      } else {
        acc.totalARS += parseAmount(sub.amount);
      }
      return acc;
    }, {
      totalUSD: 0,
      totalARS: 0,
      totalUSDinARS: 0
    });
  };

  const totals = calculateTotals();
  const totalGeneralARS = totals.totalARS + totals.totalUSDinARS;

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-600/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Próximos Pagos</h3>
        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <ClockIcon />
        </div>
      </div>

      <div className="space-y-3">
        {upcomingPayments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarEmptyIcon />
            <p className="text-gray-400 font-medium">No hay pagos próximos</p>
            <p className="text-gray-500 text-sm mt-1">Todas las suscripciones están al día</p>
          </div>
        ) : (
          upcomingPayments.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                  sub.currency === 'USD'
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                    : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
                }`}>
                  <span className="text-xl font-bold text-white">
                    {sub.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-semibold truncate">{sub.name || 'Sin nombre'}</p>
                    {sub.category_name && (
                      <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">
                        {sub.category_name}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-medium">
                    {formatDate(sub.next_billing_date)}
                  </p>
                  {sub.currency === 'USD' && (
                    <p className="text-gray-500 text-xs mt-1">
                      ≈ ${sub.amountInARS.toLocaleString('es-AR')} ARS
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className={`text-lg font-bold ${getCurrencyColor(sub.currency)}`}>
                  {formatCurrency(parseAmount(sub.amount), sub.currency)}
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold mt-1 ${getUrgencyColor(sub.daysUntil)}`}>
                  <span>{getUrgencyIcon(sub.daysUntil)}</span>
                  <span>
                    {sub.daysUntil === 0 ? "Hoy" :
                      sub.daysUntil === 1 ? "Mañana" :
                      `${sub.daysUntil}d`}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {upcomingPayments.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-600/30 space-y-2">
          {/* Total en USD */}
          {totals.totalUSD > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-yellow-300">Total USD:</span>
              <span className="text-yellow-400 font-semibold">
                {formatCurrency(totals.totalUSD, 'USD')}
              </span>
            </div>
          )}
          
          {/* Total en ARS */}
          {totals.totalARS > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-300">Total ARS:</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency(totals.totalARS, 'ARS')}
              </span>
            </div>
          )}
          
          {/* Total USD convertido a ARS */}
          {totals.totalUSD > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">USD en ARS:</span>
              <span className="text-blue-400 font-semibold">
                ${totals.totalUSDinARS.toLocaleString('es-AR')}
              </span>
            </div>
          )}
          
          {/* Total General en ARS */}
          <div className="flex justify-between text-sm font-semibold border-t border-gray-500/30 pt-2">
            <span className="text-white">Total General:</span>
            <span className="text-white">
              ${totalGeneralARS.toLocaleString('es-AR')} ARS
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UpcomingPayments;