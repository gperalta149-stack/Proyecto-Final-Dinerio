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
    const { month, year } = req.query
    const currentMonth = month ? Number(month) : new Date().getMonth() + 1
    const currentYear = year ? Number(year) : new Date().getFullYear()

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
          END), 0) as monthly_total
        FROM subscriptions
        WHERE user_id = $1
          AND status = 'active'
          AND EXTRACT(MONTH FROM next_billing_date) = $2
          AND EXTRACT(YEAR FROM next_billing_date) = $3`,
      [req.user!.userId, currentMonth, currentYear]
    )

    // Get by category - FILTRADO POR MES
    const categoryResult = await pool.query(
      `SELECT
          c.name,
          c.color,
          COUNT(s.id) as subscription_count,
          COALESCE(SUM(CASE
            -- CONVERTIR USD A ARS CON IMPUESTOS (MISMA LÓGICA)
            WHEN s.currency = 'USD' THEN
              CASE
                WHEN s.billing_cycle = 'monthly' THEN s.amount * 1.75 * 1450
                WHEN s.billing_cycle = 'yearly' THEN (s.amount / 12) * 1.75 * 1450
                WHEN s.billing_cycle = 'quarterly' THEN (s.amount / 3) * 1.75 * 1450
                WHEN s.billing_cycle = 'weekly' THEN (s.amount * 4) * 1.75 * 1450
              END
            -- MANTENER ARS
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
          AND EXTRACT(MONTH FROM s.next_billing_date) = $2
          AND EXTRACT(YEAR FROM s.next_billing_date) = $3
        WHERE c.user_id IS NULL OR c.user_id = $1
        GROUP BY c.id, c.name, c.color
        HAVING COUNT(s.id) > 0
        ORDER BY monthly_total DESC`,
      [req.user!.userId, currentMonth, currentYear]
    )
    const userResult = await pool.query(`SELECT monthly_budget, currency FROM users WHERE id = $1`, [req.user!.userId])

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
    })
  } catch (error) {
    console.error("Get financial report error:", error)
    res.status(500).json({ error: "Error al generar reporte financiero" })
  }
}

export const getMonthlyEvolution = async (req: AuthRequest, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const monthlyEvolutionQuery = `
      SELECT
        EXTRACT(MONTH FROM next_billing_date) as month,
        COUNT(*) as subscription_count,
        COALESCE(SUM(CASE
          -- CONVERTIR USD A ARS CON IMPUESTOS INCLUIDOS
          WHEN currency = 'USD' THEN
            CASE
              WHEN billing_cycle = 'monthly' THEN amount * 1.75 * 1450
              WHEN billing_cycle = 'yearly' THEN (amount / 12) * 1.75 * 1450
              WHEN billing_cycle = 'quarterly' THEN (amount / 3) * 1.75 * 1450
              WHEN billing_cycle = 'weekly' THEN (amount * 4) * 1.75 * 1450
            END
          -- MANTENER ARS SIN CONVERSIÓN
          ELSE
            CASE
              WHEN billing_cycle = 'monthly' THEN amount
              WHEN billing_cycle = 'yearly' THEN amount / 12
              WHEN billing_cycle = 'quarterly' THEN amount / 3
              WHEN billing_cycle = 'weekly' THEN amount * 4
            END
        END), 0) as monthly_total
      FROM subscriptions
      WHERE user_id = $1
        AND status = 'active'
        AND EXTRACT(YEAR FROM next_billing_date) = $2
      GROUP BY EXTRACT(MONTH FROM next_billing_date)
      ORDER BY month ASC
    `;

    const result = await pool.query(monthlyEvolutionQuery, [req.user!.userId, year]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthData = result.rows.find(row => Number(row.month) === i + 1);
      return {
        month: i + 1,
        year: Number(year),
        subscription_count: monthData ? Number(monthData.subscription_count) : 0,
        monthly_total: monthData ? Math.round(Number(monthData.monthly_total)) : 0
      };
    });

    console.log('[BACKEND] Monthly evolution calculated in ARS:', monthlyData);

    res.json({ monthlyEvolution: monthlyData });
  } catch (error) {
    console.error("Get monthly evolution error:", error);
    res.status(500).json({ error: "Error al obtener evolución mensual" });
  }
};
