import { pool } from "../config/database.js"

export class DebtGeneratorService {

  static async generateDebtsFromOverdueSubscriptions(): Promise<void> {
    console.log('💸 Generando deudas desde suscripciones vencidas...');
    try {
      const overdue = await pool.query(
        `SELECT id, user_id, category_id, name, amount, currency, next_billing_date
          FROM subscriptions
          WHERE status = 'active' AND next_billing_date < CURRENT_DATE`
      );
      for (const sub of overdue.rows) {
        const existingDebt = await pool.query(
          `SELECT id FROM debts
            WHERE subscription_id = $1 AND status = 'pending'`,
          [sub.id]
        );
        if (existingDebt.rows.length > 0) {
          console.log(`  ${sub.name}: ya tiene una deuda pendiente, se saltea`);
          continue;
        }
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
