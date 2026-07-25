import { NotificationGeneratorService } from "../services/notificationService.js"
import { DebtGeneratorService } from "../services/debtGeneratorService.js"
import logger from "../config/logger.js"
export class NotificationJob {
  static async runScheduledTasks(): Promise<void> {
    try {
      logger.info("Ejecutando tareas programadas de notificaciones...")
      await NotificationGeneratorService.generatePaymentReminders()
      await NotificationGeneratorService.generateBudgetAlerts()
      await NotificationGeneratorService.cleanupOldNotifications()
      await DebtGeneratorService.generateDebtsFromOverdueSubscriptions()
      logger.info("Tareas programadas completadas")
    } catch (error) {
      logger.error("Error en tareas programadas:", error)
    }
  }
}
