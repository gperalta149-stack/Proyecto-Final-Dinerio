// frontend/src/features/calendar/utils/date.ts
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return date.getMonth() === currentDate.getMonth() &&
    date.getFullYear() === currentDate.getFullYear();
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getFirstDayOfMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const getDaysInPrevMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth(), 0).getDate();
};

export const isWithinNextDays = (date: Date, days: number): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};