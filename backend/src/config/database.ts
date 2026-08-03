import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg

// Pool de conexiones a PostgreSQL: reutiliza varias conexiones (max: 5) en lugar de abrir una por consulta.
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "Dinerio_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  ssl: {
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// Eventos del pool: se ejecutan cuando se crea una conexión o cuando ocurre un error inesperado a nivel de pool.
pool.on("connect", () => {
  console.log(
    "DB client created",
    {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount
    }
  )
})

pool.on("error", (err) => {
  console.error("Unexpected database error:", err)
})

// Helper de query: ejecuta la consulta con parámetros ($1, $2...), mide su duración para logging
// y propaga el error hacia el controlador si falla. Usa parámetros para evitar inyección SQL.
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now()

  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start

    console.log("Executed query", {
      text,
      duration,
      rows: res.rowCount,
    })

    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export default pool