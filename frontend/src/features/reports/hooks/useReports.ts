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
  getFinancialReport: (month?: number, year?: number, range?: number | null, rangeMode?: string) => Promise<void>;
  getMonthlyEvolution: (year?: number) => Promise<void>;
}

export const useReports = (month?: number, year?: number, range?: number | null, rangeMode?: string): UseReportsReturn => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinancialReport = async (m?: number, y?: number, r?: number | null, rm?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Determine which years to fetch evolution for
      let yearsToFetch = [y!];
      if (rm === 'range' && r && y && m) {
        const now = new Date();
        const actualTotal = now.getFullYear() * 12 + (now.getMonth() + 1);
        const endTotal = Math.min(y * 12 + m, actualTotal);
        const startTotal = endTotal - r + 1;
        const startYear = Math.floor(startTotal / 12) || 1;
        if (startYear < y) {
          yearsToFetch = [startYear, y];
        }
      }

      const [financialReport, ...evolutionResults] = await Promise.all([
        reportService.getFinancialReport(m, y, r, rm),
        ...yearsToFetch.map(yy => reportService.getMonthlyEvolution(yy)),
      ]);

      // Merge evolution data from all fetched years
      const allEvolution = evolutionResults.flatMap(er => er.monthlyEvolution || []);

      setReport(financialReport as any);
      setMonthlyEvolution(allEvolution);
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
    loadFinancialReport(month, year, range, rangeMode);
  }, [month, year, range, rangeMode]);

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