import { NotificationGeneratorService } from "../services/notificationService.js"
import { DebtGeneratorService } from "../services/debtGeneratorService.js"
export class NotificationJob {
  static async runScheduledTasks(): Promise<void> {
    try {
      console.log("Ejecutando tareas programadas de notificaciones...")
      await NotificationGeneratorService.generatePaymentReminders()
      await NotificationGeneratorService.generateBudgetAlerts()
      await NotificationGeneratorService.cleanupOldNotifications()
      await DebtGeneratorService.generateDebtsFromOverdueSubscriptions()
      console.log("Tareas programadas completadas")
    } catch (error) {
      console.error("Error en tareas programadas:", error)
    }
  }
}
