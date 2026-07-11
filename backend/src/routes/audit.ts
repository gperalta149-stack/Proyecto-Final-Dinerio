import { Router, type Response } from "express"
import { pool } from "../config/database.js"
import { authenticate } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = Router()
router.use(authenticate)

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, offset = 0 } = req.query
    const result = await pool.query(
      `SELECT a.*, u.email as user_email, u.first_name, u.last_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
        LIMIT $2 OFFSET $3`,
      [req.user!.userId, limit, offset],
    )
    res.json({ audit_logs: result.rows })
  } catch (error) {
    console.error("Get audit logs error:", error)
    res.status(500).json({ error: "Error al obtener registros de auditoría" })
  }
})

router.get("/entity/:entityType/:entityId", async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params
    const result = await pool.query(
      `SELECT a.*, u.email as user_email, u.first_name, u.last_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.entity_type = $1 AND a.entity_id = $2 AND a.user_id = $3
        ORDER BY a.created_at DESC`,
      [entityType, entityId, req.user!.userId],
    )
    res.json({ audit_logs: result.rows })
  } catch (error) {
    console.error("Get entity audit logs error:", error)
    res.status(500).json({ error: "Error al obtener registros" })
  }
})

export default router
