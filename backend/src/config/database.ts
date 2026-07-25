import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const { Pool } = pg

import logger from './logger.js'

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "subtrack",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on("connect", () => {
  logger.info("Database connected successfully")
})

pool.on("error", (err) => {
  console.error("Unexpected database error:", err)
  process.exit(-1)
})

export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    // avoid logging full SQL text in production; include it only when DEBUG
    logger.debug("Executed query", { duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export default pool
