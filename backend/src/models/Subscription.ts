import { pool } from "../config/database.js"

// NOTA: este modelo no vino en el código original que se pasó para el refactor.
// Se infirió a partir de cómo lo consume calendarController.ts (findByQuery / getUpcomingSubscriptions)
// para no romper el server. Si ya existe una versión real en el repo, reemplazar este archivo por esa.
export class SubscriptionModel {
  static async findByQuery(query: string, params: any[] = []) {
    const result = await pool.query(query, params)
    return result.rows
  }

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
