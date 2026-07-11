import { Response } from "express"
import { pool } from "../config/database.js"
import type { AuthRequest } from "../types/index.js"

// NOTA: este controller se infirió a partir del schema de "categories" y del
// routes/categories.ts que ya llamaba a categoryController.*, porque el código
// original de esta lógica no vino incluido en lo que se pegó para el refactor.
// Revisar y ajustar si la implementación real difiere.

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*,
        COUNT(s.id) FILTER (WHERE s.user_id = $1) AS subscription_count,
        COALESCE(SUM(
          CASE s.billing_cycle
            WHEN 'monthly' THEN s.amount
            WHEN 'yearly' THEN s.amount / 12.0
            WHEN 'weekly' THEN s.amount * 4
            ELSE s.amount
          END
        ) FILTER (WHERE s.user_id = $1), 0) AS monthly_total
        FROM categories c
        LEFT JOIN subscriptions s ON s.category_id = c.id AND s.user_id = $1
        WHERE c.user_id = $1 OR c.user_id IS NULL
        GROUP BY c.id
        ORDER BY c.name ASC`,
      [req.user!.userId]
    )

    res.json({ categories: result.rows })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ error: "Error al obtener categorías" })
  }
}

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, color, icon, monthly_limit } = req.body

  if (!name) {
    res.status(400).json({ error: "El nombre es requerido" })
    return
  }

  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, color, icon, monthly_limit)
        VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user!.userId, name, color || "#3b82f6", icon, monthly_limit || null]
    )

    res.status(201).json({
      message: "Categoría creada exitosamente",
      category: result.rows[0],
    })
  } catch (error) {
    console.error("Create category error:", error)
    res.status(500).json({ error: "Error al crear categoría" })
  }
}

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, color, icon, monthly_limit } = req.body

  try {
    const result = await pool.query(
      `UPDATE categories
        SET name = COALESCE($1, name),
            color = COALESCE($2, color),
            icon = COALESCE($3, icon),
            monthly_limit = COALESCE($4, monthly_limit),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, color, icon, monthly_limit, id, req.user!.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Categoría no encontrada" })
      return
    }

    res.json({
      message: "Categoría actualizada exitosamente",
      category: result.rows[0],
    })
  } catch (error) {
    console.error("Update category error:", error)
    res.status(500).json({ error: "Error al actualizar categoría" })
  }
}

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  try {
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id, name",
      [id, req.user!.userId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Categoría no encontrada" })
      return
    }

    res.json({ message: "Categoría eliminada exitosamente" })
  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ error: "Error al eliminar categoría" })
  }
}
