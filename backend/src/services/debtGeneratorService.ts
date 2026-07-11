import { pool } from "../config/database.js"

export class DebtGeneratorService {
  /**
   * Recorre las suscripciones activas cuyo next_billing_date ya pasó y,
   * si todavía no existe una deuda pendiente registrada para ese vencimiento,
   * crea una fila en `debts`. Corre junto al job de notificaciones.
   */
  static async generateDebtsFromOverdueSubscriptions(): Promise<void> {
    console.log('💸 Generando deudas desde suscripciones vencidas...');
    try {
      const overdue = await pool.query(
        `SELECT id, user_id, category_id, name, amount, currency, next_billing_date
         FROM subscriptions
         WHERE status = 'active' AND next_billing_date < CURRENT_DATE`
      );
      for (const sub of overdue.rows) {
        const exists = await pool.query(
          `SELECT id FROM debts
           WHERE subscription_id = $1 AND due_date = $2`,
          [sub.id, sub.next_billing_date]
        );
        if (exists.rows.length > 0) continue;
        await pool.query(
          `INSERT INTO debts (user_id, subscription_id, category_id, name, amount, currency, due_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
          [sub.user_id, sub.id, sub.category_id, sub.name, sub.amount, sub.currency, sub.next_billing_date]
        );
        console.log(`  Deuda generada: ${sub.name} (venció ${sub.next_billing_date})`);
      }
    } catch (error) {
      console.error('Error generando deudas:', error);
    }
  }
}
