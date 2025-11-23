import { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"


export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  try {
    const result = await pool.query(
      `SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50`,
      [req.user.userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ error: "Error al obtener notificaciones" })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  const { id } = req.params

  try {
    const result = await pool.query(
      `UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Notificación no encontrada" })
      return
    }

    res.json({ message: "Notificación marcada como leída", notification: result.rows[0] })
  } catch (error) {
    console.error("Mark as read error:", error)
    res.status(500).json({ error: "Error al marcar notificación como leída" })
  }
}

export const createNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" })
    return
  }

  const { type, title, message, subscription_id } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO notifications
        (user_id, subscription_id, type, title, message)
        VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, subscription_id, type, title, message]
    )

    res.status(201).json({
      message: "Notificación creada exitosamente",
      notification: result.rows[0]
    })
  } catch (error) {
    console.error("Create notification error:", error)
    res.status(500).json({ error: "Error al crear notificación" })
  }
}