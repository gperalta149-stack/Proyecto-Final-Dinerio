import { NotificationGeneratorService } from "../services/notificationService.js"
import { DebtGeneratorService } from "../services/debtGeneratorService.js"

// Job que ejecuta en bloque las tareas programadas del sistema. Internamente
// se dispara con una programación temporal (node-cron / setInterval).
export class NotificationJob {
  // Orquesta la ejecución de todos los servicios en orden: genera recordatorios
  // de pago, alertas de presupuesto, limpia notificaciones viejas y crea deudas vencidas.
  static async runScheduledTasks(): Promise<void> {
    try {
      console.log("Ejecutando tareas programadas de notificaciones...")
      // Recordatorios de pago próximos a vencer / ya vencidos.
      await NotificationGeneratorService.generatePaymentReminders()
      //  Alertas por superar el presupuesto mensual del usuario.
      await NotificationGeneratorService.generateBudgetAlerts()
      //  Depuración: elimina notificaciones con más de 7 días.
      await NotificationGeneratorService.cleanupOldNotifications()
      //  Genera deudas a partir de suscripciones vencidas (sin duplicar).
      await DebtGeneratorService.generateDebtsFromOverdueSubscriptions()
      console.log("Tareas programadas completadas")
    } catch (error) {
      console.error("Error en tareas programadas:", error)
    }
  }
}
