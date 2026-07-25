import express from "express"
import dotenv from "dotenv"
import { corsMiddleware } from "./middleware/cors.js"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js"
// Importar rutas existentes
import authRoutes from "./routes/auth.js"
import subscriptionRoutes from "./routes/subscriptions.js"
import categoryRoutes from "./routes/categories.js"
import userRoutes from "./routes/users.js"
import notificationRoutes from "./routes/notifications.js"
import auditRoutes from "./routes/audit.js"
import reportRoutes from "./routes/reports.js"
import uploadRoutes from "./routes/upload.js"
import calendarRoutes from "./routes/calendar.js"
import debtRoutes from "./routes/debts.js"
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
// Middleware
app.use(corsMiddleware)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  })
})
// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/users", userRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/upload", uploadRoutes)
app.use('/api/calendar', calendarRoutes);
app.use('/api/debts', debtRoutes);
// Manejo de errores
app.use(notFoundHandler)
app.use(errorHandler)
// Iniciar el servidor
import logger from './config/logger.js'

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`)
      logger.info(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`)
      logger.info(`🔗 API: http://localhost:${PORT}`)
      logger.info(`📊 Endpoints disponibles:`)
      logger.info(`   • /api/auth`)
      logger.info(`   • /api/subscriptions`)
      logger.info(`   • /api/categories`)
      logger.info(`   • /api/users`)
      logger.info(`   • /api/notifications`)
      logger.info(`   • /api/audit`)
      logger.info(`   • /api/reports`)
      logger.info(`   • /api/upload`)
      logger.info(`   • /api/calendar`)
      logger.info(`   • /api/debts`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
    process.exit(1)
  }
}
// Función para iniciar el job de notificaciones
const startNotificationJob = async () => {
  try {
    const { NotificationJob } = await import('./jobs/notificationJob.js')
    // Ejecutar inmediatamente al iniciar
    logger.info("Iniciando job de notificaciones...")
    await NotificationJob.runScheduledTasks()
    const INTERVAL_MS = 60 * 60 * 1000
    setInterval(async () => {
      try {
        const { NotificationJob } = await import('./jobs/notificationJob.js')
        await NotificationJob.runScheduledTasks()
      } catch (error) {
        console.error("Error en job programado:", error)
      }
    }, INTERVAL_MS)
    logger.info(`Job de notificaciones programado (cada ${INTERVAL_MS / 1000 / 60} minutos)`)
  } catch (error) {
    logger.error("Error iniciando job de notificaciones:", error)
  }
}
startServer().then(() => {
  startNotificationJob()
})
export default app
