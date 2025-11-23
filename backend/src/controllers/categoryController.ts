import { Response } from "express";
import { pool } from "../config/database.js";
import type { AuthRequest } from "../types/index.js";

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const result = await pool.query(
      `SELECT
        c.*,
        COUNT(s.id) as subscription_count
        FROM categories c
        LEFT JOIN subscriptions s ON c.id = s.category_id AND s.user_id = $1 AND s.status = 'active'
        WHERE c.user_id IS NULL OR c.user_id = $1
        GROUP BY c.id
        ORDER BY
          CASE WHEN c.user_id IS NULL THEN 0 ELSE 1 END, -- Primero las default
          c.name ASC`,
      [req.user.userId]
    );

    // AGREGAR ESTO: Log detallado de lo que devuelve la base de datos
    console.log('[BACKEND] Resultado de la consulta SQL:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} - subscription_count: ${row.subscription_count}`);
    });

    // Verificar la estructura completa de una fila
    if (result.rows.length > 0) {
      console.log('[BACKEND] Estructura completa de la primera categoría:', Object.keys(result.rows[0]));
      console.log('[BACKEND] Primera categoría completa:', result.rows[0]);
    }

    console.log('[BACKEND] Categorías enviadas:', {
      count: result.rows.length,
      categories: result.rows.map(cat => ({
        id: cat.id,
        name: cat.name,
        subscription_count: cat.subscription_count,
        user_id: cat.user_id
      }))
    });

    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const getDefaultCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories WHERE user_id IS NULL ORDER BY name ASC`
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Get default categories error:", error);
    res.status(500).json({ error: "Error al obtener categorías por defecto" });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, color, icon } = req.body;

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (!name?.trim()) {
    res.status(400).json({ error: "El nombre de la categoría es requerido" });
    return;
  }

  try {
    const existingCategory = await pool.query(
      "SELECT id FROM categories WHERE name = $1 AND (user_id = $2 OR user_id IS NULL)",
      [name.trim(), req.user.userId]
    );

    if (existingCategory.rows.length > 0) {
      res.status(400).json({ error: "Ya existe una categoría con este nombre" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO categories (user_id, name, color, icon)
        VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.userId, name.trim(), color || '#3b82f6', icon || '📦']
    );

    // Obtener la categoría con count de suscripciones
    const categoryWithCount = await pool.query(
      `SELECT
        c.*,
        COUNT(s.id) as subscription_count
        FROM categories c
        LEFT JOIN subscriptions s ON c.id = s.category_id AND s.user_id = $1 AND s.status = 'active'
        WHERE c.id = $2
        GROUP BY c.id`,
      [req.user.userId, result.rows[0].id]
    );

    console.log('[BACKEND] Nueva categoría creada:', categoryWithCount.rows[0]);

    res.status(201).json({
      message: "Categoría creada exitosamente",
      category: categoryWithCount.rows[0],
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Error al crear la categoría" });
  }
};

// Se va a actualizar categoría
export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, color, icon } = req.body;

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  if (!name?.trim()) {
    res.status(400).json({ error: "El nombre de la categoría es requerido" });
    return;
  }

  try {
    const checkResult = await pool.query(
      "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
      [id, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: "Categoría no encontrada o no tienes permisos para editarla" });
      return;
    }

    const existingCategory = await pool.query(
      "SELECT id FROM categories WHERE name = $1 AND user_id = $2 AND id != $3",
      [name.trim(), req.user.userId, id]
    );

    if (existingCategory.rows.length > 0) {
      res.status(400).json({ error: "Ya existe otra categoría con este nombre" });
      return;
    }

    await pool.query(
      `UPDATE categories
        SET name = $1, color = $2, icon = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5`,
      [name.trim(), color || '#3b82f6', icon || '📦', id, req.user.userId]
    );

    const updatedCategory = await pool.query(
      `SELECT
        c.*,
        COUNT(s.id) as subscription_count
        FROM categories c
        LEFT JOIN subscriptions s ON c.id = s.category_id AND s.user_id = $1 AND s.status = 'active'
        WHERE c.id = $2
        GROUP BY c.id`,
      [req.user.userId, id]
    );

    res.json({
      message: "Categoría actualizada exitosamente",
      category: updatedCategory.rows[0],
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Error al actualizar la categoría" });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user?.userId) {
    res.status(401).json({ error: "User not authenticated" });
    return;
  }

  try {
    const checkResult = await pool.query(
      "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
      [id, req.user.userId]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: "Categoría no encontrada o no tienes permisos para eliminarla" });
      return;
    }

    const subscriptionsResult = await pool.query(
      "SELECT COUNT(*) as count FROM subscriptions WHERE category_id = $1 AND user_id = $2 AND status = 'active'",
      [id, req.user.userId]
    );

    const subscriptionCount = parseInt(subscriptionsResult.rows[0].count);

    if (subscriptionCount > 0) {
      await pool.query(
        "UPDATE subscriptions SET category_id = NULL WHERE category_id = $1 AND user_id = $2",
        [id, req.user.userId]
      );
    }

    await pool.query("DELETE FROM categories WHERE id = $1 AND user_id = $2", [id, req.user.userId]);

    res.json({
      message: `Categoría eliminada exitosamente. ${subscriptionCount > 0 ? `${subscriptionCount} suscripciones movidas a "Sin categoría".` : ''}`
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Error al eliminar la categoría" });
  }
};