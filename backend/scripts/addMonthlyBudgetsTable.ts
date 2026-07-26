import { pool } from "../src/config/database.js"

const run = async () => {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    await client.query(`
      CREATE TABLE IF NOT EXISTS monthly_budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        budget_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        alert_threshold DECIMAL(5,2) NOT NULL DEFAULT 80.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, year, month)
      )
    `)

    const usersResult = await client.query(
      `SELECT id, monthly_budget FROM users WHERE monthly_budget > 0`
    )
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    for (const user of usersResult.rows) {
      await client.query(
        `INSERT INTO monthly_budgets (user_id, year, month, budget_amount)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, year, month) DO NOTHING`,
        [user.id, currentYear, currentMonth, user.monthly_budget]
      )
    }

    await client.query("COMMIT")
    console.log(`Migración completada: tabla monthly_budgets creada, ${usersResult.rows.length} registros migrados`)
  } catch (err) {
    await client.query("ROLLBACK")
    console.error("Error en migración:", err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

run()
