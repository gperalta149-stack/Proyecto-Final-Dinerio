import cors from "cors"

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

export const corsOptions = {
  origin: [FRONTEND_URL, "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

export const corsMiddleware = cors(corsOptions)
