import { Response } from "express"
import { validationResult } from "express-validator"
import { pool } from "../config/database.js"
import { createAuditLog } from "../middleware/auditLog.js"
import type { AuthRequest } from "../types/index.js"

// Lista de suscripciones. Soporta ?status=... (por defecto solo 'active')
export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query

  try {
    let query = `
      SELECT
        s.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1
    `
    const params: any[] = [req.user!.userId]

    if (status && status !== "all") {
      query += " AND s.status = $2"
      params.push(status as string)
    } else if (!status) {
      query += " AND s.status = 'active'"
    }

    query += " ORDER BY s.next_billing_date ASC"

    const result = await pool.query(query, params)

    res.json({ subscriptions: result.rows })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    res.status(500).json({ error: "Failed to fetch subscriptions" })
  }
}

export const getSubscriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
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
}

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name,
    description,
    amount,
    currency,
    billing_cycle,
    next_billing_date,
    category_id,
    payment_method,
    website_url,
    notes,
  } = req.body

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
    return
  }

    if (!category_id) {
      res.status(400).json({ error: "La categoría es requerida" })
      return
    }

    const duplicateName = await pool.query(
      `SELECT id FROM subscriptions WHERE name ILIKE $1 AND user_id = $2`,
      [name, req.user!.userId]
    )

    if (duplicateName.rows.length > 0) {
      res.status(400).json({ error: "Ya existe una suscripción con ese nombre" })
      return
    }

    try {
    const categoryCheck = await pool.query(
      `SELECT id FROM categories
        WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
      [category_id, req.user!.userId]
    )

    if (categoryCheck.rows.length === 0) {
      res.status(400).json({ error: "La categoría seleccionada no es válida" })
      return
    }

    const startDate = req.body.start_date || next_billing_date

    const result = await pool.query(
      `INSERT INTO subscriptions
        (user_id, name, description, amount, currency, billing_cycle, start_date, next_billing_date, category_id, payment_method, website_url, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user!.userId,
        name,
        description || "",
        amount,
        currency || "USD",
        billing_cycle,
        startDate,
        next_billing_date,
        category_id,
        payment_method,
        website_url,
        notes || "",
      ],
    )

    const created = result.rows[0]

    const completeSubscription = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1`,
      [created.id]
    )

    await createAuditLog(req, "CREATE", "subscription", created.id, { name, amount, billing_cycle })

    // Notificación automática de suscripción creada
    try {
      const { NotificationGeneratorService } = await import("../services/notificationService.js")
      await NotificationGeneratorService.createSubscriptionNotification(
        req.user!.userId,
        created.id,
        name,
        amount,
        currency || "USD",
        billing_cycle
      )
    } catch (notificationError) {
      console.error("Error creando notificación de suscripción:", notificationError)
    }

    // Si la fecha ya pasó, crear deuda pendiente automáticamente
    if (next_billing_date && new Date(next_billing_date) < new Date(new Date().toDateString())) {
      try {
        await pool.query(
          `INSERT INTO debts (user_id, subscription_id, category_id, name, amount, currency, due_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
          [req.user!.userId, created.id, category_id, name, amount, currency || "USD", next_billing_date]
        )
        console.log(`Deuda creada automáticamente para suscripción vencida: ${name}`)
      } catch (debtError) {
        console.error("Error creando deuda automática:", debtError)
      }
    }

    res.status(201).json({
      message: "Suscripción creada exitosamente",
      subscription: completeSubscription.rows[0],
    })
  } catch (error) {
    console.error("Create subscription error:", error)
    res.status(500).json({ error: "Error al crear suscripción: " + (error instanceof Error ? error.message : "Unknown error") })
  }
}

export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
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

  try {
    const checkResult = await pool.query(
      "SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2",
      [id, req.user!.userId]
    )

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: "Suscripción no encontrada" })
      return
    }

    if (category_id !== undefined && !category_id) {
      res.status(400).json({ error: "La categoría es requerida" })
      return
    }

    if (category_id && category_id !== checkResult.rows[0].category_id) {
      const categoryCheck = await pool.query(
        `SELECT id FROM categories
          WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
        [category_id, req.user!.userId]
      )

      if (categoryCheck.rows.length === 0) {
        res.status(400).json({ error: "La categoría seleccionada no es válida" })
        return
      }
    }

    if (name) {
      const duplicateName = await pool.query(
        `SELECT id FROM subscriptions WHERE name ILIKE $1 AND user_id = $2 AND id != $3`,
        [name, req.user!.userId, id]
      )

      if (duplicateName.rows.length > 0) {
        res.status(400).json({ error: "Ya existe una suscripción con ese nombre" })
        return
      }
    }

    await pool.query(
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
        amount !== undefined ? Number(amount) : undefined,
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

    const completeSubscription = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1`,
      [id]
    )

    await createAuditLog(req, "UPDATE", "subscription", id, req.body)

    res.json({
      message: "Suscripción actualizada exitosamente",
      subscription: completeSubscription.rows[0],
    })
  } catch (error) {
    console.error("Update subscription error:", error)
    res.status(500).json({ error: "Error al actualizar suscripción: " + (error instanceof Error ? error.message : "Unknown error") })
  }
}

export const deleteSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const subCheck = await pool.query(
      "SELECT status, next_billing_date, name FROM subscriptions WHERE id = $1 AND user_id = $2",
      [id, req.user!.userId]
    )

    if (subCheck.rows.length === 0) {
      res.status(404).json({ error: "Suscripción no encontrada" })
      return
    }

    const { status, next_billing_date, name } = subCheck.rows[0]
    const billingDate = new Date(next_billing_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (status === 'active' && billingDate >= today) {
      res.status(400).json({ error: "No se puede eliminar una suscripción activa con pagos pendientes. Cambiá el estado a pagada o esperá a que el ciclo finalice." })
      return
    }

    const pendingDebt = await pool.query(
      "SELECT COUNT(*)::int as cnt FROM debts WHERE subscription_id = $1 AND user_id = $2 AND status = 'pending'",
      [id, req.user!.userId]
    )

    if (pendingDebt.rows[0].cnt > 0) {
      res.status(400).json({ error: "No se puede eliminar la suscripción, primero debe pagar la deuda" })
      return
    }

    // Desvincular deudas pagadas para preservar historial
    await pool.query(
      "UPDATE debts SET subscription_id = NULL WHERE subscription_id = $1 AND user_id = $2 AND status = 'paid'",
      [id, req.user!.userId]
    )

    // Eliminar deudas pendientes (no debería haber, pero por seguridad)
    await pool.query("DELETE FROM debts WHERE subscription_id = $1 AND user_id = $2", [id, req.user!.userId])

    const result = await pool.query(
      "DELETE FROM subscriptions WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user!.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Suscripción no encontrada" })
      return
    }

    await createAuditLog(req, "DELETE", "subscription", id, { name })

    res.json({ message: "Suscripción eliminada permanentemente" })
  } catch (error) {
    console.error("Delete subscription error:", error)
    res.status(500).json({ error: "Error al eliminar suscripción" })
  }
}

export const getStatsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
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
}

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const statsQuery = `
      SELECT
        SUM(CASE
          WHEN billing_cycle = 'monthly' THEN amount
          WHEN billing_cycle = 'yearly' THEN amount / 12
          WHEN billing_cycle = 'quarterly' THEN amount / 3
          WHEN billing_cycle = 'weekly' THEN amount * 4
        END) as monthly_total,
        SUM(CASE
          WHEN billing_cycle = 'monthly' THEN amount * 12
          WHEN billing_cycle = 'yearly' THEN amount
          WHEN billing_cycle = 'quarterly' THEN amount * 4
          WHEN billing_cycle = 'weekly' THEN amount * 52
        END) as yearly_total,
        COUNT(*) as total_subscriptions
      FROM subscriptions
      WHERE user_id = $1 AND status = 'active'
    `

    const statsResult = await pool.query(statsQuery, [req.user!.userId])
    const categoryQuery = `
      SELECT
        c.name,
        c.color,
        SUM(CASE
          WHEN s.billing_cycle = 'monthly' THEN s.amount
          WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
          WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
          WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
        END) as monthly_cost
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1 AND s.status = 'active'
      GROUP BY c.name, c.color
      ORDER BY monthly_cost DESC
    `

    const categoryResult = await pool.query(categoryQuery, [req.user!.userId])
    const upcomingQuery = `
      SELECT s.*, c.name as category_name, c.color as category_color
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1
        AND s.status = 'active'
        AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY s.next_billing_date ASC
    `

    const upcomingResult = await pool.query(upcomingQuery, [req.user!.userId])
    const budgetResult = await pool.query("SELECT monthly_budget FROM users WHERE id = $1", [req.user!.userId])

    const debtResult = await pool.query(
      `SELECT
          COALESCE(SUM(amount), 0)::float AS total,
          COUNT(*)::int AS count
        FROM debts
        WHERE user_id = $1 AND status = 'pending'`,
      [req.user!.userId]
    )

    res.json({
      stats: {
        monthlyTotal: Number.parseFloat(statsResult.rows[0].monthly_total || 0),
        yearlyTotal: Number.parseFloat(statsResult.rows[0].yearly_total || 0),
        totalSubscriptions: Number.parseInt(statsResult.rows[0].total_subscriptions || 0),
        monthlyBudget: Number.parseFloat(budgetResult.rows[0].monthly_budget || 0),
        totalDebt: debtResult.rows[0].total,
        pendingDebtCount: debtResult.rows[0].count,
      },
      categoryBreakdown: categoryResult.rows,
      upcomingPayments: upcomingResult.rows,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ error: "Server error" })
  }
}
