import cors from "cors"

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

// Configuración CORS: permite que el frontend (React/Vite) acceda a la API desde otro origen.
// origin lista los dominios autorizados y credentials habilita el envío de cookies/tokens en la petición.
export const corsOptions = {
  origin: [FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

// Genera el middleware a partir de la configuración para usarlo en la aplicación.
export const corsMiddleware = cors(corsOptions)
