import { pool } from "../config/database.js"
import { getExchangeRate } from "./exchangeRateService.js"

export class DebtGeneratorService {

  static async generateDebtsFromOverdueSubscriptions(): Promise<void> {
    console.log('💸 Generando deudas desde suscripciones vencidas...');
    try {
      const exchangeRate = await getExchangeRate();

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
        if (exists.rows.length > 0) {
          console.log(`  ${sub.name}: ya existe deuda para este período, se saltea`);
          continue;
        }

        const amount = Number(sub.amount);
        const amountArs = sub.currency === 'USD'
          ? Math.round(amount * exchangeRate * 100) / 100
          : amount;

        try {
          await pool.query(
            `INSERT INTO debts (user_id, subscription_id, category_id, name, amount, currency, due_date, status, amount_ars)
              VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
            [sub.user_id, sub.id, sub.category_id, sub.name, amount, sub.currency, sub.next_billing_date, amountArs]
          );
          console.log(`  Deuda generada: ${sub.name} (venció ${sub.next_billing_date}) — ARS: $${amountArs}`);
        } catch (insertError: unknown) {
          const code = (insertError as { code?: string }).code;
          if (code === '23505') {
            console.log(`  ${sub.name}: deuda ya generada por ejecución concurrente, se saltea`);
          } else {
            throw insertError;
          }
        }
      }
    } catch (error) {
      console.error('Error generando deudas:', error);
    }
  }
}
