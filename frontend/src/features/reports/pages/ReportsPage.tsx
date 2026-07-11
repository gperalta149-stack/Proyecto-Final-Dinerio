import React, { useState, useMemo } from "react";
import { ReportFilters } from "../components/ReportFilters/ReportFilters";
import { HistoricalKPIs } from "../components/HistoricalKPIs/HistoricalKPIs";
import { MonthlyEvolution } from "../../dashboard/components/MonthlyEvolution/MonthlyEvolution";
import { PeriodComparison } from "../components/PeriodComparison/PeriodComparison";
import { AnnualDistribution } from "../components/AnnualDistribution/AnnualDistribution";
import { CategoryTrends } from "../components/CategoryTrends/CategoryTrends";
import { InsightsPanel } from "../components/InsightsPanel/InsightsPanel";
import { PredictionsCard } from "../components/PredictionsCard/PredictionsCard";
import { useReports } from "../hooks";
import type { CategoryData } from "../types";
import "../styles/reports.css";

export const ReportsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const {
    report,
    monthlyEvolution,
    loading,
    error,
    exportCSV,
  } = useReports(selectedMonth, selectedYear);

  const { monthlyTotal, byCategory } = useMemo(() => {
    if (!report) {
      return { monthlyTotal: 0, byCategory: [] as CategoryData[] };
    }
    return {
      monthlyTotal: report.summary?.monthly_total || 0,
      byCategory: report.categories || [],
    };
  }, [report]);

  const handleExportCSV = async () => {
    await exportCSV(selectedMonth, selectedYear);
  };

  const monthlyChartData = monthlyEvolution.map(item => ({
    month: item.monthName || new Date(item.year, item.month - 1).toLocaleDateString("es-ES", { month: "short" }),
    monthIndex: item.month,
    year: item.year,
    amount: item.monthly_total || 0,
  }));

  const hasData = monthlyEvolution.length > 0;
  const hasCategories = byCategory.length > 0;
  const hasPrediction = monthlyEvolution.length >= 2;

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner" />
        <p>Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return <div className="analysis-error"><p>{error}</p></div>;
  }

  return (
    <div className="analysis-page">
      <div className="analysis-container">

        {/* HEADER: month selector + export buttons */}
        <div className="analysis-header">
          <ReportFilters
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onExportCSV={handleExportCSV}
          />
        </div>

        {/* ROW 1 — 3 KPIs: Total anual / Promedio mensual / Variación anual */}
        {hasData && <HistoricalKPIs monthlyEvolution={monthlyEvolution} currency="ARS" />}

        {/* EVOLUCIÓN DE GASTOS — big line chart with period filters */}
        {hasData && (
          <div className="analysis-chart">
            <MonthlyEvolution data={monthlyChartData} currency="ARS" showAll large />
          </div>
        )}

        {/* 2-COL GRID: Distribución anual (donut) + Comparación mensual (bars) */}
        {(hasData || hasCategories) && (
          <div className="analysis-grid-2">
            {hasCategories && (
              <div className="analysis-card">
                <AnnualDistribution categories={byCategory} currency="ARS" />
              </div>
            )}
            {hasData && (
              <div className="analysis-card">
                <PeriodComparison monthlyEvolution={monthlyEvolution} currency="ARS" />
              </div>
            )}
          </div>
        )}

        {/* FULL-WIDTH: Tendencias por categoría */}
        {hasCategories && (
          <div className="analysis-full">
            <CategoryTrends currentCategories={byCategory} currency="ARS" />
          </div>
        )}

        {/* 2-COL GRID: Insights + Predicción */}
        {(hasCategories || hasPrediction) && (
          <div className="analysis-grid-2 eq">
            {hasCategories && (
              <div className="analysis-card">
                <InsightsPanel
                  categories={byCategory}
                  monthlyEvolution={monthlyEvolution}
                  monthlyTotal={monthlyTotal}
                  currency="ARS"
                />
              </div>
            )}
            {hasPrediction && (
              <div className="analysis-card">
                <PredictionsCard monthlyEvolution={monthlyEvolution} currency="ARS" />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsPage;
