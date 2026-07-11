import React from "react";
import { Upload } from "lucide-react";
import { useDashboard, useDashboardData } from "../hooks";
import { CategoryChart } from "../components/CategoryChart";
import { UpcomingPayments } from "../components/UpcomingPayments";
import { RecentSubscriptions } from "../components/RecentSubscriptions";
import { SavingsOpportunities } from "../components/SavingsOpportunities";
import { BudgetAlert } from "../components/BudgetAlert";
import { ExecutiveSummary } from "../components/ExecutiveSummary";
import { DebtAlert } from "../components/DebtAlert";
import { DashboardKpis } from "../components/DashboardKpis";
import "../styles/dashboard.css";

export const DashboardPage: React.FC = () => {
  const { stats, subscriptions, loading } = useDashboard();
  const data = useDashboardData(stats, subscriptions);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="quick-actions">
          <button className="quick-action primary">
            <Upload size={18} />
            Importar
          </button>
        </div>

        <ExecutiveSummary
          upcoming={data.upcoming}
          upcomingTotal={data.upcomingTotal}
          topCategory={data.topCategory}
          nextPayment={data.nextPayment}
          nextPaymentInfo={data.nextPaymentInfo}
        />

        <DebtAlert stats={stats!} />

        {data.budgetPercentage > 80 && (
          <BudgetAlert totalSpent={data.totalMonthly} budget={data.budget} />
        )}

        <DashboardKpis
          totalMonthly={data.totalMonthly}
          activeSubscriptions={data.activeSubscriptions}
          pausedSubscriptions={data.pausedSubscriptions}
          nextPayment={data.nextPayment}
          budget={data.budget}
          budgetPercentage={data.budgetPercentage}
          stats={stats}
          badgeForNextPayment={data.badgeForNextPayment}
        />

        <div className="dashboard-grid-2">
          <div className="dashboard-card">
            <CategoryChart subscriptions={subscriptions} />
          </div>
          <div className="dashboard-card">
            <UpcomingPayments subscriptions={subscriptions.filter((s) => s.status === "active")} />
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="dashboard-card">
            <RecentSubscriptions subscriptions={subscriptions} />
          </div>
          <div className="dashboard-card">
            <SavingsOpportunities subscriptions={subscriptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
