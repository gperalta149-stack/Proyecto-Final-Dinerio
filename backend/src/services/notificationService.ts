import { pool } from "../config/database.js"

// Servicio que genera notificaciones a partir de eventos del sistema
// (recordatorios de pago, alertas de presupuesto, limpieza y avisos de suscripción).
export class NotificationGeneratorService {
  // Genera recordatorios de pago para suscripciones próximas a vencer
  // (dentro de los próximos 3 días) y para las ya vencidas.
  static async generatePaymentReminders(): Promise<void> {
    try {
      console.log("Generando recordatorios de pago...");

      // Trae suscripciones activas con vencimiento en hasta 3 días,
      // de usuarios que tienen habilitadas las notificaciones.
      const activeSubscriptions = await pool.query(
        `SELECT s.id, s.user_id, s.name, s.amount, s.currency, s.next_billing_date,
                u.notifications_enabled
          FROM subscriptions s
          JOIN users u ON s.user_id = u.id
          WHERE s.status = 'active'
            AND s.next_billing_date <= CURRENT_DATE + INTERVAL '3 days'
            AND u.notifications_enabled = true
          ORDER BY s.next_billing_date ASC`
      );

      console.log(`Suscripciones a procesar: ${activeSubscriptions.rows.length}`);

      for (const sub of activeSubscriptions.rows) {
        // Calcula cuántos días faltan para vencer (negativo si ya está vencida),
        // usando el inicio del día para comparar fechas completas.
        const daysUntilDue = Math.ceil(
          (new Date(sub.next_billing_date).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilDue >= 0) {
          // Rama de pago por vencer: primero chequea que hoy no exista ya una
          // notificación del tipo 'payment_due' para esa suscripción (no duplicar).
          const existing = await pool.query(
            `SELECT id FROM notifications
              WHERE user_id = $1 AND subscription_id = $2
                AND type = 'payment_due'
                AND DATE(created_at) = CURRENT_DATE`,
            [sub.user_id, sub.id]
          );
          if (existing.rows.length > 0) continue;

          let title: string;
          let message: string;

          // Según la cantidad de días, el recordatorio cambia el texto:
          // hoy, mañana o en N días. Caso borde: '0' significa que vence justo hoy.
          if (daysUntilDue === 0) {
            title = "Pago vence hoy";
            message = `Tu suscripción "${sub.name}" vence hoy. Monto: ${sub.currency} ${sub.amount}`;
          } else if (daysUntilDue === 1) {
            title = "Pago vence mañana";
            message = `Tu suscripción "${sub.name}" vence mañana. Monto: ${sub.currency} ${sub.amount}`;
          } else {
            title = "Pago próximo";
            message = `Tu suscripción "${sub.name}" vence en ${daysUntilDue} días. Monto: ${sub.currency} ${sub.amount}`;
          }

          await pool.query(
            `INSERT INTO notifications (user_id, subscription_id, type, title, message)
              VALUES ($1, $2, $3, $4, $5)`,
            [sub.user_id, sub.id, 'payment_due', title, message]
          );
          console.log(`Notificación creada: ${title} - ${sub.name}`);
        } else {
          // Rama de pago ya vencido: daysUntilDue negativo, se toma el valor
          // absoluto para los días de atraso y se busca/no-duplica con tipo 'payment_overdue'.
          const daysOverdue = Math.abs(daysUntilDue);

          const existing = await pool.query(
            `SELECT id FROM notifications
              WHERE user_id = $1 AND subscription_id = $2
                AND type = 'payment_overdue'
                AND DATE(created_at) = CURRENT_DATE`,
            [sub.user_id, sub.id]
          );
          if (existing.rows.length > 0) continue;

          const title = "Pago vencido";
          const message = `Tu suscripción "${sub.name}" venció hace ${daysOverdue} día${daysOverdue !== 1 ? 's' : ''}. Monto: ${sub.currency} ${sub.amount}`;

          await pool.query(
            `INSERT INTO notifications (user_id, subscription_id, type, title, message)
              VALUES ($1, $2, $3, $4, $5)`,
            [sub.user_id, sub.id, 'payment_overdue', title, message]
          );
          console.log(`Notificación creada: ${title} - ${sub.name} (${daysOverdue} día${daysOverdue !== 1 ? 's' : ''})`);
        }
      }

      console.log("Generación de recordatorios completada");
    } catch (error) {
      console.error("Error generando recordatorios:", error);
    }
  }

  // Genera alertas cuando el gasto mensual de un usuario supera su presupuesto
  // del mes (compara el total de suscripciones activas contra el monto del budget).
  static async generateBudgetAlerts(): Promise<void> {
    try {
      console.log("Verificando alertas de presupuesto...")

      // Se toma el mes/año actuales para evaluar el presupuesto del período vigente.
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth() + 1

      // Query de usuarios que exceden su presupuesto: suma las suscripciones activas
      // convirtiendo cada ciclo a su equivalente mensual (la misma lógica de BillingCycleService)
      // y filtra con HAVING los que superan el monto presupuestado.
      const usersExceedingBudget = await pool.query(
        `SELECT
          mb.user_id,
          mb.budget_amount as monthly_budget,
          COALESCE(u.currency, 'ARS') as currency,
          COALESCE(SUM(
            CASE
              WHEN s.billing_cycle = 'monthly' THEN s.amount
              WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
              WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
              WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
              ELSE s.amount
            END
          ), 0) as monthly_total
          FROM monthly_budgets mb
          JOIN users u ON mb.user_id = u.id
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          WHERE mb.year = $1 AND mb.month = $2 AND mb.budget_amount > 0
          GROUP BY mb.user_id, mb.budget_amount, u.currency
          HAVING COALESCE(SUM(
            CASE
              WHEN s.billing_cycle = 'monthly' THEN s.amount
              WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
              WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
              WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
              ELSE s.amount
            END
          ), 0) > mb.budget_amount`,
        [currentYear, currentMonth]
      )

      for (const user of usersExceedingBudget.rows) {

        const monthlyTotal = Number(user.monthly_total);
        const monthlyBudget = Number(user.monthly_budget);

        // Calcula el porcentaje del presupuesto usado para mostrarlo en la alerta.
        const usagePercentage = Math.round((monthlyTotal / monthlyBudget) * 100)

        // Evita duplicar: si ya existe una alerta de presupuesto hoy, se saltea.
        const existingAlert = await pool.query(
          `SELECT id FROM notifications
            WHERE user_id = $1 AND type = 'budget_alert'
            AND DATE(created_at) = CURRENT_DATE`,
          [user.user_id]
        )

        if (existingAlert.rows.length === 0) {
          // Crea la notificación de "presupuesto excedido" con total y porcentaje.
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
              VALUES ($1, $2, $3, $4)`,
            [
              user.user_id,
              'budget_exceeded',
              'Presupuesto excedido',
              `Has excedido tu presupuesto mensual. Gastos: ${user.currency} ${monthlyTotal.toFixed(2)} (${usagePercentage}% de ${user.currency} ${monthlyBudget.toFixed(2)})`
            ]
          )

          console.log(`Alerta de presupuesto creada para usuario ${user.user_id}`)
        }
      }

      console.log("Verificación de presupuesto completada")
    } catch (error) {
      console.error("Error verificando presupuesto:", error)
    }
  }

  // Método para crear notificaciones al crear suscripciones
  // Elimina notificaciones con más de 7 días de antigüedad para mantener
  // la tabla acotada y no acumular historial innecesario.
  static async cleanupOldNotifications(): Promise<void> {
    try {
      const result = await pool.query(
        `DELETE FROM notifications WHERE created_at < CURRENT_DATE - INTERVAL '7 days'`
      )
      if (result.rowCount !== null && result.rowCount > 0) {
        console.log(`Notificaciones antiguas eliminadas: ${result.rowCount}`)
      }
    } catch (error) {
      console.error("Error limpiando notificaciones antiguas:", error)
    }
  }

  // Notificación que se genera al crear una nueva suscripción (evento de alta),
  // mostrando el nombre y el monto con su descriptor de periodicidad.
  static async createSubscriptionNotification(
    userId: string,
    subscriptionId: string,
    subscriptionName: string,
    amount: number,
    currency: string,
    billingCycle: string
  ): Promise<void> {
    try {
      console.log(`Creando notificación para nueva suscripción: ${subscriptionName}`)

      // Traduce el ciclo a su etiqueta en español para el mensaje.
      const cycleLabel = billingCycle === "monthly" ? "/mes" : billingCycle === "yearly" ? "/año" : billingCycle === "quarterly" ? "/trimestre" : billingCycle === "weekly" ? "/semana" : ""
      const message = `Has agregado "${subscriptionName}" por ${currency} ${amount}${cycleLabel}`

      // Inserta la notificación con tipo 'subscription_created' y marca el momento exacto.
      await pool.query(
        `INSERT INTO notifications (user_id, subscription_id, type, title, message, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          userId,
          subscriptionId,
          'subscription_created',
          'Nueva suscripción creada',
          message
        ]
      )

      console.log(`Notificación creada exitosamente para: ${subscriptionName}`)
    } catch (error) {
      console.error("Error creando notificación de suscripción:", error)
      throw error
    }
  }
}
