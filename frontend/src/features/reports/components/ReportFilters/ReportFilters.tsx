import React from "react";
import { Calendar, ChevronDown, FileText, FileSpreadsheet, File } from "lucide-react";
import "./ReportFilters.css";

interface ReportFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onExportCSV: () => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onExportCSV,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="report-filters">
      <div className="filter-select-wrapper">
        <Calendar size={16} className="filter-icon" />
        <select
          value={`${selectedMonth}-${selectedYear}`}
          onChange={(e) => {
            const [month, year] = e.target.value.split('-').map(Number);
            onMonthChange(month);
            onYearChange(year);
          }}
          className="filter-select"
        >
          {years.map(year => (
            MONTHS.map((month, index) => {
              const monthNum = index + 1;
              return (
                <option key={`${monthNum}-${year}`} value={`${monthNum}-${year}`}>
                  {month} {year}
                </option>
              );
            })
          ))}
        </select>
        <ChevronDown size={14} className="filter-chevron" />
      </div>

      <button onClick={onExportCSV} className="export-btn csv-btn" title="Descargar CSV">
        <FileText size={14} />
        CSV
      </button>
      <button className="export-btn" disabled title="Próximamente">
        <FileSpreadsheet size={14} />
        Excel
      </button>
      <button className="export-btn" disabled title="Próximamente">
        <File size={14} />
        PDF
      </button>
    </div>
  );
};

export default ReportFilters;
