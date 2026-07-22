import React from "react";

import "./ReportFilters.css";

interface ReportFiltersProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const WEEKDAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}) => {
  const today = new Date();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const goPrev = () => {
    if (selectedMonth === 1) {
      onMonthChange(12);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const goNext = () => {
    if (selectedMonth === 12) {
      onMonthChange(1);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  return (
    <div className="report-filters">
      <div className="calendar-picker">
        <div className="calendar-picker-header">
          <button className="calendar-nav" onClick={goPrev}>&lsaquo;</button>
          <span className="calendar-picker-title">{MONTHS[selectedMonth - 1]} {selectedYear}</span>
          <button className="calendar-nav" onClick={goNext}>&rsaquo;</button>
        </div>
        <div className="calendar-grid">
          {WEEKDAYS.map(d => <span key={d} className="calendar-weekday">{d}</span>)}
          {Array.from({ length: firstDay }, (_, i) => (
            <span key={`empty-${i}`} className="calendar-day calendar-day--empty" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === today.getDate() && selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear();
            return (
              <span key={day} className={`calendar-day${isToday ? " calendar-day--today" : ""}`}>
                {day}
              </span>
            );
          })}
        </div>
      </div>


    </div>
  );
};

export default ReportFilters;