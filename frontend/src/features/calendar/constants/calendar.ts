// frontend/src/features/calendar/constants/calendar.ts
export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  monthly: 'mes',
  yearly: 'año',
  weekly: 'semana',
  quarterly: 'trimestre'
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  cancelled: 'Cancelado'
};