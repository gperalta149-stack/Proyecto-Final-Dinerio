// frontend/src/features/calendar/utils/date.ts

const toLocalKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const isToday = (date: Date): boolean => {
  return toLocalKey(date) === toLocalKey(new Date());
};

export const isOverdue = (date: string | Date): boolean => {
  const d = typeof date === "string" ? parseDateString(date) : date;
  return toLocalKey(d) < toLocalKey(new Date());
};

export const isCurrentMonth = (date: string | Date, currentDate: Date): boolean => {
  const d = typeof date === "string" ? parseDateString(date) : date;
  return d.getMonth() === currentDate.getMonth() &&
    d.getFullYear() === currentDate.getFullYear();
};

export const formatDateKey = (date: Date): string => {
  return toLocalKey(date);
};

export const parseDateString = (value: string): Date => {
  const [datePart] = value.split("T");
  const parts = datePart.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return new Date(value);
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export const toDateKey = (value: string | Date): string => {
  if (value instanceof Date) return toLocalKey(value);
  return toLocalKey(parseDateString(value));
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

export const isWithinNextDays = (date: string | Date, days: number): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = typeof date === "string" ? parseDateString(date) : new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
};
