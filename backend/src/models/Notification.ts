import { pool } from "../config/database.js";

export interface Notification {
  id: string;
  user_id: string;
  subscription_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export const NotificationModel = {
  // ============================================================
  // Encontrar notificaciones por usuario
  // ============================================================
  async findByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const result = await pool.query(
      `SELECT n.*, s.name as subscription_name
        FROM notifications n
        LEFT JOIN subscriptions s ON n.subscription_id = s.id
        WHERE n.user_id = $1
        ORDER BY n.created_at DESC
        LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  },

  // ============================================================
  // Contar notificaciones no leídas
  // ============================================================
  async countUnread(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count
        FROM notifications
        WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
    return Number.parseInt(result.rows[0].count);
  },

  // ============================================================
  // Crear notificación
  // ============================================================
  async create(data: {
    user_id: string;
    subscription_id?: string;
    type: string;
    title: string;
    message: string;
    is_read?: boolean;
  }): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications
        (user_id, subscription_id, type, title, message, is_read, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        data.user_id,
        data.subscription_id || null,
        data.type,
        data.title,
        data.message,
        data.is_read || false
      ]
    );
    return result.rows[0];
  },

  // ============================================================
  // Marcar como leída
  // ============================================================
  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const result = await pool.query(
      `UPDATE notifications
        SET is_read = true
        WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  // ============================================================
  // Marcar todas como leídas
  // ============================================================
  async markAllAsRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications
        SET is_read = true
        WHERE user_id = $1 AND is_read = false`,
      [userId]
    );
  },

  // ============================================================
  // Eliminar notificación
  // ============================================================
  async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );
    return result.rows.length > 0;
  }
};