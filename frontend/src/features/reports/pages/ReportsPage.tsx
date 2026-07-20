import React, { useState, useMemo } from "react";
import { FileText, FileSpreadsheet, File, DollarSign, BarChart3, Trophy, ArrowUp, TrendingDown, TrendingUp, PiggyBank, ChevronLeft, ChevronRight, PieChart, Lightbulb, Calendar, CalendarRange } from "lucide-react";
import { MonthlyEvolution } from "../../dashboard/components/MonthlyEvolution/MonthlyEvolution";
import { AnnualDistribution } from "../components/AnnualDistribution/AnnualDistribution";

import { SavingsOpportunities } from "../../dashboard/components/SavingsOpportunities/SavingsOpportunities";
import { InsightsPanel } from "../components/InsightsPanel/InsightsPanel";
import { KpiCard } from "../../../shared/components/ui/KpiCard";
import { formatCurrency } from "../../../shared/utils/formatters";
import { useReports } from "../hooks";
import type { CategoryData } from "../types";
import "../styles/reports.css";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const ReportsPage: React.FC = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [rangeMode, setRangeMode] = useState<"date" | "range">("range");
  const [range, setRange] = useState<number | null>(12);

  const { report, monthlyEvolution, loading, error, exportCSV } = useReports(selectedMonth, selectedYear, range, rangeMode);

  const { monthlyTotal, byCategory, subscriptions } = useMemo(() => {
    if (!report) return { monthlyTotal: 0, byCategory: [] as CategoryData[], subscriptions: [] };
    return {
      monthlyTotal: report.summary?.monthly_total || 0,
      byCategory: (report as any).by_category || report.categories || [],
      subscriptions: (report as any).subscriptions || [],
    };
  }, [report]);

  const filteredEvolution = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length === 0) return [];
    if (rangeMode === "date") {
      return monthlyEvolution.filter((d: any) => d.month === selectedMonth && d.year === selectedYear);
    }
    if (range === null) return [...monthlyEvolution];
    const cutoffKey = selectedYear * 12 + selectedMonth;
    return monthlyEvolution.filter((d: any) => {
      const key = d.year * 12 + d.month;
      return key <= cutoffKey && key > cutoffKey - range;
    });
  }, [monthlyEvolution, range, rangeMode, selectedMonth, selectedYear]);

  const stats = useMemo(() => {
    if (!filteredEvolution || filteredEvolution.length === 0) return null;
    const sorted = [...filteredEvolution].sort((a: any, b: any) => {
      const aKey = a.year * 12 + a.month;
      const bKey = b.year * 12 + b.month;
      return aKey - bKey;
    });
    const totalFiltered = sorted.reduce((s: number, m: any) => s + m.monthly_total, 0);
    const avgFiltered = totalFiltered / sorted.length;
    const mostExpensive = [...sorted].sort((a: any, b: any) => b.monthly_total - a.monthly_total)[0];
    const highestPayment = mostExpensive?.monthly_total || 0;
    let monthlyVariation = 0;
    if (sorted.length >= 2) {
      const first = sorted[0].monthly_total;
      const last = sorted[sorted.length - 1].monthly_total;
      monthlyVariation = first > 0 ? ((last - first) / first) * 100 : 0;
    }
    return { totalYearly: totalFiltered, avgMonthly: avgFiltered, highestPayment, mostExpensive, monthlyVariation };
  }, [filteredEvolution]);

  const monthlyChartData = useMemo(() => {
    return filteredEvolution.map((item: any) => ({
      month: item.monthName || new Date(item.year, item.month - 1).toLocaleDateString("es-ES", { month: "short" }),
      monthIndex: item.month,
      year: item.year,
      amount: item.monthly_total || 0,
    }));
  }, [filteredEvolution]);

  const fullYearTotal = useMemo(() => {
    if (!monthlyEvolution || monthlyEvolution.length === 0) return 0;
    return monthlyEvolution.reduce((s: number, m: any) => s + (m.monthly_total || 0), 0);
  }, [monthlyEvolution]);

  const hasData = filteredEvolution.length > 0;
  const hasCategories = byCategory.length > 0;

  const handleExportCSV = async () => {
    await exportCSV(selectedMonth, selectedYear);
  };

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

        {/* HEADER: month/year picker + export */}
        <div className="analysis-header">
          <div className="analysis-date-picker">
            <div className="range-mode-box">
              <div className="range-mode-toggle">
                <button
                  className={`range-mode-btn${rangeMode === "date" ? " active" : ""}`}
                  onClick={() => setRangeMode("date")}
                >
                  <Calendar size={14} /> Fecha
                </button>
                <button
                  className={`range-mode-btn${rangeMode === "range" ? " active" : ""}`}
                  onClick={() => setRangeMode("range")}
                >
                  <CalendarRange size={14} /> Rango
                </button>
              </div>
            </div>
            <div className="range-content-box">
              {rangeMode === "date" ? (
                <div className="range-date-pickers">
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
              ) : (
                <div className="range-filter">
                  {[{ label: "3M", value: 3 }, { label: "6M", value: 6 }, { label: "12M", value: 12 }].map(p => (
                    <button key={p.label} className={`range-option${range === p.value ? " active" : ""}`} onClick={() => setRange(p.value)}>
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="export-actions">
              <button onClick={handleExportCSV} className="export-btn csv-btn" title="Descargar CSV">
                <FileText size={14} /> CSV
              </button>
              <button className="export-btn" disabled title="Próximamente">
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button className="export-btn" disabled title="Próximamente">
                <File size={14} /> PDF
              </button>
            </div>
          </div>
        </div>

        {/* ROW 1 — 6 KPIs (same container style as Dashboard) */}
        {stats && (
          <div className="analysis-kpis-container">
            <div className="dashboard-kpis">
              <KpiCard title="Total anual" value={formatCurrency(fullYearTotal, "ARS")} icon={<DollarSign size={16} />} color="spent" />
              <KpiCard title="Promedio mensual" value={formatCurrency(stats.avgMonthly, "ARS")} icon={<BarChart3 size={16} />} color="subscriptions" />
              <KpiCard title="Mayor pago" value={formatCurrency(stats.highestPayment, "ARS")} icon={<Trophy size={16} />} color="warning" />
              <KpiCard title="Mes más caro" value={stats.mostExpensive?.monthName || "—"} subtitle={formatCurrency(stats.mostExpensive?.monthly_total || 0, "ARS")} icon={<ArrowUp size={16} />} color="danger" />
              <KpiCard title="Variación mensual" value={`${stats.monthlyVariation >= 0 ? "+" : ""}${stats.monthlyVariation.toFixed(1)}%`} icon={<TrendingDown size={16} />} color={stats.monthlyVariation > 0 ? "danger" : "success"} />
              <KpiCard title="Ahorro potencial" value="—" subtitle="Disponible pronto" icon={<PiggyBank size={16} />} color="info" />
            </div>
          </div>
        )}

        {/* ROW 2 — Gasto por categoría + Evolución de gastos */}
        <div className="analysis-grid-2">
          <div className="analysis-card app-card">
            <div className="card-title-header"><PieChart size={14} /> Gasto por categoría</div>
            {hasCategories ? <AnnualDistribution categories={byCategory} monthlyEvolution={filteredEvolution} monthlyTotal={monthlyTotal} currency="ARS" /> : <div className="card-empty"><PieChart size={48} /><span>Sin datos de categorías</span></div>}
          </div>
          <div className="analysis-card app-card">
            {hasData ? <MonthlyEvolution data={monthlyChartData} currency="ARS" range={null} /> : <div className="card-empty"><TrendingUp size={48} /><span>Sin datos de evolución</span></div>}
          </div>
        </div>

        {/* ROW 3 — Insights + Oportunidades de ahorro */}
        <div className="analysis-grid-2">
          <div className="analysis-card app-card">
            <div className="card-title-header"><Lightbulb size={14} /> Insights</div>
            <InsightsPanel
              categories={byCategory}
              monthlyEvolution={filteredEvolution}
              monthlyTotal={monthlyTotal}
              currency="ARS"
            />
          </div>
          <div className="analysis-card app-card">
            <SavingsOpportunities subscriptions={subscriptions} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;