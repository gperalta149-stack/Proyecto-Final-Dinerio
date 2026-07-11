// frontend/src/features/calendar/components/MonthSelector/MonthSelector.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS } from '../../constants/calendar';
import './MonthSelector.css';

interface MonthSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  currentDate,
  onDateChange,
}) => {
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

  const goToToday = () => onDateChange(new Date());

  const now = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === now.getMonth() &&
    currentDate.getFullYear() === now.getFullYear();

  return (
    <div className="month-selector">
      <div className="month-selector-container">
        <div className="month-selector-group">
          <button 
            onClick={() => navigateMonth('prev')} 
            className="month-selector-btn"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="month-selector-value month-value">
            {MONTHS[currentDate.getMonth()]}
          </span>
          <button 
            onClick={() => navigateMonth('next')} 
            className="month-selector-btn"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="month-selector-divider" />

        <div className="month-selector-group">
          <button 
            onClick={() => navigateYear('prev')} 
            className="month-selector-btn"
            aria-label="Año anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="month-selector-value year-value">
            {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => navigateYear('next')} 
            className="month-selector-btn"
            aria-label="Año siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="month-selector-divider" />

        <button
          onClick={goToToday}
          className="month-selector-today-btn"
          disabled={isCurrentMonth}
        >
          Hoy
        </button>
      </div>
    </div>
  );
};

export default MonthSelector;