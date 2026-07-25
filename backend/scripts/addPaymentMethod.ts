import { pool } from '../src/config/database.js';

const migrate = async () => {
  try {
    await pool.query(`
      ALTER TABLE debts
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30)
      CHECK (payment_method IN ('debito', 'credito', 'billetera_virtual', 'efectivo', 'transferencia'))
    `);
    console.log('Column payment_method added successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
};

migrate();