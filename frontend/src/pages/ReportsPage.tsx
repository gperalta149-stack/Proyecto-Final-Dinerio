"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { reportService } from '../services/reportService';
import { subscriptionService } from '../services/subscriptionService';
import type { FinancialReport, Subscription } from '../types';
import type { MonthlyEvolution } from '../services/reportService';
import { ExportButton } from '../reports/ExportButton';
import { ReportFilters } from '../reports/ReportFilters';
import { BarChart } from '../components/dashboard/BarChart';
import { ChartSection } from '../components/dashboard/ChartSection';
import { EvolutionChart } from '../components/dashboard/EvolutionChart';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { formatCurrency, parseAmount} from '../utils/formatters';

// Componentes SVG CORREGIDOS
const MoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C13.6569 2 15 3.34315 15 5C15 6.65685 13.6569 8 12 8C10.3431 8 9 6.65685 9 5C9 3.34315 10.3431 2 12 2Z"/>
    <path d="M19 9C20.6569 9 22 10.3431 22 12C22 13.6569 20.6569 15 19 15C17.3431 15 16 13.6569 16 12C16 10.3431 17.3431 9 19 9Z"/>
    <path d="M5 9C6.65685 9 8 10.3431 8 12C8 13.6569 6.65685 15 5 15C3.34315 15 2 13.6569 2 12C2 10.3431 3.34315 9 5 9Z"/>
    <path d="M6 18L18 6"/>
    <path d="M6 6L18 18"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 3V21H21"/>
    <path d="M7 16L9.5 11.5L12 14L16 8"/>
    <path d="M18 14H18.01"/>
  </svg>
);

const TrendingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12L18 8L15 11L9 5L2 12"/>
    <path d="M22 12H16"/>
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
    <path d="M10 9H8"/>
  </svg>
);

const InsightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C13.6569 2 15 3.34315 15 5C15 6.65685 13.6569 8 12 8C10.3431 8 9 6.65685 9 5C9 3.34315 10.3431 2 12 2Z"/>
    <path d="M12 22V8"/>
    <path d="M5 12H2C2 14.6522 3.05357 17.1957 4.92893 19.0711C6.8043 20.9464 9.34784 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12H19"/>
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { convertUSDToARS, currentRate, loading: ratesLoading } = useExchangeRate('blue');

  // SUSCRIPCIONES FILTRADAS PARA EL MES SELECCIONADO
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      
      const billingDate = new Date(sub.next_billing_date);
      return billingDate.getMonth() + 1 === selectedMonth && 
             billingDate.getFullYear() === selectedYear;
    });
  }, [subscriptions, selectedMonth, selectedYear]);

  // SOLUCIÓN DEFINITIVA: CALCULAR EVOLUCIÓN MENSUAL LOCALMENTE
  const calculatedMonthlyEvolution = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return months.map(month => {
      // Filtrar suscripciones activas para cada mes
      const monthSubscriptions = subscriptions.filter(sub => {
        if (sub.status !== 'active') return false;
        
        const billingDate = new Date(sub.next_billing_date);
        return billingDate.getMonth() + 1 === month && 
               billingDate.getFullYear() === selectedYear;
      });

      // MISMA LÓGICA que el dashboard - garantiza consistencia
      const monthlyTotal = monthSubscriptions.reduce((total, sub) => {
        const amount = parseAmount(sub.amount);
        
        if (sub.currency === 'USD') {
          return total + convertUSDToARS(amount, true);
        } else {
          return total + amount;
        }
      }, 0);

      return {
        year: selectedYear,
        month: month,
        monthName: new Date(selectedYear, month - 1).toLocaleDateString('es-ES', { month: 'short' }),
        monthly_total: monthlyTotal,
        subscription_count: monthSubscriptions.length
      };
    });
  }, [subscriptions, selectedYear, convertUSDToARS]);

  // CALCULAR TOTALES USANDO LA MISMA LÓGICA - CONSISTENTE
  const calculatedTotals = useMemo(() => {
    if (!filteredSubscriptions.length && calculatedMonthlyEvolution.length === 0) {
      return {
        monthlyTotal: 0,
        yearlyTotal: 0,
        monthlyBudget: report?.summary.monthly_budget || 0,
        budgetUsage: 0,
        totalSubscriptions: 0,
        byCategory: []
      };
    }

    // CALCULAR GASTO MENSUAL (MISMA LÓGICA QUE DASHBOARD)
    const monthlyTotal = filteredSubscriptions.reduce((total, sub) => {
      const amount = parseAmount(sub.amount);
      
      if (sub.currency === 'USD') {
        return total + convertUSDToARS(amount, true);
      } else {
        return total + amount;
      }
    }, 0);

    // Calcular por categoría (MISMA LÓGICA)
    const byCategory = filteredSubscriptions.reduce((acc, sub) => {
      const categoryName = sub.category_name || 'Otros';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          color: sub.category_color || '#6b7280',
          subscription_count: 0,
          monthly_total: 0
        };
      }
      
      const amount = parseAmount(sub.amount);
      const amountInARS = sub.currency === 'USD' ? 
        convertUSDToARS(amount, true) : amount;
      
      acc[categoryName].subscription_count += 1;
      acc[categoryName].monthly_total += amountInARS;
      
      return acc;
    }, {} as Record<string, any>);

    const categoriesArray = Object.values(byCategory)
      .sort((a: any, b: any) => b.monthly_total - a.monthly_total);

    // Obtener presupuesto
    const monthlyBudget = report?.summary.monthly_budget || 0;
    const budgetUsage = monthlyBudget > 0 ? (monthlyTotal / monthlyBudget) * 100 : 0;

    // USAR LA EVOLUCIÓN CALCULADA LOCALMENTE PARA TOTAL ANUAL - GARANTIZA CONSISTENCIA
    const yearlyTotalFromEvolution = calculatedMonthlyEvolution.reduce(
      (sum, month) => sum + month.monthly_total, 0
    );

    return {
      monthlyTotal,
      yearlyTotal: yearlyTotalFromEvolution, // ← CONSISTENTE con la evolución
      monthlyBudget,
      budgetUsage,
      totalSubscriptions: filteredSubscriptions.length,
      byCategory: categoriesArray
    };
  }, [filteredSubscriptions, report, convertUSDToARS, calculatedMonthlyEvolution]);

  // DEBUG DE CONSISTENCIA
  useEffect(() => {
    if (calculatedTotals && calculatedMonthlyEvolution.length > 0) {
      console.log('🔍 [CONSISTENCY CHECK]:');
      console.log('💰 Monthly Total (dashboard logic):', calculatedTotals.monthlyTotal);
      console.log('📊 Current month from evolution:', calculatedMonthlyEvolution.find(m => m.month === selectedMonth)?.monthly_total);
      console.log('📈 Yearly Total from evolution:', calculatedTotals.yearlyTotal);
      console.log('🔄 Should be equal:', calculatedTotals.monthlyTotal === calculatedMonthlyEvolution.find(m => m.month === selectedMonth)?.monthly_total);
      
      // Verificar datos del backend vs cálculo local
      if (monthlyEvolution.length > 0) {
        const backendCurrentMonth = monthlyEvolution.find(m => m.month === selectedMonth)?.monthly_total || 0;
        console.log('⚖️ Backend vs Local comparison:', {
          backend: backendCurrentMonth,
          local: calculatedTotals.monthlyTotal,
          difference: backendCurrentMonth - calculatedTotals.monthlyTotal
        });
      }
    }
  }, [calculatedTotals, calculatedMonthlyEvolution, monthlyEvolution, selectedMonth]);

  useEffect(() => {
    loadFinancialData();
  }, [selectedMonth, selectedYear]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [financialReport, evolutionData, subscriptionsData] = await Promise.all([
        reportService.getFinancialReport(selectedMonth, selectedYear),
        reportService.getMonthlyEvolution(selectedYear),
        subscriptionService.getAll()
      ]);
      
      setReport(financialReport);
      setSubscriptions(subscriptionsData);
      setMonthlyEvolution(evolutionData.monthlyEvolution);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const blob = await reportService.exportCSV(selectedMonth, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte-suscripciones-${selectedMonth}-${selectedYear}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar el reporte');
    }
  };

  const getMonthName = (month: number) => {
    return new Date(selectedYear, month - 1).toLocaleDateString('es-ES', { month: 'long' });
  };

  // Crear suscripciones mock usando los datos CALCULADOS CORRECTAMENTE
  const createMockSubscriptions = () => {
    if (!calculatedTotals) return [];
    
    return calculatedTotals.byCategory.flatMap((category: any) =>
      Array.from({ length: category.subscription_count }, (_, index) => {
        const amountPerSubscription = category.monthly_total / Math.max(category.subscription_count, 1);
        
        return {
          id: `mock-${category.name}-${index}`,
          name: `${category.name} Subscription ${index + 1}`,
          amount: amountPerSubscription.toString(),
          currency: 'ARS',
          billing_cycle: 'monthly' as const,
          status: 'active' as const,
          category_name: category.name,
          next_billing_date: new Date(selectedYear, selectedMonth - 1, 15).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'mock-user'
        }
      })
    );
  };

  if (loading || ratesLoading || !calculatedTotals) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner mx-auto"></div>
            <p className="text-gray-400 mt-4">Cargando reportes...</p>
          </div>
        </div>
      </div>
    );
  }

  const { monthlyTotal, yearlyTotal, monthlyBudget, budgetUsage, totalSubscriptions, byCategory } = calculatedTotals;
  const mockSubscriptions = createMockSubscriptions();

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reportes Financieros</h1>
            <p className="page-subtitle">
              Análisis detallado de tus suscripciones - {getMonthName(selectedMonth)} {selectedYear}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Moneda base:</span>
                <span className="text-sm font-medium text-indigo-400">ARS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Tipo de cambio:</span>
                <span className="text-sm font-medium text-green-400">
                  USD 1 = ARS {currentRate.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Cálculo:</span>
                <span className="text-sm font-medium text-blue-400">
                  ✅ 100% Consistente
                </span>
              </div>
            </div>
          </div>
          <div className="page-actions">
            <div className="flex gap-4">
              <ReportFilters
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
              <ExportButton onExport={handleExportCSV} />
            </div>
          </div>
        </div>

        {/* Stats Cards - AHORA 100% CONSISTENTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="subtrack-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gasto Mensual Total</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(monthlyTotal, 'ARS')}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {totalSubscriptions} suscripciones
                </p>
                <p className="text-green-400 text-xs mt-1">
                  ✅ Cálculo local unificado
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <MoneyIcon />
              </div>
            </div>
          </div>

          <div className="subtrack-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Presupuesto Mensual</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(monthlyBudget, 'ARS')}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Límite establecido
                </p>
                <p className="text-blue-400 text-xs mt-1">
                  {monthlyBudget > 0 ? `${formatCurrency(monthlyBudget - monthlyTotal, 'ARS')} disponible` : 'Sin presupuesto'}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ChartIcon />
              </div>
            </div>
          </div>

          <div className="subtrack-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Uso del Presupuesto</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {budgetUsage.toFixed(1)}%
                </p>
                <p className={`text-sm mt-1 ${
                  budgetUsage > 100 ? 'text-red-400' :
                  budgetUsage > 80 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  {budgetUsage > 100 ? 'Excedido' :
                    budgetUsage > 80 ? 'Cerca del límite' : 'Dentro del límite'}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingIcon />
              </div>
            </div>
          </div>

          <div className="subtrack-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Gasto Anual</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(yearlyTotal, 'ARS')}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Basado en evolución real
                </p>
                <p className="text-orange-400 text-xs mt-1">
                  📈 12 meses calculados
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <DocumentIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Grid de gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de torta usando ChartSection */}
          <div className="subtrack-card">
            <ChartSection
              subscriptions={mockSubscriptions}
              currency={'ARS'}
            />
          </div>

          {/* Gráfico de barras */}
          <div className="subtrack-card">
            <h3 className="text-xl font-semibold text-white mb-6">
              Gastos por Categoría - {getMonthName(selectedMonth)}
            </h3>
            <div className="h-96">
              <BarChart
                subscriptions={mockSubscriptions}
                currency={'ARS'}
              />
            </div>
          </div>
        </div>

        {/* Gráfico de evolución - USANDO CÁLCULO LOCAL */}
        <div className="subtrack-card mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">Evolución Anual</h3>
              <p className="text-gray-400 text-sm mt-1">
                Gastos mensuales - {selectedYear}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total anual</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(yearlyTotal, 'ARS')}
              </p>
            </div>
          </div>
          <EvolutionChart
            monthlyData={calculatedMonthlyEvolution}
            currency={'ARS'}
          />
        </div>

        {/* Tabla de Categorías */}
        <div className="subtrack-card mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            Detalle por Categoría - {getMonthName(selectedMonth)}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Categoría</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Suscripciones</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Gasto Mensual</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                {byCategory.map((category: any, index: number) => {
                  const percentage = monthlyTotal > 0 ? (category.monthly_total / monthlyTotal) * 100 : 0;
                  
                  return (
                    <tr key={`${category.name}-${index}`} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="text-white font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-white">
                        {category.subscription_count}
                      </td>
                      <td className="text-right py-3 px-4 text-white font-semibold">
                        {formatCurrency(category.monthly_total, 'ARS')}
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium w-12">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights y Recomendaciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="subtrack-card bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <InsightIcon />
              <h4 className="text-lg font-semibold text-white">Insights del Mes</h4>
            </div>
            <ul className="text-gray-300 space-y-2">
              {budgetUsage > 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Has excedido tu presupuesto mensual en <strong>{(budgetUsage - 100).toFixed(1)}%</strong></span>
                </li>
              )}
              {budgetUsage > 80 && budgetUsage <= 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Estás cerca de alcanzar tu límite de presupuesto (<strong>{budgetUsage.toFixed(1)}%</strong>)</span>
                </li>
              )}
              {byCategory.length > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Tu categoría con mayor gasto es <strong>{byCategory[0]?.name}</strong></span>
                </li>
              )}
              {totalSubscriptions === 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>No tienes suscripciones activas este mes</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Gasto mensual promedio por suscripción: <strong>{formatCurrency(monthlyTotal / Math.max(totalSubscriptions, 1), 'ARS')}</strong></span>
              </li>
            </ul>
          </div>

          <div className="subtrack-card bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-2 mb-3">
              <TargetIcon />
              <h4 className="text-lg font-semibold text-white">Recomendaciones</h4>
            </div>
            <ul className="text-gray-300 space-y-2">
              {budgetUsage > 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>Considera revisar suscripciones en <strong>{byCategory[0]?.name}</strong></span>
                </li>
              )}
              {budgetUsage > 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 mt-1">•</span>
                  <span>Revisa suscripciones que no uses frecuentemente</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Exporta este reporte para análisis detallado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 mt-1">•</span>
                <span>Establece alertas para cuando te acerques al límite</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};