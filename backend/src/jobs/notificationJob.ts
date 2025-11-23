import { NotificationGeneratorService } from "../services/notificationService.js"

export class NotificationJob {
  static async runScheduledTasks(): Promise<void> {
    try {
      console.log("Ejecutando tareas programadas de notificaciones...")
      
      await NotificationGeneratorService.generatePaymentReminders()
      
      await NotificationGeneratorService.generateBudgetAlerts()
      
      console.log("Tareas programadas completadas")
    } catch (error) {
      console.error("Error en tareas programadas:", error)
    }
  }
}