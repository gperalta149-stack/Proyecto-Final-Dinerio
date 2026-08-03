import { pool } from "../config/database.js"
import { getExchangeRate } from "./exchangeRateService.js"

// Servicio que convierte suscripciones vencidas en deudas pendientes de pago.
export class DebtGeneratorService {

  // Método principal: recorre las suscripciones activas cuya próxima fecha de
  // cobro ya pasó (next_billing_date < hoy) y genera una deuda por cada período vencido.
  static async generateDebtsFromOverdueSubscriptions(): Promise<void> {
    console.log('💸 Generando deudas desde suscripciones vencidas...');
    try {
      // Se obtiene el tipo de cambio vigente para convertir montos en USD a ARS.
      const exchangeRate = await getExchangeRate();

      // Query de suscripciones vencidas: activas con fecha de cobro anterior a hoy.
      const overdue = await pool.query(
        `SELECT id, user_id, category_id, name, amount, currency, next_billing_date
          FROM subscriptions
          WHERE status = 'active' AND next_billing_date < CURRENT_DATE`
      );
      for (const sub of overdue.rows) {
        // Evita duplicar deudas: se verifica que no exista ya una deuda
        // para esa suscripción y ese mismo período (misma fecha de vencimiento).
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
        // Si la suscripción está en dólares, convierte a pesos usando el tipo de
        // cambio y redondea a 2 decimales para guardar el monto en ARS.
        const amountArs = sub.currency === 'USD'
          ? Math.round(amount * exchangeRate * 100) / 100
          : amount;

        try {
          // Inserta la deuda en estado 'pending' con su monto original y el monto en ARS.
          await pool.query(
            `INSERT INTO debts (user_id, subscription_id, category_id, name, amount, currency, due_date, status, amount_ars)
              VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)`,
            [sub.user_id, sub.id, sub.category_id, sub.name, amount, sub.currency, sub.next_billing_date, amountArs]
          );
          console.log(`  Deuda generada: ${sub.name} (venció ${sub.next_billing_date}) — ARS: $${amountArs}`);
        } catch (insertError: unknown) {
          const code = (insertError as { code?: string }).code;
          // Código 23505 = violación de unicidad (constraint único). Si el job corre
          // dos veces en paralelo, el segundo INSERT falla y se detecta para no duplicar deuda.
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
