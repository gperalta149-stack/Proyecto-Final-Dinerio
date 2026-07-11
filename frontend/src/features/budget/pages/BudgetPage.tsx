// frontend/src/features/budget/pages/BudgetPage.tsx
import React, { useState } from "react";
import { Wallet, PiggyBank } from "lucide-react";
import { BudgetKPIs } from "../components/BudgetKPIs/BudgetKPIs";
import { BudgetProgress } from "../components/BudgetProgress/BudgetProgress";
import { BudgetModal } from "../components/BudgetModal/BudgetModal";
import { BudgetRecommendations } from "../components/BudgetRecommendations/BudgetRecommendations";
import { BudgetSummary } from "../components/BudgetSummary/BudgetSummary";
import { useBudget } from "../hooks/useBudget";
import { Button } from "../../../shared/components/ui/Button";
import "../styles/budget.css";

export const BudgetPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    budget,
    alertThreshold,
    spent,
    available,
    percentageUsed,
    daysRemaining,
    dailyAllowance,
    projectedSpending,
    loading,
    updateBudget,
  } = useBudget();

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