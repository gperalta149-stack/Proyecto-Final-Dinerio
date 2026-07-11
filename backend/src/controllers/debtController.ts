import type { Response } from 'express';
import { pool } from '../config/database.js';
import { createAuditLog } from '../middleware/auditLog.js';
import type { AuthRequest } from '../types/index.js';

const DEBT_WITH_CATEGORY = `
  SELECT
    d.*,
    c.name  AS category_name,
    c.color AS category_color
  FROM debts d
  LEFT JOIN categories c ON d.category_id = c.id
`;

// ── Listar deudas ────────────────────────────────────────────
export const getDebts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `${DEBT_WITH_CATEGORY} WHERE d.user_id = $1 ORDER BY
         CASE WHEN d.status = 'pending' THEN 0 ELSE 1 END,
         d.due_date ASC`,
      [req.user!.userId]
    );
    res.json({ debts: result.rows });
  } catch (error) {
    console.error('Get debts error:', error);
    res.status(500).json({ error: 'Error al obtener deudas' });
  }
};

// ── Resumen (para cards de la página) ────────────────────────
export const getDebtsSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pendingResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount), 0)::float AS total,
         COUNT(*)::int AS count,
         COALESCE(MAX(CURRENT_DATE - due_date), 0)::int AS oldest_days,
         (SELECT name FROM debts WHERE user_id = $1 AND status = 'pending'
           ORDER BY due_date ASC LIMIT 1) AS oldest_name
       FROM debts
       WHERE user_id = $1 AND status = 'pending'`,
      [req.user!.userId]
    );

    const paidThisMonthResult = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM debts
       WHERE user_id = $1 AND status = 'paid'
         AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR  FROM paid_at) = EXTRACT(YEAR  FROM CURRENT_DATE)`,
      [req.user!.userId]
    );

    res.json({
      totalOwed:        pendingResult.rows[0].total,
      pendingCount:      pendingResult.rows[0].count,
      oldestDays:        pendingResult.rows[0].oldest_days,
      oldestName:        pendingResult.rows[0].oldest_name,
      paidThisMonthCount: paidThisMonthResult.rows[0].count,
    });
  } catch (error) {
    console.error('Get debts summary error:', error);
    res.status(500).json({ error: 'Error al obtener resumen de deudas' });
  }
};

// ── Registrar deuda manual ───────────────────────────────────
export const createManualDebt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, amount, currency = 'ARS', due_date, category_id } = req.body;

  if (!name?.trim()) {
    res.status(400).json({ error: 'El nombre es requerido' });
    return;
  }
  if (!amount || Number(amount) <= 0) {
    res.status(400).json({ error: 'El monto debe ser mayor a 0' });
    return;
  }
  if (!due_date) {
    res.status(400).json({ error: 'La fecha de vencimiento es requerida' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO debts (user_id, name, amount, currency, due_date, category_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [req.user!.userId, name.trim(), Number(amount), currency, due_date, category_id || null]
    );

    const full = await pool.query(`${DEBT_WITH_CATEGORY} WHERE d.id = $1`, [result.rows[0].id]);

    await createAuditLog(req, 'CREATE', 'debt', result.rows[0].id, { name, amount });

    res.status(201).json({ message: 'Deuda registrada exitosamente', debt: full.rows[0] });
  } catch (error) {
    console.error('Create manual debt error:', error);
    res.status(500).json({ error: 'Error al registrar la deuda' });
  }
};

// ── Marcar como pagada ───────────────────────────────────────
export const markDebtAsPaid = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE debts
       SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deuda no encontrada' });
      return;
    }

    await createAuditLog(req, 'UPDATE', 'debt', id, { status: 'paid' });

    res.json({ message: 'Deuda marcada como pagada' });
  } catch (error) {
    console.error('Mark debt as paid error:', error);
    res.status(500).json({ error: 'Error al marcar la deuda como pagada' });
  }
};

// ── Posponer (mueve el vencimiento 7 días) ───────────────────
export const postponeDebt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const days = req.body?.days ? Number(req.body.days) : 7;

  try {
    const result = await pool.query(
      `UPDATE debts
       SET due_date = due_date + ($1 || ' days')::interval, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 AND status = 'pending'
       RETURNING id`,
      [days, id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deuda no encontrada' });
      return;
    }

    res.json({ message: 'Deuda pospuesta exitosamente' });
  } catch (error) {
    console.error('Postpone debt error:', error);
    res.status(500).json({ error: 'Error al posponer la deuda' });
  }
};

// ── Eliminar deuda ───────────────────────────────────────────
export const deleteDebt = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deuda no encontrada' });
      return;
    }

    res.json({ message: 'Deuda eliminada' });
  } catch (error) {
    console.error('Delete debt error:', error);
    res.status(500).json({ error: 'Error al eliminar la deuda' });
  }
};
