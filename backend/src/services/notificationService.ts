import { pool } from "../config/database.js"

export class NotificationGeneratorService {
  static async generatePaymentReminders(): Promise<void> {
    try {
      console.log("Generando recordatorios de pago...")
      
      const upcomingSubscriptions = await pool.query(
        `SELECT
          s.id, s.user_id, s.name, s.amount, s.currency, s.next_billing_date,
          u.notifications_enabled
          FROM subscriptions s
          JOIN users u ON s.user_id = u.id
          WHERE s.status = 'active'
            AND s.next_billing_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
            AND u.notifications_enabled = true
          ORDER BY s.next_billing_date ASC`
      )

      console.log(`Suscripciones próximas encontradas: ${upcomingSubscriptions.rows.length}`)

      for (const subscription of upcomingSubscriptions.rows) {
        const existingNotification = await pool.query(
          `SELECT id FROM notifications
            WHERE user_id = $1 AND subscription_id = $2
            AND DATE(created_at) = CURRENT_DATE
            AND type = 'payment_reminder'`,
          [subscription.user_id, subscription.id]
        )

        if (existingNotification.rows.length === 0) {
          const daysUntilDue = Math.ceil(
            (new Date(subscription.next_billing_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )

          let title = ""
          let message = ""

          if (daysUntilDue === 0) {
            title = "Pago vence hoy"
            message = `Tu suscripción "${subscription.name}" vence hoy. Monto: ${subscription.currency} ${subscription.amount}`
          } else if (daysUntilDue === 1) {
            title = "Pago vence mañana"
            message = `Tu suscripción "${subscription.name}" vence mañana. Monto: ${subscription.currency} ${subscription.amount}`
          } else {
            title = "Pago próximo"
            message = `Tu suscripción "${subscription.name}" vence en ${daysUntilDue} días. Monto: ${subscription.currency} ${subscription.amount}`
          }

          await pool.query(
            `INSERT INTO notifications (user_id, subscription_id, type, title, message)
              VALUES ($1, $2, $3, $4, $5)`,
            [
              subscription.user_id,
              subscription.id,
              'payment_reminder',
              title,
              message
            ]
          )

          console.log(`Notificación creada: ${title} - ${subscription.name}`)
        }
      }

      console.log("Generación de recordatorios completada")
    } catch (error) {
      console.error("Error generando recordatorios:", error)
    }
  }

  static async generateBudgetAlerts(): Promise<void> {
    try {
      console.log("Verificando alertas de presupuesto...")
      
      const usersExceedingBudget = await pool.query(
        `SELECT
          u.id as user_id,
          u.monthly_budget,
          u.currency,
          COALESCE(SUM(
            CASE
              WHEN s.billing_cycle = 'monthly' THEN s.amount
              WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
              WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
              WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
              ELSE s.amount
            END
          ), 0) as monthly_total
          FROM users u
          LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
          WHERE u.monthly_budget > 0
          GROUP BY u.id, u.monthly_budget, u.currency
          HAVING COALESCE(SUM(
            CASE
              WHEN s.billing_cycle = 'monthly' THEN s.amount
              WHEN s.billing_cycle = 'yearly' THEN s.amount / 12
              WHEN s.billing_cycle = 'quarterly' THEN s.amount / 3
              WHEN s.billing_cycle = 'weekly' THEN s.amount * 4
              ELSE s.amount
            END
          ), 0) > u.monthly_budget`
      )

      for (const user of usersExceedingBudget.rows) {

        const monthlyTotal = Number(user.monthly_total);
        const monthlyBudget = Number(user.monthly_budget);
        
        const usagePercentage = Math.round((monthlyTotal / monthlyBudget) * 100)
        
        const existingAlert = await pool.query(
          `SELECT id FROM notifications
            WHERE user_id = $1 AND type = 'budget_alert'
            AND DATE(created_at) = CURRENT_DATE`,
          [user.user_id]
        )

        if (existingAlert.rows.length === 0) {
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message)
              VALUES ($1, $2, $3, $4)`,
            [
              user.user_id,
              'budget_alert',
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

  // ✅ MÉTODO NUEVO PARA CREAR NOTIFICACIONES AL CREAR SUSCRIPCIONES
  static async createSubscriptionNotification(
    userId: string, 
    subscriptionId: string, 
    subscriptionName: string, 
    amount: number, 
    currency: string, 
    billingCycle: string
  ): Promise<void> {
    try {
      console.log(`📱 Creando notificación para nueva suscripción: ${subscriptionName}`)
      
      const message = `Has agregado "${subscriptionName}" por ${currency} ${amount} (${billingCycle})`
      
      await pool.query(
        `INSERT INTO notifications (user_id, subscription_id, type, title, message, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          userId,
          subscriptionId,
          'subscription_created',
          '📱 Nueva suscripción creada',
          message
        ]
      )

      console.log(`✅ Notificación creada exitosamente para: ${subscriptionName}`)
    } catch (error) {
      console.error("❌ Error creando notificación de suscripción:", error)
      throw error
    }
  }
}