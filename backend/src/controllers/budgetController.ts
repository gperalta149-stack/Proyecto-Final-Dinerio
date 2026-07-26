import type { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

const BUDGET_COLUMNS = `
  id, user_id, year, month, budget_amount, alert_threshold, created_at, updated_at
`

export const getBudgetForMonth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)
    const result = await pool.query(
      `SELECT ${BUDGET_COLUMNS} FROM monthly_budgets WHERE user_id = $1 AND year = $2 AND month = $3`,
      [req.user!.userId, year, month]
    )
    res.json({ budget: result.rows[0] || null })
  } catch (error) {
    console.error("Get budget error:", error)
    res.status(500).json({ error: "Error al obtener presupuesto" })
  }
}

export const upsertBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)
    const { budget_amount, alert_threshold } = req.body
    const result = await pool.query(
      `INSERT INTO monthly_budgets (user_id, year, month, budget_amount, alert_threshold)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, year, month)
       DO UPDATE SET budget_amount = EXCLUDED.budget_amount,
                     alert_threshold = EXCLUDED.alert_threshold,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING ${BUDGET_COLUMNS}`,
      [req.user!.userId, year, month, budget_amount || 0, alert_threshold ?? 80]
    )
    res.json({ budget: result.rows[0] })
  } catch (error) {
    console.error("Upsert budget error:", error)
    res.status(500).json({ error: "Error al guardar presupuesto" })
  }
}

export const deleteBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = Number.parseInt(req.params.year)
    const month = Number.parseInt(req.params.month)
    await pool.query(
      `DELETE FROM monthly_budgets WHERE user_id = $1 AND year = $2 AND month = $3`,
      [req.user!.userId, year, month]
    )
    res.json({ message: "Presupuesto eliminado" })
  } catch (error) {
    console.error("Delete budget error:", error)
    res.status(500).json({ error: "Error al eliminar presupuesto" })
  }
}
