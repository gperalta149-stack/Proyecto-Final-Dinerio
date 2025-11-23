import { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"


export const getSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

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
    const params = [req.user.userId]

    if (status) {
      query += " AND s.status = $2"
      params.push(status as string)
    } else {
      query += " AND s.status = 'active'"
    }

    query += " ORDER BY s.next_billing_date ASC"

    const result = await pool.query(query, params)
    
    console.log('[BACKEND] Suscripciones enviadas al frontend:', {
      count: result.rows.length,
      statusFilter: status || 'active (default)',
      sample: result.rows[0]
    })
    
    res.json({ subscriptions: result.rows })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Se crea nueva  suscripción
export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name,
    amount,
    currency,
    billing_cycle,
    next_billing_date,
    category_id,
    description,
    notes
  } = req.body

  console.log('🔴 [DEBUG] createSubscription llamado con datos:', req.body)

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  if (!category_id) {
    res.status(400).json({ error: "La categoría es requerida" })
    return
  }

  try {
    const categoryCheck = await pool.query(
      `SELECT id FROM categories
        WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
      [category_id, req.user.userId]
    )

    if (categoryCheck.rows.length === 0) {
      res.status(400).json({ error: "La categoría seleccionada no es válida" })
      return
    }

    const startDate = next_billing_date;

    console.log('🔄 [BACKEND CREATE] Creando suscripción:', {
      user_id: req.user.userId,
      name,
      amount,
      start_date: startDate,
      next_billing_date: next_billing_date
    })

    const result = await pool.query(
      `INSERT INTO subscriptions
        (user_id, name, amount, currency, billing_cycle, start_date, next_billing_date, category_id, description, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.user.userId,
        name,
        amount,
        currency,
        billing_cycle,
        startDate,
        next_billing_date,
        category_id,
        description || '',
        notes || ''
      ],
    )

    const completeSubscription = await pool.query(
      `SELECT
        s.*,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1`,
      [result.rows[0].id]
    )

    console.log('[BACKEND CREATE] Nueva suscripción creada:', completeSubscription.rows[0])

    // ✅ CREAR NOTIFICACIÓN AUTOMÁTICAMENTE - VERSIÓN SIMPLE
    try {
      console.log('🟡 [DEBUG] Intentando crear notificación para suscripción...')
      
      const notificationResult = await pool.query(
        `INSERT INTO notifications 
          (user_id, subscription_id, type, title, message, is_read, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [
          req.user.userId,
          result.rows[0].id,
          'subscription_created',
          '📱 Nueva suscripción creada',
          `Has agregado "${name}" por ${currency} ${amount} (${billing_cycle})`,
          false
        ]
      )
      
      console.log('🟢 [DEBUG] Notificación creada exitosamente:', notificationResult.rows[0])
    } catch (notificationError) {
      console.error('🔴 [DEBUG] Error creando notificación:', notificationError)
    }
    
    res.status(201).json({
      message: "Subscription created successfully",
      subscription: completeSubscription.rows[0],
    })
  } catch (error) {
    console.error("[BACKEND CREATE] Error:", error)
    res.status(500).json({ error: "Server error: " + (error instanceof Error ? error.message : 'Unknown error') })
  }
}

export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  const { id } = req.params
  const {
    name, amount, currency, billing_cycle,
    next_billing_date, category_id, description, notes, status
  } = req.body

  try {
    console.log('🔄 [BACKEND UPDATE] Iniciando actualización:', {
      id,
      body: req.body,
      user: req.user.userId
    })

    if (category_id !== undefined && !category_id) {
      console.log('[BACKEND UPDATE] Error: category_id vacío')
      res.status(400).json({ error: "La categoría es requerida" })
      return
    }

    const checkResult = await pool.query(
      "SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2",
      [id, req.user.userId]
    )

    if (checkResult.rows.length === 0) {
      console.log('[BACKEND UPDATE] Suscripción no encontrada:', id)
      res.status(404).json({ error: "Subscription not found" })
      return
    }

    console.log('[BACKEND UPDATE] Suscripción actual:', checkResult.rows[0])

    if (category_id && category_id !== checkResult.rows[0].category_id) {
      const categoryCheck = await pool.query(
        `SELECT id FROM categories
          WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)`,
        [category_id, req.user.userId]
      )

      if (categoryCheck.rows.length === 0) {
        console.log('[BACKEND UPDATE] Categoría no válida:', category_id)
        res.status(400).json({ error: "La categoría seleccionada no es válida" })
        return
      }
    }

    const amountValue = amount !== undefined ? Number(amount) : checkResult.rows[0].amount
    
    console.log('[BACKEND UPDATE] Procesando monto:', {
      amountRecibido: amount,
      amountConvertido: amountValue,
      tipo: typeof amountValue
    })

    const result = await pool.query(
      `UPDATE subscriptions
        SET name = $1,
            amount = $2,
            currency = $3,
            billing_cycle = $4,
            next_billing_date = $5,
            category_id = $6,
            description = $7,
            notes = $8,
            status = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        name !== undefined ? name : checkResult.rows[0].name,
        amountValue,
        currency !== undefined ? currency : checkResult.rows[0].currency,
        billing_cycle !== undefined ? billing_cycle : checkResult.rows[0].billing_cycle,
        next_billing_date !== undefined ? next_billing_date : checkResult.rows[0].next_billing_date,
        category_id !== undefined ? category_id : checkResult.rows[0].category_id,
        description !== undefined ? description : checkResult.rows[0].description,
        notes !== undefined ? notes : checkResult.rows[0].notes,
        status !== undefined ? status : checkResult.rows[0].status,
        id,
        req.user.userId
      ]
    )

    console.log('[BACKEND UPDATE] Suscripción actualizada en BD:', result.rows[0])

    const completeSubscription = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1`,
      [id]
    )

    console.log('[BACKEND UPDATE] Suscripción con categoría:', completeSubscription.rows[0])

    res.json({
      message: "Subscription updated successfully",
      subscription: completeSubscription.rows[0],
    })
  } catch (error) {
    console.error("[BACKEND UPDATE] Error completo:", error)
    
    if (error instanceof Error) {
      console.error("[BACKEND UPDATE] Stack trace:", error.stack)
      console.error("[BACKEND UPDATE] Mensaje:", error.message)
    }
    
    res.status(500).json({
      error: "Server error: " + (error instanceof Error ? error.message : 'Unknown error')
    })
  }
}

export const deleteSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  try {
    const result = await pool.query(
      "UPDATE subscriptions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      ["cancelled", id, req.user.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Subscription not found" })
      return
    }

    const completeSubscription = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1`,
      [id]
    )

    res.json({
      message: "Subscription cancelled successfully",
      subscription: completeSubscription.rows[0]
    })
  } catch (error) {
    console.error("Delete subscription error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

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

    const statsResult = await pool.query(statsQuery, [req.user.userId])
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

    const categoryResult = await pool.query(categoryQuery, [req.user.userId])
    const upcomingQuery = `
      SELECT s.*, c.name as category_name, c.color as category_color
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1
        AND s.status = 'active'
        AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
      ORDER BY s.next_billing_date ASC
    `

    const upcomingResult = await pool.query(upcomingQuery, [req.user.userId])
    const budgetResult = await pool.query("SELECT monthly_budget FROM users WHERE id = $1", [req.user.userId])
    res.json({
      stats: {
        monthlyTotal: Number.parseFloat(statsResult.rows[0].monthly_total || 0),
        yearlyTotal: Number.parseFloat(statsResult.rows[0].yearly_total || 0),
        totalSubscriptions: Number.parseInt(statsResult.rows[0].total_subscriptions || 0),
        monthlyBudget: Number.parseFloat(budgetResult.rows[0].monthly_budget || 0),
      },
      categoryBreakdown: categoryResult.rows,
      upcomingPayments: upcomingResult.rows,
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ error: "Server error" })
  }
}