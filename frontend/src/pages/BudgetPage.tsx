import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { BudgetModal } from "../components/budget/BudgetModal";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { userService } from "../services/userService";
import { formatCurrency, parseAmount } from "../utils/formatters";
import type { User } from "../types";
import { useExchangeRate } from "../hooks/useExchangeRate";

export const BudgetPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [loading, setLoading] = useState(true);
  const { subscriptions } = useSubscriptions();
  const { convertUSDToARS } = useExchangeRate('blue');

  const budget = user?.monthly_budget || 0;

  const currentSpending = subscriptions.reduce((total, sub) => {
    if (sub.status !== 'active') return total;
    
    const amount = parseAmount(sub.amount);
    
    if (sub.currency === 'USD') {
      // USAR LA MISMA FUNCIÓN QUE EL DASHBOARD
      return total + convertUSDToARS(amount, true);
    } else {
      return total + amount;
    }
  }, 0);

  const handleSaveBudget = async (newBudget: number, threshold: number) => {
    try {
      await userService.updateBudget(newBudget);
      setUser(prev => prev ? { ...prev, monthly_budget: newBudget } : null);
      setAlertThreshold(threshold);
      localStorage.setItem("alertThreshold", threshold.toString());
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      alert('Error al guardar el presupuesto');
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userData = await userService.getProfile();
        setUser(userData);
        const savedThreshold = localStorage.getItem("alertThreshold");
        if (savedThreshold) setAlertThreshold(Number.parseFloat(savedThreshold));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const percentageUsed = budget > 0 ? (currentSpending / budget) * 100 : 0;

  // DEBUG TEMPORAL
  useEffect(() => {
    console.log('🎯 [BUDGET DEBUG]:', {
      currentSpending,
      budget,
      percentageUsed,
      subscriptions: subscriptions.map(sub => ({
        name: sub.name,
        amount: sub.amount,
        currency: sub.currency,
        status: sub.status
      }))
    });
  }, [currentSpending, budget, percentageUsed, subscriptions]);

  if (loading) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Gestión de Presupuesto</h1>
            <p className="page-subtitle">Controla y optimiza tus gastos mensuales</p>
          </div>
          <div className="page-actions">
            <Button
              className="subtrack-btn subtrack-btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <span className="mr-2">💰</span>
              {budget > 0 ? "Editar Presupuesto" : "Establecer Presupuesto"}
            </Button>
          </div>
        </div>

        <div className="subtrack-grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel Principal */}
          <div className="space-y-6">
            {!budget || budget === 0 ? (
              <div className="subtrack-card text-center">
                <div className="text-6xl mb-4 text-gray-400">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">Establece tu presupuesto mensual</h3>
                <p className="text-gray-400 mb-6">
                  Define un límite de gasto mensual para controlar tus suscripciones y recibir alertas cuando te acerques al límite.
                </p>
                <Button
                  className="subtrack-btn subtrack-btn-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span className="mr-2">$</span>
                  Crear Presupuesto
                </Button>
              </div>
            ) : (
              <div className="subtrack-card">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Presupuesto Mensual</h3>
                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(budget, 'ARS')}
                      </p>
                    </div>
                    <Button
                      className="subtrack-btn subtrack-btn-secondary"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Editar
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Gasto actual</span>
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(currentSpending)} / {formatCurrency(budget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          percentageUsed >= 100
                            ? "bg-red-500"
                            : percentageUsed >= alertThreshold
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">{percentageUsed.toFixed(1)}% utilizado</p>
                  </div>

                  {percentageUsed >= alertThreshold && (
                    <div
                      className={`p-4 rounded-lg ${
                        percentageUsed >= 100
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-orange-500/10 border border-orange-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{percentageUsed >= 100 ? "🚨" : "⚠️"}</span>
                        <div>
                          <h4
                            className={`font-semibold mb-1 ${percentageUsed >= 100 ? "text-red-400" : "text-orange-400"}`}
                          >
                            {percentageUsed >= 100 ? "Presupuesto excedido" : "Alerta de presupuesto"}
                          </h4>
                          <p className="text-sm text-gray-300">
                            {percentageUsed >= 100
                              ? `Has superado tu presupuesto en ${formatCurrency(currentSpending - budget)}.`
                              : `Has alcanzado el ${percentageUsed.toFixed(1)}% de tu presupuesto mensual.`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuración de Alertas */}
            {budget > 0 && (
              <div className="subtrack-card">
                <h3 className="text-lg font-semibold text-white mb-4">Configuración de Alertas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Umbral de alerta</span>
                    <span className="text-white font-semibold">{alertThreshold}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Disponible este mes</span>
                    <span className="text-green-400 font-semibold">
                      {formatCurrency(Math.max(budget - currentSpending, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Gasto mensual actual</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(currentSpending)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300">Suscripciones activas</span>
                    <span className="text-white font-semibold">
                      {subscriptions.filter(sub => sub.status === 'active').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Panel Secundario */}
          {budget > 0 && (
            <div className="space-y-6">
              <div className="subtrack-card bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Recomendaciones</h3>
                <div className="space-y-3">
                  {percentageUsed > 100 && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg">
                      <span className="text-red-400">🚨</span>
                      <div>
                        <p className="text-white font-medium">Presupuesto excedido</p>
                        <p className="text-gray-300 text-sm">Considera revisar suscripciones no esenciales</p>
                      </div>
                    </div>
                  )}
                  {percentageUsed > 80 && percentageUsed <= 100 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-500/10 rounded-lg">
                      <span className="text-orange-400">⚠️</span>
                      <div>
                        <p className="text-white font-medium">Cerca del límite</p>
                        <p className="text-gray-300 text-sm">Monitoriza tus gastos cuidadosamente</p>
                      </div>
                    </div>
                  )}
                  {percentageUsed <= 80 && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg">
                      <span className="text-green-400">✅</span>
                      <div>
                        <p className="text-white font-medium">Dentro del presupuesto</p>
                        <p className="text-gray-300 text-sm">Tus gastos están bajo control</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="subtrack-card">
                <h3 className="text-lg font-semibold text-white mb-4">Resumen Rápido</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">
                      {subscriptions.filter(sub => sub.status === 'active').length}
                    </p>
                    <p className="text-gray-400 text-sm">Suscripciones Activas</p>
                  </div>
                  <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(currentSpending)}
                    </p>
                    <p className="text-gray-400 text-sm">Gasto Mensual</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBudget}
          currentBudget={budget || 0}
          currentThreshold={alertThreshold}
        />
      </div>
    </div>
  );
};