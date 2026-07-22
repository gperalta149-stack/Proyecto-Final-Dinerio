// frontend/src/features/budget/pages/BudgetPage.tsx
import React, { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Wallet, PiggyBank, CreditCard } from "lucide-react";
import { parseAmount } from "../../../shared/utils/formatters";
import { BudgetKPIs } from "../components/BudgetKPIs/BudgetKPIs";
import { BudgetProgress } from "../components/BudgetProgress/BudgetProgress";
import { BudgetModal } from "../components/BudgetModal/BudgetModal";
import { BudgetRecommendations } from "../components/BudgetRecommendations/BudgetRecommendations";
import { BudgetSummary } from "../components/BudgetSummary/BudgetSummary";
import { useBudget } from "../hooks/useBudget";
import { Button } from "../../../shared/components/ui/Button";
import "../styles/budget.css";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const BudgetPage: React.FC = () => {
  const now = new Date();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const {
    budget,
    alertThreshold,
    spent,
    available,
    percentageUsed,
    daysRemaining,
    dailyAllowance,
    projectedSpending,
    activeSubscriptions,
    loading,
    updateBudget,
  } = useBudget(selectedMonth, selectedYear);

  const handleSaveBudget = async (newBudget: number, threshold: number) => {
    await updateBudget(newBudget, threshold);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="budget-page">
        <div className="budget-container">
          <div className="budget-loading">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  const hasBudget = budget > 0;

  return (
    <div className="budget-page">
      <div className="budget-container">
        <div className="budget-header">
          <div className="budget-date-picker">
            <Calendar size={16} className="budget-date-icon" />
            <div className="date-spinner">
              <button className="date-spinner-btn" onClick={() => {
                if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1); }
                else { setSelectedMonth(selectedMonth - 1); }
              }}><ChevronLeft size={14} /></button>
              <input
                type="text"
                className="date-spinner-input"
                value={MONTHS[selectedMonth - 1]}
                onChange={(e) => {
                  const idx = MONTHS.findIndex(m => m.toLowerCase().startsWith(e.target.value.toLowerCase()));
                  if (idx >= 0) setSelectedMonth(idx + 1);
                  else {
                    const num = parseInt(e.target.value);
                    if (num >= 1 && num <= 12) setSelectedMonth(num);
                  }
                }}
              />
              <button className="date-spinner-btn" onClick={() => {
                if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1); }
                else { setSelectedMonth(selectedMonth + 1); }
              }}><ChevronRight size={14} /></button>
            </div>
            <div className="date-spinner">
              <button className="date-spinner-btn" onClick={() => setSelectedYear(selectedYear - 1)}><ChevronLeft size={14} /></button>
              <input
                type="number"
                className="date-spinner-input"
                value={selectedYear}
                onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1900 && v <= 2100) setSelectedYear(v); }}
                min={1900} max={2100}
              />
              <button className="date-spinner-btn" onClick={() => setSelectedYear(selectedYear + 1)}><ChevronRight size={14} /></button>
            </div>
          </div>
          <Button 
            className="budget-add-btn" 
            onClick={() => setIsModalOpen(true)}
          >
            <Wallet size={18} />
            {hasBudget ? "Editar límites" : "Establecer presupuesto"}
          </Button>
        </div>

        {hasBudget ? (
          <>
            <BudgetKPIs
              budget={budget}
              spent={spent}
              available={available}
              percentageUsed={percentageUsed}
            />

            <BudgetProgress
              spent={spent}
              budget={budget}
              percentageUsed={percentageUsed}
              alertThreshold={alertThreshold}
              daysRemaining={daysRemaining}
            />

            <div className="budget-subscriptions-card">
              <div className="budget-subscriptions-header">
                <CreditCard size={18} />
                <span>Suscripciones activas en {MONTHS[selectedMonth - 1].toLowerCase()}</span>
                <span className="budget-subscriptions-count">{activeSubscriptions.length}</span>
              </div>
              <div className="budget-subscriptions-body">
                {activeSubscriptions.length === 0 ? (
                  <div className="budget-subscriptions-empty">No hay suscripciones activas este mes</div>
                ) : (
                  <div className="budget-subscriptions-list">
                    {activeSubscriptions.map(sub => (
                      <div key={sub.id} className="budget-subscriptions-item">
                        <div className="budget-subscriptions-item-left">
                          <span className="budget-subscriptions-item-name">{sub.name}</span>
                          <span className="budget-subscriptions-item-cycle">{sub.billing_cycle}</span>
                        </div>
                        <span className="budget-subscriptions-item-amount">
                          ${parseAmount(sub.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="budget-grid-2">
              <BudgetRecommendations 
                spent={spent}
                budget={budget}
                percentageUsed={percentageUsed}
              />
              <BudgetSummary 
                spent={spent}
                budget={budget}
                available={available}
                percentageUsed={percentageUsed}
                daysRemaining={daysRemaining}
                activeCount={activeSubscriptions.length}
              />
            </div>
          </>
        ) : (
          <div className="budget-empty">
            <PiggyBank size={64} className="budget-empty-icon" />
            <h3 className="budget-empty-title">Establecé tu presupuesto mensual</h3>
            <p className="budget-empty-description">
              Definí un límite de gasto mensual para controlar tus suscripciones
              y recibir alertas cuando te acerques al límite.
            </p>
            <Button className="budget-empty-btn" onClick={() => setIsModalOpen(true)}>
              <Wallet size={18} />
              Crear presupuesto
            </Button>
          </div>
        )}

        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBudget}
          currentBudget={budget}
          currentThreshold={alertThreshold}
        />
      </div>
    </div>
  );
};

export default BudgetPage;