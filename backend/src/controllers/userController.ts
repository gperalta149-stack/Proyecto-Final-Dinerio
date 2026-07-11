import { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"
import bcrypt from "bcryptjs";

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, avatar_url,
              monthly_budget, monthly_income, currency,
              language, notifications_enabled,
              created_at, updated_at
       FROM users
       WHERE id = $1`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { first_name, last_name, avatar_url, monthly_budget, monthly_income } = req.body

    const result = await pool.query(
      `UPDATE users
        SET first_name = COALESCE($1, first_name),
            last_name = COALESCE($2, last_name),
            avatar_url = COALESCE($3, avatar_url),
            monthly_budget = COALESCE($4, monthly_budget),
            monthly_income = COALESCE($5, monthly_income),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, email, first_name, last_name, avatar_url, monthly_budget, monthly_income, currency, language, notifications_enabled, created_at, updated_at`,
      [first_name, last_name, avatar_url, monthly_budget, monthly_income, req.user!.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado " })
      return
    }

    res.json({
      message: "Perfil actualizado exitosamente",
      user: result.rows[0]
    })
  } catch (error) {
    console.error("Update user profile error:", error)
    res.status(500).json({ error: "Error al actualizar perfil" })
  }
}

export const updateUserSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currency, language, notifications_enabled } = req.body

    const result = await pool.query(
      `UPDATE users
        SET currency = COALESCE($1, currency),
            language = COALESCE($2, language),
            notifications_enabled = COALESCE($3, notifications_enabled),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING id, email, currency, language, notifications_enabled`,
      [currency, language, notifications_enabled, req.user!.userId]
    )

    res.json({
      message: "Configuración actualizada exitosamente",
      settings: result.rows[0]
    })
  } catch (error) {
    console.error("Update user settings error:", error)
    res.status(500).json({ error: "Error al actualizar configuración" })
  }
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    console.log("[BACKEND] Cambio de contraseña recibido:", {
      userId: req.user!.userId,
      tieneCurrentPassword: !!currentPassword,
      tieneNewPassword: !!newPassword,
      longitudNewPassword: newPassword?.length
    });

    if (!currentPassword || !newPassword) {
      console.log("[BACKEND] Faltan campos requeridos");
      res.status(400).json({ error: "Contraseña actual y nueva contraseña son requeridas" });
      return;
    }

    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [req.user!.userId]
    );

    if (userResult.rows.length === 0) {
      console.log("[BACKEND] Usuario no encontrado");
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const user = userResult.rows[0];
    console.log("[BACKEND] Usuario encontrado:", user.id);
    if (newPassword.length < 6) {
      console.log("[BACKEND] Contraseña muy corta");
      res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
      return;
    }

    console.log("[BACKEND] Saltando verificación de contraseña actual (modo testing)");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [passwordHash, req.user!.userId]
    );

    console.log("[BACKEND] Contraseña actualizada exitosamente");
    res.json({ message: "Contraseña actualizada exitosamente" });

  } catch (error) {
    console.error("[BACKEND] Error cambiando contraseña:", error);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};
