// Gama general de "ciclos de facturación" que maneja todo el sistema;
// el resto de servicios y reportes se basan en estos 4 valores.
export type BillingCycle = "monthly" | "yearly" | "weekly" | "quarterly"

// Factor tarjeta: IVA 21% + PAIS 30% + IIBB 2% ≈ 1.53 aprox.
// Se usa para el costo en pesos de compras en dólares con tarjeta.
const TARJETA_TAX_FACTOR = 1.53 // IVA 21% + PAIS 30% + IIBB 2%, ver reportController
const USD_ARS_RATE = 1450

// Convierte cada ciclo a "meses equivalentes" para poder sumar y alinear
// cobros sobre una misma escala mensual (anual=12, trimestral=3, semanal=0.25, mensual=1).
export function getCycleMonths(cycle: BillingCycle): number {
  switch (cycle) {
    case "yearly":
      return 12
    case "quarterly":
      return 3
    // Una semana ≈ un cuarto de mes a efectos de comparación/cálculo.
    case "weekly":
      return 0.25
    default:
      return 1
  }
}

// getMonthlyEquivalent convierte un monto de un ciclo a su equivalente
// mensual (anual /12, trimestral /3, semanal *4) para comparar planes en pie de igualdad.
export function getMonthlyEquivalent(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "yearly":
      return amount / 12
    case "quarterly":
      return amount / 3
    case "weekly":
      return amount * 4
    default:
      return amount
  }
}

// convertToARS pasa a pesos un monto USD aplicando tasa fija + factor tarjeta;
// si ya está en ARS lo devuelve sin cambios.
export function convertToARS(amount: number, currency: string): number {
  return currency === "USD" ? amount * USD_ARS_RATE * TARJETA_TAX_FACTOR : amount
}

// monthKey transforma (año, mes) en un entero único y ordenable:
// año*12 + mes. Permite comparar/restar meses sin lidiar con objetos Date ni años bisiestos.
const monthKey = (year: number, month: number) => year * 12 + month


// countBillingCyclesInRange cuenta cuántos cobros de una suscripción caen
// dentro de un rango de meses, resolviendo la matemática de facturación de Dinerio.
export function countBillingCyclesInRange(
  startDate: Date,
  nextBillingDate: Date,
  cycle: BillingCycle,
  rangeStartKey: number,
  rangeEndKey: number
): number {
  // Convierte fechas y límites del rango a "claves" de mes para operar con números.
  const cycleMonths = getCycleMonths(cycle)
  const subStartKey = monthKey(startDate.getFullYear(), startDate.getMonth() + 1)
  const nextKey = monthKey(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1)

  // Casos borde: si el rango no alcanza al inicio de la suscripción,
  // o el próximo cobro ya quedó antes del rango, no hay cobros en el intervalo → 0.
  const earliestKey = Math.max(subStartKey, rangeStartKey)
  if (earliestKey > rangeEndKey) return 0
  if (nextKey < rangeStartKey) return 0 // la suscripción no tiene cobros registrados que lleguen a este rango

  // Rebasamos desde "nextKey" hacia atrás hasta encontrar el primer cobro
  // del mes en que comienza el rango (alineación del día de cobro dentro del mes).
  // Además se rompe si el mes baja de 1 para evitar ciclos sin sentido en el pasado lejano.
  let cursorKey = nextKey
  while (cursorKey >= earliestKey + cycleMonths) {
    cursorKey -= cycleMonths
    if (cursorKey < 1) break
  }
  while (cursorKey < earliestKey) {
    cursorKey += cycleMonths
  }

  // Cuenta los cobros mes a mes hasta el final del rango (o hasta el último
  // cobro registrado). "safety" es una red de seguridad para no entrar en bucle infinito.
  const endKey = Math.min(rangeEndKey, nextKey)
  let count = 0
  let safety = 0
  while (cursorKey <= endKey && safety < 1000) {
    count++
    cursorKey += cycleMonths
    safety++
  }
  return count
}

export function billingKeyFromYearMonth(year: number, month: number): number {
  return monthKey(year, month)
}


// getOccurrenceDateInMonth devuelve la fecha (día) en que la suscripción
// realmente "cae" dentro de un mes dado, o null si no corresponde a ese mes.
export function getOccurrenceDateInMonth(
  startDate: Date,
  nextBillingDate: Date,
  cycle: BillingCycle,
  targetYear: number,
  targetMonth: number
): Date | null {
  const startKey = monthKey(startDate.getFullYear(), startDate.getMonth() + 1)
  const nextKey = monthKey(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1)
  const targetKey = monthKey(targetYear, targetMonth)

  if (targetKey < startKey) return null // antes de que existiera la suscripción

  const cycleMonths = getCycleMonths(cycle)
  const diff = targetKey - nextKey

  if (cycle === "weekly") {
    // Ciclo semanal (~4 cobros por mes): se simplifica a un evento
    // representativo por mes, en todos los meses desde el inicio.
    // Limitación conocida: no desglosa las ~4 ocurrencias semanales
    // individuales dentro del mes.
  } else if (diff % cycleMonths !== 0) {
    // Si la diferencia de meses no es múltiplo exacto del ciclo,
    // ese mes NO tiene cobro (p. ej. trimestral), por lo que devolvemos null.
    return null
  }

  const day = nextBillingDate.getDate()
  // "Clamp" del día de cobro: si el mes destino tiene menos días que el día
  // original (ej. cobra el 31 y el mes tiene 28/30), se ajusta al último día del mes.
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate()
  const clampedDay = Math.min(day, daysInTargetMonth)
  return new Date(targetYear, targetMonth - 1, clampedDay)
}