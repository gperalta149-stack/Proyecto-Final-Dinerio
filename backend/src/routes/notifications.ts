import { Router, type Response } from "express"
import { pool } from "../config/database.js"
import { authenticate } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = Router()

router.use(authenticate)

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, s.name as subscription_name
        FROM notifications n
        LEFT JOIN subscriptions s ON n.subscription_id = s.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 50`,
      [req.user!.userId],
    )

    res.json({ notifications: result.rows })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ error: "Error al obtener notificaciones" })
  }
})

router.get("/unread/count", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND is_read = false`,
      [req.user!.userId],
    )

    res.json({ count: Number.parseInt(result.rows[0].count) })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({ error: "Error al obtener contador" })
  }
})

router.put("/:id/read", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user!.userId],
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Notificación no encontrada" })
      return
    }

    res.json({ message: "Notificación marcada como leída", notification: result.rows[0] })
  } catch (error) {
    console.error("Mark as read error:", error)
    res.status(500).json({ error: "Error al marcar notificación" })
  }
})

router.put("/read-all", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query(
      `UPDATE notifications
        SET is_read = true
        WHERE user_id = $1 AND is_read = false`,
      [req.user!.userId],
    )

    res.json({ message: "Todas las notificaciones marcadas como leídas" })
  } catch (error) {
    console.error("Mark all as read error:", error)
    res.status(500).json({ error: "Error al marcar notificaciones" })
  }
})

router.delete("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const result = await pool.query("DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id", [
      id,
      req.user!.userId,
    ])

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Notificación no encontrada" })
      return
    }

    res.json({ message: "Notificación eliminada" })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({ error: "Error al eliminar notificación" })
  }
})

router.post("/test-generate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({ error: "Solo disponible en desarrollo" })
      return
    }

    const { NotificationGeneratorService } = await import("../services/notificationService.js")  // ✅ CAMBIADO
    
    await NotificationGeneratorService.generatePaymentReminders()
    await NotificationGeneratorService.generateBudgetAlerts()
    
    const result = await pool.query(
      `SELECT n.*, s.name as subscription_name
        FROM notifications n
        LEFT JOIN subscriptions s ON n.subscription_id = s.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT 10`,
      [req.user!.userId]
    )
    
    res.json({
      message: "Notificaciones de prueba generadas",
      notifications: result.rows
    })
  } catch (error) {
    console.error("Test generation error:", error)
    res.status(500).json({ error: "Error generando notificaciones de prueba" })
  }
})

export default router