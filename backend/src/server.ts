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
import budgetRoutes from "./routes/budgets.js"
// Carga las variables de entorno (.env) y crea la instancia de Express, la app central.
dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
// Middleware
app.use(corsMiddleware)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
// Endpoint de verificación de vida del servidor: devuelve estado y ambiente actual.
// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  })
})
// Monta cada grupo de rutas bajo un prefijo URL (/api/...). Cada módulo define sus propias rutas y controladores.
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
app.use('/api/budgets', budgetRoutes);
// Manejo de errores: primero se capturan rutas inexistentes (404) y luego los errores generales (500/status de cada error).
// Manejo de errores
app.use(notFoundHandler)
app.use(errorHandler)
// Función de arranque: pone a escuchar la app en el puerto configurado. Si falla, corta el proceso.
// Iniciar el servidor
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`)
      console.log(`🔗 API: http://localhost:${PORT}`)
      console.log(`📊 Endpoints disponibles:`)
      console.log(`   • /api/auth`)
      console.log(`   • /api/subscriptions`)
      console.log(`   • /api/categories`)
      console.log(`   • /api/users`)
      console.log(`   • /api/notifications`)
      console.log(`   • /api/audit`)
      console.log(`   • /api/reports`)
      console.log(`   • /api/upload`)
      console.log(`   • /api/calendar`)
      console.log(`   • /api/debts`)
      console.log(`   • /api/budgets`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
    process.exit(1)
  }
}
// Programa una tarea automática (job): ejecuta el job de notificaciones al inicio y luego cada hora (setInterval), usando import dinámico.
// Función para iniciar el job de notificaciones
const startNotificationJob = async () => {
  try {
    const { NotificationJob } = await import('./jobs/notificationJob.js')
    // Ejecutar inmediatamente al iniciar
    console.log("Iniciando job de notificaciones...")
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
    console.log(`Job de notificaciones programado (cada ${INTERVAL_MS / 1000 / 60} minutos)`)
  } catch (error) {
    console.error("Error iniciando job de notificaciones:", error)
  }
}
// Arranca el servidor y, cuando está listo, inicia el job de notificaciones en segundo plano.
startServer().then(() => {
  startNotificationJob()
})
export default app