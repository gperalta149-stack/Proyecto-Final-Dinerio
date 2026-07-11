import db from '../config/database';

export interface ICategory {
    id: string;
    user_id?: string | null;
    name: string;
    color: string;
    icon?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryData {
    user_id?: string;
    name: string;
    color?: string;
    icon?: string;
}

export interface UpdateCategoryData {
    name?: string;
    color?: string;
    icon?: string;
}

export class CategoryModel {
    static async findAll(): Promise<ICategory[]> {
        try {
            const result = await db.query(
                'SELECT * FROM categories ORDER BY name ASC'
            );
            return result.rows;
        } catch (error) {
            console.error('Error in CategoryModel.findAll:', error);
            throw error;
        }
    }

    static async findByUserId(userId: string): Promise<ICategory[]> {
        try {
            const result = await db.query(
                `SELECT * FROM categories 
                WHERE user_id IS NULL OR user_id = $1 
                ORDER BY name ASC`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            console.error('Error in CategoryModel.findByUserId:', error);
            throw error;
        }
    }

    static async findById(id: string): Promise<ICategory | null> {
        try {
            const result = await db.query(
                'SELECT * FROM categories WHERE id = $1',
                [id]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in CategoryModel.findById:', error);
            throw error;
        }
    }

    static async create(categoryData: CreateCategoryData): Promise<ICategory> {
        try {
            const {
                user_id,
                name,
                color = '#3b82f6',
                icon
            } = categoryData;

            const result = await db.query(
                `INSERT INTO categories (user_id, name, color, icon, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                RETURNING *`,
                [user_id || null, name, color, icon || null]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error in CategoryModel.create:', error);
            throw error;
        }
    }

    static async update(id: string, categoryData: UpdateCategoryData): Promise<ICategory | null> {
        try {
            const updates: string[] = [];
            const params: any[] = [];
            let paramCount = 1;

            if (categoryData.name !== undefined) {
                updates.push(`name = $${paramCount}`);
                params.push(categoryData.name);
                paramCount++;
            }
            if (categoryData.color !== undefined) {
                updates.push(`color = $${paramCount}`);
                params.push(categoryData.color);
                paramCount++;
            }
            if (categoryData.icon !== undefined) {
                updates.push(`icon = $${paramCount}`);
                params.push(categoryData.icon);
                paramCount++;
            }

            if (updates.length === 0) {
                return this.findById(id);
            }

            updates.push('updated_at = NOW()');
            params.push(id);

            const query = `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
            
            const result = await db.query(query, params);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in CategoryModel.update:', error);
            throw error;
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            const result = await db.query(
                'DELETE FROM categories WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error in CategoryModel.delete:', error);
            throw error;
        }
    }
}

export { CategoryModel as Category };
