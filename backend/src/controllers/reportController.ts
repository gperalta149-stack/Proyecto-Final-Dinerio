import { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

export const exportSubscriptionsCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1
    const currentYear = year ? Number(year) : new Date().getFullYear()

    const result = await pool.query(
      `SELECT s.name, s.amount, s.currency, s.billing_cycle, s.status,
              s.next_billing_date, c.name as category, s.payment_method
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = $1
          AND EXTRACT(MONTH FROM s.next_billing_date) = $2
          AND EXTRACT(YEAR FROM s.next_billing_date) = $3
        ORDER BY s.name ASC`,
      [req.user!.userId, currentMonth, currentYear]
    )

    const headers = ["Nombre", "Monto", "Moneda", "Ciclo", "Estado", "Próximo Pago", "Categoría", "Método de Pago"]
    const rows = result.rows.map((row) => [
      row.name,
      row.amount,
      row.currency,
      row.billing_cycle,
      row.status,
      new Date(row.next_billing_date).toLocaleDateString("es-ES"),
      row.category || "Sin categoría",
      row.payment_method || "No especificado",
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    res.setHeader("Content-Type", "text/csv; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename=suscripciones-${currentMonth}-${currentYear}.csv`)
    res.send("\uFEFF" + csv)
  } catch (error) {
    console.error("Export CSV error:", error)
    res.status(500).json({ error: "Error al exportar CSV" })
  }
}

export const getFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year, range, rangeMode } = req.query
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1
    const currentYear = year ? Number(year) : new Date().getFullYear()
    const currentRange = range ? Number(range) : null

    const isDateMode = !currentRange || rangeMode === "date"
    const now = new Date()
    const rangeEndMonth = isDateMode ? currentMonth : now.getMonth() + 1
    const rangeEndYear = isDateMode ? currentYear : now.getFullYear()

    const monthlyResult = await pool.query(
      `SELECT
          COUNT(*) as total_subscriptions,
          COALESCE(SUM(CASE
            -- CONVERTIR USD A ARS CON IMPUESTOS: ofc + IVA(21%) + PAIS(30%) + IIBB(2%) = ofc * 1.53
            WHEN currency = 'USD' THEN
              CASE
                WHEN billing_cycle = 'monthly' THEN amount * 1.53 * 1450
                WHEN billing_cycle = 'yearly' THEN (amount / 12) * 1.53 * 1450
                WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 1.53 * 1450
                WHEN billing_cycle = 'weekly' THEN (amount * 4) * 1.53 * 1450
              END
            -- MANTENER ARS
            ELSE
              CASE
                WHEN billing_cycle = 'monthly' THEN amount
                WHEN billing_cycle = 'yearly' THEN amount / 12
                WHEN billing_cycle = 'quarterly' THEN amount / 3
                WHEN billing_cycle = 'weekly' THEN amount * 4
              END
          END), 0) as monthly_total,
          COALESCE(SUM(CASE
            WHEN currency = 'USD' THEN
              CASE
                WHEN billing_cycle = 'monthly' THEN amount * 1.53 * 1450 * 12
                WHEN billing_cycle = 'yearly' THEN amount * 1.53 * 1450
                WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 1.53 * 1450 * 12
                WHEN billing_cycle = 'weekly' THEN (amount * 4) * 1.53 * 1450 * 12
              END
            ELSE
              CASE
                WHEN billing_cycle = 'monthly' THEN amount * 12
                WHEN billing_cycle = 'yearly' THEN amount
                WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 12
                WHEN billing_cycle = 'weekly' THEN amount * 4 * 12
              END
          END), 0) as yearly_total
        FROM subscriptions
        WHERE user_id = $1
          AND status = 'active'
          AND EXTRACT(MONTH FROM next_billing_date) = $2
          AND EXTRACT(YEAR FROM next_billing_date) = $3`,
      [req.user!.userId, rangeEndMonth, rangeEndYear]
    )

    // --- Compute range boundaries (in total months) ---
    let rangeStartTotal: number, rangeEndTotal: number
    if (isDateMode) {
      rangeStartTotal = rangeEndYear * 12 + rangeEndMonth
      rangeEndTotal = rangeEndYear * 12 + rangeEndMonth
    } else {
      rangeEndTotal = rangeEndYear * 12 + rangeEndMonth
      rangeStartTotal = rangeEndTotal - currentRange + 1
    }
    const rangeStartYear = Math.floor(rangeStartTotal / 12) || 1
    const rangeStartMonth = rangeStartTotal % 12 || 12

    // --- Get all categories ---
    const allCategories = await pool.query(
      `SELECT id, name, color FROM categories WHERE user_id IS NULL OR user_id = $1`,
      [req.user!.userId]
    )

    // --- Get all active subscriptions ---
    const allSubs = await pool.query(
      `SELECT id, category_id, amount, currency, billing_cycle, start_date, next_billing_date
        FROM subscriptions
        WHERE user_id = $1 AND status = 'active'`,
      [req.user!.userId]
    )

    // --- Compute cumulative per-category totals ---
    const catAcc: Record<string, { ars: number; usd: number; subCount: number }> = {}
    allCategories.rows.forEach((cat: any) => {
      catAcc[cat.id] = { ars: 0, usd: 0, subCount: 0 }
    })

    for (const sub of allSubs.rows) {
      const catId = sub.category_id
      if (!catId || !catAcc[catId]) continue

      const amount = Number(sub.amount)
      const isUSD = sub.currency === 'USD'
      const cycle = sub.billing_cycle

      // Monthly-equivalent amount
      let monthlyAmount = amount
      if (cycle === 'yearly') monthlyAmount = amount / 12
      else if (cycle === 'quarterly') monthlyAmount = amount / 3
      else if (cycle === 'weekly') monthlyAmount = amount * 4

      // Billing cycle in months
      let cycleMonths = 1
      if (cycle === 'yearly') cycleMonths = 12
      else if (cycle === 'quarterly') cycleMonths = 3
      else if (cycle === 'weekly') cycleMonths = 0.25

      // Count billing cycles within [rangeStart, rangeEnd]
      const next = new Date(sub.next_billing_date)
      const nextKey = next.getFullYear() * 12 + (next.getMonth() + 1)

      // Date mode: only count subscriptions whose next_billing_date falls in the selected month
      if (isDateMode) {
        if (next.getFullYear() !== rangeEndYear || next.getMonth() + 1 !== rangeEndMonth) continue
        const total = monthlyAmount
        if (isUSD) catAcc[catId].usd += total
        else catAcc[catId].ars += total
        catAcc[catId].subCount++
        continue
      }

      const subStart = new Date(sub.start_date)
      const subStartKey = subStart.getFullYear() * 12 + (subStart.getMonth() + 1)

      // Earliest possible billing: max(subscription start, range start)
      const earliestKey = Math.max(subStartKey, rangeStartTotal)
      if (earliestKey > rangeEndTotal) continue // subscription started after range end

      // Find first billing date >= earliestKey by walking back from next_billing_date
      let cursorKey = nextKey
      while (cursorKey >= earliestKey + cycleMonths) {
        cursorKey -= cycleMonths
        if (cursorKey < 1) break
      }
      // Step forward to the first billing on or after earliestKey
      while (cursorKey < earliestKey) {
        cursorKey += cycleMonths
      }

      // Count all billing dates from cursor up to the last committed billing (nextKey)
      const endKey = Math.min(rangeEndTotal, nextKey)
      let count = 0
      while (cursorKey <= endKey) {
        count++
        cursorKey += cycleMonths
      }

      const total = monthlyAmount * count
      if (isUSD) catAcc[catId].usd += total
      else catAcc[catId].ars += total
      if (count > 0) catAcc[catId].subCount++
    }

    // --- Add paid debts within range ---
    const debtParams: any[] = [req.user!.userId]
    let debtDateFilter = ""
    if (isDateMode) {
      debtDateFilter = `AND EXTRACT(MONTH FROM d.paid_at) = $2 AND EXTRACT(YEAR FROM d.paid_at) = $3`
      debtParams.push(rangeEndMonth, rangeEndYear)
    } else {
      debtDateFilter = `AND d.paid_at >= $2::date AND d.paid_at < ($3::date + interval '1 month')`
      debtParams.push(
        `${rangeStartYear}-${String(rangeStartMonth).padStart(2, "0")}-01`,
        `${rangeEndYear}-${String(rangeEndMonth).padStart(2, "0")}-01`,
      )
    }

    const debtResult = await pool.query(
      `SELECT
        d.category_id,
        COALESCE(SUM(CASE WHEN d.currency = 'USD' THEN d.amount ELSE 0 END), 0) as debt_total_usd,
        COALESCE(SUM(CASE WHEN d.currency = 'ARS' THEN d.amount ELSE 0 END), 0) as debt_total_ars
      FROM debts d
      WHERE d.user_id = $1
        AND d.status = 'paid'
        ${debtDateFilter}
      GROUP BY d.category_id`,
      debtParams
    )

    for (const debt of debtResult.rows) {
      if (!debt.category_id) continue
      const acc = catAcc[debt.category_id]
      if (acc) {
        acc.usd += Number(debt.debt_total_usd)
        acc.ars += Number(debt.debt_total_ars)
      }
    }

    // --- Build final by_category array ---
    const categoryRows = allCategories.rows
      .map((cat: any) => {
        const acc = catAcc[cat.id]
        return {
          id: cat.id,
          name: cat.name,
          color: cat.color,
          subscription_count: acc ? acc.subCount : 0,
          monthly_total_usd: acc ? Math.round(acc.usd) : 0,
          monthly_total_ars: acc ? Math.round(acc.ars) : 0,
        }
      })
      .filter((r: any) => r.monthly_total_usd !== 0 || r.monthly_total_ars !== 0)
      .sort((a: any, b: any) => (b.monthly_total_ars + b.monthly_total_usd) - (a.monthly_total_ars + a.monthly_total_usd))

    const userResult = await pool.query(`SELECT monthly_budget, currency FROM users WHERE id = $1`, [req.user!.userId])

    // Get subscriptions - filtrado por mes/rango
    const subsParams: any[] = [req.user!.userId]
    let subsDateFilter = ""
    if (isDateMode) {
      subsDateFilter = `AND EXTRACT(MONTH FROM s.next_billing_date) = $2 AND EXTRACT(YEAR FROM s.next_billing_date) = $3`
      subsParams.push(rangeEndMonth, rangeEndYear)
    } else {
      const totalMonths = rangeEndYear * 12 + rangeEndMonth
      const startTotalMonths = totalMonths - currentRange + 1
      const startYear = Math.floor(startTotalMonths / 12)
      const startMonth = startTotalMonths % 12 || 12
      subsDateFilter = `AND s.next_billing_date >= $2::date AND s.next_billing_date < ($3::date + interval '1 month')`
      subsParams.push(
        `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
        `${rangeEndYear}-${String(rangeEndMonth).padStart(2, "0")}-01`,
      )
    }

    const subscriptionsResult = await pool.query(
      `SELECT
          s.id, s.name, s.description, s.amount, s.currency, s.billing_cycle,
          s.status, s.category_id, s.next_billing_date, s.created_at, s.updated_at,
          c.name as category_name, c.color as category_color
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = $1
          AND s.status = 'active'
          ${subsDateFilter}`,
      subsParams
    )

    const monthlyTotal = Number.parseFloat(monthlyResult.rows[0].monthly_total)
    const monthlyBudget = Number.parseFloat(userResult.rows[0].monthly_budget)
    const budgetUsage = monthlyBudget > 0 ? (monthlyTotal / monthlyBudget) * 100 : 0

    res.json({
      month: currentMonth,
      year: currentYear,
      summary: {
        total_subscriptions: Number.parseInt(monthlyResult.rows[0].total_subscriptions),
        monthly_total: monthlyTotal,
        yearly_total: Number.parseFloat(monthlyResult.rows[0].yearly_total),
        monthly_budget: monthlyBudget,
        budget_usage: budgetUsage,
        currency: userResult.rows[0].currency,
      },
      by_category: categoryRows,
      subscriptions: subscriptionsResult.rows,
    })
  } catch (error) {
    console.error("Get financial report error:", error)
    res.status(500).json({ error: "Error al generar reporte financiero" })
  }
}

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getCycleMonths(cycle: string): number {
  switch (cycle) {
    case "yearly": return 12;
    case "quarterly": return 3;
    default: return 1;
  }
}

function paymentAmount(amount: number, currency: string): number {
  return currency === "USD" ? amount * 1450 * 1.53 : amount;
}

export const getMonthlyEvolution = async (req: AuthRequest, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const targetYear = Number(year);

    const result = await pool.query(
      `SELECT amount, currency, billing_cycle, start_date, next_billing_date, status
        FROM subscriptions
        WHERE user_id = $1 AND status = 'active'`,
      [req.user!.userId]
    );

    const monthlyTotals = Array(12).fill(0);
    const monthlyTotalsARS = Array(12).fill(0);
    const monthlyTotalsUSD = Array(12).fill(0);
    const monthlyPaidARS = Array(12).fill(0);
    const monthlyPaidUSD = Array(12).fill(0);
    const subscriptionCounts = Array(12).fill(0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const row of result.rows) {
      const start = new Date(row.start_date);
      if (start.getFullYear() > targetYear) continue;

      const cycle = row.billing_cycle;
      const cycles = getCycleMonths(cycle);
      const amount = Number(row.amount);
      const payAmount = paymentAmount(amount, row.currency);
      const isUSD = row.currency === 'USD';

      // Raw monthly amount per currency (billing-cycle-adjusted)
      let monthlyRaw = amount;
      if (cycle === 'yearly') monthlyRaw = amount / 12;
      else if (cycle === 'quarterly') monthlyRaw = amount / 3;
      else if (cycle === 'weekly') monthlyRaw = amount * 4;

      const next = new Date(row.next_billing_date);

      // Find the first payment month in targetYear
      let cursor = new Date(next);
      while (cursor.getFullYear() > targetYear) {
        cursor.setMonth(cursor.getMonth() - cycles);
      }
      while (cursor.getFullYear() < targetYear) {
        cursor.setMonth(cursor.getMonth() + cycles);
      }
      if (cursor.getFullYear() !== targetYear) continue;

      // First payment month in targetYear
      const firstMonth = cursor.getMonth();

      const isPaid = next <= today;

      if (cycle === "monthly" || cycle === "weekly") {
        monthlyTotals[firstMonth] += payAmount;
        if (isUSD) {
          monthlyTotalsUSD[firstMonth] += monthlyRaw;
          if (isPaid) monthlyPaidUSD[firstMonth] += monthlyRaw;
        } else {
          monthlyTotalsARS[firstMonth] += monthlyRaw;
          if (isPaid) monthlyPaidARS[firstMonth] += monthlyRaw;
        }
        subscriptionCounts[firstMonth]++;
      } else if (cycle === "yearly") {
        monthlyTotals[firstMonth] += payAmount;
        if (isUSD) {
          monthlyTotalsUSD[firstMonth] += monthlyRaw;
          if (isPaid) monthlyPaidUSD[firstMonth] += monthlyRaw;
        } else {
          monthlyTotalsARS[firstMonth] += monthlyRaw;
          if (isPaid) monthlyPaidARS[firstMonth] += monthlyRaw;
        }
        subscriptionCounts[firstMonth]++;
      } else if (cycle === "quarterly") {
        for (let m = firstMonth; m < 12; m += 3) {
          const monthsAhead = m - firstMonth;
          const billingDate = new Date(next);
          billingDate.setMonth(billingDate.getMonth() + monthsAhead);
          const isQuarterPaid = billingDate <= today;

          monthlyTotals[m] += payAmount;
          if (isUSD) {
            monthlyTotalsUSD[m] += monthlyRaw;
            if (isQuarterPaid) monthlyPaidUSD[m] += monthlyRaw;
          } else {
            monthlyTotalsARS[m] += monthlyRaw;
            if (isQuarterPaid) monthlyPaidARS[m] += monthlyRaw;
          }
          subscriptionCounts[m]++;
        }
      }
    }

    // Sumar deudas al total y a lo pagado por mes
    try {
      const debtsResult = await pool.query(
        `SELECT amount, currency, status,
                EXTRACT(MONTH FROM COALESCE(paid_at, due_date)) as m,
                EXTRACT(YEAR FROM COALESCE(paid_at, due_date)) as y
          FROM debts
          WHERE user_id = $1 AND EXTRACT(YEAR FROM COALESCE(paid_at, due_date)) = $2`,
        [req.user!.userId, targetYear]
      );
      for (const row of debtsResult.rows) {
        const m = Number(row.m) - 1;
        if (m >= 0 && m < 12) {
          const amt = Number(row.amount);
          if (row.currency === 'USD') {
            monthlyTotalsUSD[m] += amt;
            monthlyTotals[m] += paymentAmount(amt, 'USD');
            if (row.status === 'paid') monthlyPaidUSD[m] += amt;
          } else {
            monthlyTotalsARS[m] += amt;
            monthlyTotals[m] += amt;
            if (row.status === 'paid') monthlyPaidARS[m] += amt;
          }
        }
      }
    } catch (err) {
      console.warn('Error al obtener deudas:', err);
    }

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: targetYear,
      monthName: monthNames[i],
      monthly_total: Math.round(monthlyTotals[i]),
      monthly_total_ars: Math.round(monthlyTotalsARS[i]),
      monthly_total_usd: Math.round(monthlyTotalsUSD[i] * 100) / 100,
      monthly_paid_ars: Math.round(monthlyPaidARS[i]),
      monthly_paid_usd: Math.round(monthlyPaidUSD[i] * 100) / 100,
      subscription_count: subscriptionCounts[i],
    }));

    res.json({ monthlyEvolution: monthlyData });
  } catch (error) {
    console.error("Get monthly evolution error:", error);
    res.status(500).json({ error: "Error al obtener evolución mensual" });
  }
};
