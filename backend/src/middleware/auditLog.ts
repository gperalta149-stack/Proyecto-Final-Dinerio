import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

export const createAuditLog = async (
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>,
) => {
  try {
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.user!.userId, action, entityType, entityId, JSON.stringify(details), ipAddress],
    )
  } catch (error) {
    console.error("Audit log error:", error)
  }
}
