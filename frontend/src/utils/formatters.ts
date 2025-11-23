export const parseAmount = (amount: string | number | undefined): number => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') return Number.parseFloat(amount) || 0;
  return 0;
};

export const formatCurrency = (amount: number, currency: string = "ARS"): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency, 
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export const formatShortDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export const getBillingCycleLabel = (cycle: string): string => {
  const labels: Record<string, string> = {
    monthly: "Mensual",
    yearly: "Anual",
    weekly: "Semanal",
  }
  return labels[cycle] || cycle
}

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: "Activa",
    cancelled: "Cancelada",
    paused: "Pausada",
  }
  return labels[status] || status
}

export const getDaysUntilNextPayment = (date: string | Date): number => {
  const nextDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  nextDate.setHours(0, 0, 0, 0)

  const diffTime = nextDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

