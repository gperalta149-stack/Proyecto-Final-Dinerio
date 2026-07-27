// Lógica compartida para calcular cuántas veces se factura una suscripción
// dentro de un rango de meses. Se usa TANTO en el reporte financiero (by_category)
// COMO en la evolución mensual, para que ambos números sean consistentes entre sí
// por construcción (misma fórmula), en vez de dos heurísticas distintas que
// pueden divergir.

export type BillingCycle = "monthly" | "yearly" | "weekly" | "quarterly"

const TARJETA_TAX_FACTOR = 1.53 // IVA 21% + PAIS 30% + IIBB 2%, ver reportController
const USD_ARS_RATE = 1450

export function getCycleMonths(cycle: BillingCycle): number {
  switch (cycle) {
    case "yearly":
      return 12
    case "quarterly":
      return 3
    case "weekly":
      return 0.25
    default:
      return 1
  }
}

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

export function convertToARS(amount: number, currency: string): number {
  return currency === "USD" ? amount * USD_ARS_RATE * TARJETA_TAX_FACTOR : amount
}

const monthKey = (year: number, month: number) => year * 12 + month

/**
 * Cuenta cuántos ciclos de facturación de una suscripción caen dentro de
 * [rangeStartKey, rangeEndKey] (ambos como año*12+mes, inclusive), reconstruidos
 * hacia atrás/adelante desde next_billing_date y respetando start_date.
 *
 * Para un rango de un solo mes (rangeStartKey === rangeEndKey), esto reemplaza
 * el chequeo ingenuo "¿next_billing_date cae exactamente en este mes?", que
 * ignoraba suscripciones anuales/trimestrales cuyo próximo cobro no es este mes
 * pero cuyo costo mensual-equivalente sigue aplicando.
 */
export function countBillingCyclesInRange(
  startDate: Date,
  nextBillingDate: Date,
  cycle: BillingCycle,
  rangeStartKey: number,
  rangeEndKey: number
): number {
  const cycleMonths = getCycleMonths(cycle)
  const subStartKey = monthKey(startDate.getFullYear(), startDate.getMonth() + 1)
  const nextKey = monthKey(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1)

  const earliestKey = Math.max(subStartKey, rangeStartKey)
  if (earliestKey > rangeEndKey) return 0
  if (nextKey < rangeStartKey) return 0 // la suscripción no tiene cobros registrados que lleguen a este rango

  let cursorKey = nextKey
  while (cursorKey >= earliestKey + cycleMonths) {
    cursorKey -= cycleMonths
    if (cursorKey < 1) break
  }
  while (cursorKey < earliestKey) {
    cursorKey += cycleMonths
  }

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