import { Router, type Response } from "express"
import { body, validationResult } from "express-validator"
import { pool } from "../config/database.js"
import { authenticate } from "../middleware/auth.js"
import { createAuditLog } from "../middleware/auditLog.js"
import type { AuthRequest } from "../types/index.js"

const router = Router()

router.use(authenticate)

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = $1
        ORDER BY s.next_billing_date ASC`,
      [req.user!.userId],
    )

    res.json({ subscriptions: result.rows })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    res.status(500).json({ error: "Failed to fetch subscriptions" })
  }
})

router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1 AND s.user_id = $2`,
      [id, req.user!.userId],
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Subscription not found" })
      return
    }

    res.json({ subscription: result.rows[0] })
  } catch (error) {
    console.error("Get subscription error:", error)
    res.status(500).json({ error: "Failed to fetch subscription" })
  }
})

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("billing_cycle").isIn(["monthly", "yearly", "weekly", "quarterly"]).withMessage("Invalid billing cycle"),
    body("start_date").isISO8601().withMessage("Valid start date is required"),
    body("next_billing_date").isISO8601().withMessage("Valid next billing date is required"),
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const {
        name,
        description,
        amount,
        currency = "USD",
        billing_cycle,
        start_date,
        next_billing_date,
        category_id,
        payment_method,
        website_url,
        notes,
      } = req.body

      const result = await pool.query(
        `INSERT INTO subscriptions
          (user_id, name, description, amount, currency, billing_cycle, start_date, next_billing_date, category_id, payment_method, website_url, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          req.user!.userId,
          name,
          description,
          amount,
          currency,
          billing_cycle,
          start_date,
          next_billing_date,
          category_id,
          payment_method,
          website_url,
          notes,
        ],
      )

      await createAuditLog(req, "CREATE", "subscription", result.rows[0].id, { name, amount, billing_cycle })

      res.status(201).json({
        message: "Suscripción creada exitosamente",
        subscription: result.rows[0],
      })
    } catch (error) {
      console.error("Create subscription error:", error)
      res.status(500).json({ error: "Error al crear suscripción" })
    }
  },
)

router.put("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      amount,
      currency,
      billing_cycle,
      start_date,
      next_billing_date,
      category_id,
      payment_method,
      website_url,
      notes,
      status,
    } = req.body

    const result = await pool.query(
      `UPDATE subscriptions
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            amount = COALESCE($3, amount),
            currency = COALESCE($4, currency),
            billing_cycle = COALESCE($5, billing_cycle),
            start_date = COALESCE($6, start_date),
            next_billing_date = COALESCE($7, next_billing_date),
            category_id = COALESCE($8, category_id),
            payment_method = COALESCE($9, payment_method),
            website_url = COALESCE($10, website_url),
            notes = COALESCE($11, notes),
            status = COALESCE($12, status),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [
        name,
        description,
        amount,
        currency,
        billing_cycle,
        start_date,
        next_billing_date,
        category_id,
        payment_method,
        website_url,
        notes,
        status,
        id,
        req.user!.userId,
      ],
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Suscripción no encontrada" })
      return
    }

    await createAuditLog(req, "UPDATE", "subscription", id, req.body)

    res.json({
      message: "Suscripción actualizada exitosamente",
      subscription: result.rows[0],
    })
  } catch (error) {
    console.error("Update subscription error:", error)
    res.status(500).json({ error: "Error al actualizar suscripción" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query("DELETE FROM subscriptions WHERE id = $1 AND user_id = $2 RETURNING id, name", [
      id,
      req.user!.userId,
    ])

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Suscripción no encontrada" })
      return
    }

    await createAuditLog(req, "DELETE", "subscription", id, { name: result.rows[0].name })

    res.json({ message: "Suscripción eliminada exitosamente" })
  } catch (error) {
    console.error("Delete subscription error:", error)
    res.status(500).json({ error: "Error al eliminar suscripción" })
  }
})

router.get("/stats/summary", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT
          COUNT(*) as total_subscriptions,
          SUM(CASE WHEN billing_cycle = 'monthly' THEN amount ELSE 0 END) as monthly_total,
          SUM(CASE WHEN billing_cycle = 'yearly' THEN amount / 12 ELSE 0 END) as yearly_monthly_avg,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count
        FROM subscriptions
        WHERE user_id = $1`,
      [req.user!.userId],
    )

    res.json({ stats: result.rows[0] })
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

export default router