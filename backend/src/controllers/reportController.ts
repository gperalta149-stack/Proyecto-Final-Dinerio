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

    const monthlyResult = await pool.query(
      `SELECT
          COUNT(*) as total_subscriptions,
          COALESCE(SUM(CASE
            -- CONVERTIR USD A ARS CON IMPUESTOS
            WHEN currency = 'USD' THEN
              CASE
                WHEN billing_cycle = 'monthly' THEN amount * 1.75 * 1450
                WHEN billing_cycle = 'yearly' THEN (amount / 12) * 1.75 * 1450
                WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 1.75 * 1450
                WHEN billing_cycle = 'weekly' THEN (amount * 4) * 1.75 * 1450
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
                WHEN billing_cycle = 'monthly' THEN amount * 1.75 * 1450 * 12
                WHEN billing_cycle = 'yearly' THEN amount * 1.75 * 1450
                WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 1.75 * 1450 * 12
                WHEN billing_cycle = 'weekly' THEN (amount * 4) * 1.75 * 1450 * 12
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
      [req.user!.userId, currentMonth, currentYear]
    )

    // Get by category - filtrado por mes/rango
    const categoryParams: any[] = [req.user!.userId]
    let categoryDateFilter = ""
    if (rangeMode === "date" || !currentRange) {
      categoryDateFilter = `AND EXTRACT(MONTH FROM s.next_billing_date) = $2 AND EXTRACT(YEAR FROM s.next_billing_date) = $3`
      categoryParams.push(currentMonth, currentYear)
    } else {
      const totalMonths = currentYear * 12 + currentMonth
      const startTotalMonths = totalMonths - currentRange
      const startYear = Math.floor(startTotalMonths / 12)
      const startMonth = startTotalMonths % 12 || 12
      categoryDateFilter = `AND s.next_billing_date >= $2::date AND s.next_billing_date < ($3::date + interval '1 month')`
      categoryParams.push(
        `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
        `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
      )
    }

    const categoryResult = await pool.query(
      `SELECT
          c.name,
          c.color,
          COUNT(s.id) as subscription_count,
          COALESCE(SUM(CASE
            WHEN s.currency = 'USD' THEN
              CASE
                WHEN s.billing_cycle = 'monthly' THEN s.amount * 1.75 * 1450
                WHEN s.billing_cycle = 'yearly' THEN (s.amount / 12) * 1.75 * 1450
                WHEN s.billing_cycle = 'quarterly' THEN (s.amount / 3) * 1.75 * 1450
                WHEN s.billing_cycle = 'weekly' THEN (s.amount * 4) * 1.75 * 1450
              END
            ELSE
              CASE
                WHEN s.billing_cycle = 'monthly' THEN s.amount
                WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
                WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
                WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
              END
          END), 0) as monthly_total
        FROM categories c
        LEFT JOIN subscriptions s ON c.id = s.category_id
          AND s.user_id = $1
          AND s.status = 'active'
          ${categoryDateFilter}
        WHERE c.user_id IS NULL OR c.user_id = $1
        GROUP BY c.id, c.name, c.color
        ORDER BY monthly_total DESC`,
      categoryParams
    )
    const userResult = await pool.query(`SELECT monthly_budget, currency FROM users WHERE id = $1`, [req.user!.userId])

    // Get subscriptions - filtrado por mes/rango
    const subsParams: any[] = [req.user!.userId]
    let subsDateFilter = ""
    if (rangeMode === "date" || !currentRange) {
      subsDateFilter = `AND EXTRACT(MONTH FROM s.next_billing_date) = $2 AND EXTRACT(YEAR FROM s.next_billing_date) = $3`
      subsParams.push(currentMonth, currentYear)
    } else {
      const totalMonths = currentYear * 12 + currentMonth
      const startTotalMonths = totalMonths - currentRange
      const startYear = Math.floor(startTotalMonths / 12)
      const startMonth = startTotalMonths % 12 || 12
      subsDateFilter = `AND s.next_billing_date >= $2::date AND s.next_billing_date < ($3::date + interval '1 month')`
      subsParams.push(
        `${startYear}-${String(startMonth).padStart(2, "0")}-01`,
        `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`,
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
      by_category: categoryResult.rows,
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
  return currency === "USD" ? amount * 1450 * 1.75 : amount;
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
    const subscriptionCounts = Array(12).fill(0);

    for (const row of result.rows) {
      const start = new Date(row.start_date);
      if (start.getFullYear() > targetYear) continue;

      const cycle = row.billing_cycle;
      const cycles = getCycleMonths(cycle);
      const payAmount = paymentAmount(Number(row.amount), row.currency);
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

      if (cycle === "monthly" || cycle === "weekly") {
        // Pay every month from firstMonth through December
        for (let m = firstMonth; m < 12; m++) {
          monthlyTotals[m] += payAmount;
          subscriptionCounts[m]++;
        }
      } else if (cycle === "yearly") {
        // Pay once a year
        monthlyTotals[firstMonth] += payAmount;
        subscriptionCounts[firstMonth]++;
      } else if (cycle === "quarterly") {
        // Pay every 3 months
        for (let m = firstMonth; m < 12; m += 3) {
          monthlyTotals[m] += payAmount;
          subscriptionCounts[m]++;
        }
      }
    }

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: targetYear,
      monthName: monthNames[i],
      monthly_total: Math.round(monthlyTotals[i]),
      subscription_count: subscriptionCounts[i],
    }));

    res.json({ monthlyEvolution: monthlyData });
  } catch (error) {
    console.error("Get monthly evolution error:", error);
    res.status(500).json({ error: "Error al obtener evolución mensual" });
  }
};
