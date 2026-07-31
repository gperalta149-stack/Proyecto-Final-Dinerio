import type { Response } from 'express';
import { pool } from '../config/database.js';
import { createAuditLog } from '../middleware/auditLog.js';
import type { AuthRequest } from '../types/index.js';
import { getExchangeRate } from '../services/exchangeRateService.js';

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
        COALESCE(SUM(amount) FILTER (WHERE currency = 'ARS'), 0)::float AS total_ars,
        COALESCE(SUM(amount) FILTER (WHERE currency = 'USD'), 0)::float AS total_usd,
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

    const exchangeRate = await getExchangeRate();
    const totalArs = parseFloat(pendingResult.rows[0].total_ars) || 0;
    const totalUsd = parseFloat(pendingResult.rows[0].total_usd) || 0;
    const totalOwedConverted = totalArs + totalUsd * exchangeRate;

    res.json({
      totalOwed:           totalArs,
      totalOwedUSD:        totalUsd,
      totalOwedConverted:  Math.round(totalOwedConverted * 100) / 100,
      exchangeRate,
      pendingCount:        pendingResult.rows[0].count,
      oldestDays:          pendingResult.rows[0].oldest_days,
      oldestName:          pendingResult.rows[0].oldest_name,
      paidThisMonthCount:  paidThisMonthResult.rows[0].count,
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
    const exchangeRate = await getExchangeRate();
    const numericAmount = Number(amount);
    const amountArs = currency === 'USD'
      ? Math.round(numericAmount * exchangeRate * 100) / 100
      : numericAmount;

    const result = await pool.query(
      `INSERT INTO debts (user_id, name, amount, currency, due_date, category_id, status, amount_ars)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
        RETURNING id`,
      [req.user!.userId, name.trim(), numericAmount, currency, due_date, category_id || null, amountArs]
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
  const { payment_method, amount_ars } = req.body;

  if (payment_method && !['debito', 'credito', 'billetera_virtual', 'efectivo', 'transferencia'].includes(payment_method)) {
    res.status(400).json({ error: 'Método de pago inválido' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE debts
        SET status = 'paid', payment_method = $1, amount_ars = $2, paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND user_id = $4
        RETURNING id, subscription_id`,
      [payment_method || null, amount_ars || null, id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Deuda no encontrada' });
      return;
    }

    const subId = result.rows[0].subscription_id;
    if (subId) {
      await pool.query(
        `UPDATE subscriptions
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND user_id = $2 AND status = 'active'`,
        [subId, req.user!.userId]
      );
    }

    // Notificación cuando una suscripción/deuda fue pagada
    try {
      const paidInfo = await pool.query(
        `SELECT d.name, d.amount, d.currency, u.notifications_enabled,
                s.name as subscription_name
          FROM debts d
          JOIN users u ON u.id = d.user_id
          LEFT JOIN subscriptions s ON d.subscription_id = s.id
          WHERE d.id = $1`,
        [id]
      );
      const info = paidInfo.rows[0];
      if (info && info.notifications_enabled !== false) {
        const label = info.subscription_name || info.name;
        await pool.query(
          `INSERT INTO notifications (user_id, subscription_id, type, title, message)
            VALUES ($1, $2, $3, $4, $5)`,
          [
            req.user!.userId,
            subId,
            'payment_paid',
            'Pago realizado',
            `Tu suscripción "${label}" fue pagada. Monto: ${info.currency} ${info.amount}`,
          ]
        );
      }
    } catch (notificationError) {
      console.error("Error creando notificación de pago:", notificationError);
    }

    await createAuditLog(req, 'UPDATE', 'debt', id, { status: 'paid', payment_method });

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
