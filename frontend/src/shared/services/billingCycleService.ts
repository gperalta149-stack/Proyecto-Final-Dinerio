export type BillingCycle = "monthly" | "yearly" | "weekly" | "quarterly"

const TARJETA_TAX_FACTOR = 1.53
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

  let cursorKey = nextKey
  let safetyAlign = 0
  while (cursorKey > earliestKey && safetyAlign < 2000) {
    cursorKey -= cycleMonths
    safetyAlign++
  }
  while (cursorKey < earliestKey && safetyAlign < 2000) {
    cursorKey += cycleMonths
    safetyAlign++
  }

  let count = 0
  let safety = 0
  while (cursorKey <= rangeEndKey && safety < 1000) {
    if (cursorKey >= rangeStartKey) count++
    cursorKey += cycleMonths
    safety++
  }
  return count
}

export function billingKeyFromYearMonth(year: number, month: number): number {
  return monthKey(year, month)
}

function clampDayToMonth(year: number, month1to12: number, day: number): number {
  const lastDay = new Date(year, month1to12, 0).getDate()
  return Math.min(day, lastDay)
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function getOccurrenceDatesInMonth(
  startDate: Date,
  nextBillingDate: Date,
  cycle: BillingCycle,
  targetMonth: number,
  targetYear: number
): Date[] {
  const targetStart = new Date(targetYear, targetMonth - 1, 1)
  const targetEnd = new Date(targetYear, targetMonth, 0)
  const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())

  if (targetEnd < normalizedStart) return []

  if (cycle === "weekly") {
    let cursor = new Date(nextBillingDate)
    let safety = 0
    while (cursor > targetStart && safety < 500) {
      cursor = addDays(cursor, -7)
      safety++
    }
    while (cursor < targetStart && safety < 500) {
      cursor = addDays(cursor, 7)
      safety++
    }
    const results: Date[] = []
    safety = 0
    while (cursor <= targetEnd && safety < 60) {
      if (cursor >= normalizedStart) results.push(new Date(cursor))
      cursor = addDays(cursor, 7)
      safety++
    }
    return results
  }

  const cycleMonths = getCycleMonths(cycle)
  const nextKey = monthKey(nextBillingDate.getFullYear(), nextBillingDate.getMonth() + 1)
  const targetKey = monthKey(targetYear, targetMonth)
  const diff = targetKey - nextKey
  const mod = ((diff % cycleMonths) + cycleMonths) % cycleMonths
  if (mod !== 0) return []

  const day = clampDayToMonth(targetYear, targetMonth, nextBillingDate.getDate())
  const occurrence = new Date(targetYear, targetMonth - 1, day)
  if (occurrence < normalizedStart) return []
  return [occurrence]
}
