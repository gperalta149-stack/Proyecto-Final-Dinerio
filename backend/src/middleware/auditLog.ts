import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

// Registro de auditoría: guarda en la tabla audit_logs qué usuario, con qué acción y sobre qué entidad operó.
// Captura la IP de la solicitud y detalles extra en JSON. Si falla el registro, no rompe la petición principal.
export const createAuditLog = async (
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
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
