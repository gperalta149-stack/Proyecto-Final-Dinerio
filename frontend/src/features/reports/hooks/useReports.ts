// frontend/src/features/reports/hooks/useReports.ts
import { useState, useEffect } from "react";
import { reportService } from "../service/reportService";
import type { FinancialReport, MonthlyEvolutionData } from "../types";

interface UseReportsReturn {
  report: FinancialReport | null;
  monthlyEvolution: MonthlyEvolutionData[];
  loading: boolean;
  error: string | null;
  exportCSV: (month?: number, year?: number) => Promise<void>;
  getFinancialReport: (month?: number, year?: number) => Promise<void>;
  getMonthlyEvolution: (year?: number) => Promise<void>;
}

export const useReports = (month?: number, year?: number): UseReportsReturn => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialReport = async (m?: number, y?: number) => {
    try {
      setLoading(true);
      setError(null);
      const [financialReport, evolutionData] = await Promise.all([
        reportService.getFinancialReport(m, y),
        reportService.getMonthlyEvolution(y),
      ]);
      setReport(financialReport);
      setMonthlyEvolution(evolutionData.monthlyEvolution || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async (m?: number, y?: number) => {
    try {
      const blob = await reportService.exportCSV(m, y);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `reporte-suscripciones-${m || month}-${y || year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Error al exportar el reporte");
      console.error(err);
    }
  };

  useEffect(() => {
    loadFinancialReport(month, year);
  }, [month, year]);

  return {
    report,
    monthlyEvolution,
    loading,
    error,
    exportCSV,
    getFinancialReport: loadFinancialReport,
    getMonthlyEvolution: async (y?: number) => {
      try {
        const data = await reportService.getMonthlyEvolution(y);
        setMonthlyEvolution(data.monthlyEvolution || []);
      } catch (err) {
        setError("Error al cargar la evolución mensual");
      }
    },
  };
};