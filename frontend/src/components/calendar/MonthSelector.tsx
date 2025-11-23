import React from 'react';

interface MonthSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentDate, onDateChange }) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    onDateChange(newDate);
  };

  return (
    <div className="month-selector">
      <div className="month-year-container">
        {/* Controles del Mes */}
        <div className="control-group">
          <button
            onClick={() => navigateMonth('prev')}
            className="nav-button"
            aria-label="Mes anterior"
          >
            ‹
          </button>
          <span className="current-value month-value">
            {months[currentDate.getMonth()]}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="nav-button"
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        {/* Controles del Año */}
        <div className="control-group">
          <button
            onClick={() => navigateYear('prev')}
            className="nav-button"
            aria-label="Año anterior"
          >
            ‹
          </button>
          <span className="current-value year-value">
            {currentDate.getFullYear()}
          </span>
          <button
            onClick={() => navigateYear('next')}
            className="nav-button"
            aria-label="Año siguiente"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};