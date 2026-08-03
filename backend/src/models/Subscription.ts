import { pool } from "../config/database.js"

// Modelo de datos de suscripciones: encapsula el acceso a la base de datos. findByQuery es un helper genérico
// que ejecuta cualquier consulta con parámetros y devuelve las filas.
export class SubscriptionModel {
  static async findByQuery(query: string, params: unknown[] = []) {
    const result = await pool.query(query, params)
    return result.rows
  }

// Consulta clave: obtiene las suscripciones activas del usuario cuya próxima fecha de cobro cae dentro de N días,
// uniendo la categoría para mostrar su nombre/color. Se usa para la generación de deudas y recordatorios.
  static async getUpcomingSubscriptions(userId: string, days: number = 30) {
    const result = await pool.query(
      `SELECT s.*, c.name as category_name, c.color as category_color
        FROM subscriptions s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.user_id = $1
          AND s.status = 'active'
          AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + ($2 || ' days')::interval
        ORDER BY s.next_billing_date ASC`,
      [userId, days]
    )
    return result.rows
  }
}
