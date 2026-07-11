import db from '../config/database';

export interface IUser {
    id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    role?: string;
    monthly_budget?: number;
    currency?: string;
    language?: string;
    notifications_enabled?: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role?: string;
    monthly_budget?: number;
    currency?: string;
    language?: string;
    notifications_enabled?: boolean;
}

export interface UpdateUserData {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    monthly_budget?: number;
    currency?: string;
    language?: string;
    notifications_enabled?: boolean;
}

export interface UserSettings {
    currency: string;
    language: string;
    notifications_enabled: boolean;
}

export class UserModel {
    static async findByEmail(email: string): Promise<IUser | null> {
        try {
            const result = await db.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in UserModel.findByEmail:', error);
            throw error;
        }
    }

    static async findById(id: string): Promise<IUser | null> {
        try {
            const result = await db.query(
                'SELECT * FROM users WHERE id = $1',
                [id]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in UserModel.findById:', error);
            throw error;
        }
    }

    static async create(userData: CreateUserData): Promise<IUser> {
        try {
            const {
                email,
                password,
                first_name,
                last_name,
                avatar_url,
                role = 'user',
                monthly_budget = 0,
                currency = 'USD',
                language = 'es',
                notifications_enabled = true
            } = userData;

            const result = await db.query(
                `INSERT INTO users (email, password, first_name, last_name, avatar_url, role, monthly_budget, currency, language, notifications_enabled, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
                RETURNING *`,
                [email, password, first_name, last_name, avatar_url || null, role, monthly_budget, currency, language, notifications_enabled]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Error in UserModel.create:', error);
            throw error;
        }
    }

    static async update(id: string, userData: UpdateUserData): Promise<IUser | null> {
        try {
            const updates: string[] = [];
            const params: any[] = [];
            let paramCount = 1;

            if (userData.first_name !== undefined) {
                updates.push(`first_name = $${paramCount}`);
                params.push(userData.first_name);
                paramCount++;
            }
            if (userData.last_name !== undefined) {
                updates.push(`last_name = $${paramCount}`);
                params.push(userData.last_name);
                paramCount++;
            }
            if (userData.avatar_url !== undefined) {
                updates.push(`avatar_url = $${paramCount}`);
                params.push(userData.avatar_url);
                paramCount++;
            }
            if (userData.monthly_budget !== undefined) {
                updates.push(`monthly_budget = $${paramCount}`);
                params.push(userData.monthly_budget);
                paramCount++;
            }
            if (userData.currency !== undefined) {
                updates.push(`currency = $${paramCount}`);
                params.push(userData.currency);
                paramCount++;
            }
            if (userData.language !== undefined) {
                updates.push(`language = $${paramCount}`);
                params.push(userData.language);
                paramCount++;
            }
            if (userData.notifications_enabled !== undefined) {
                updates.push(`notifications_enabled = $${paramCount}`);
                params.push(userData.notifications_enabled);
                paramCount++;
            }

            if (updates.length === 0) {
                return this.findById(id);
            }

            updates.push('updated_at = NOW()');
            params.push(id);

            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
            
            const result = await db.query(query, params);
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in UserModel.update:', error);
            throw error;
        }
    }

    static async updatePassword(id: string, newPassword: string): Promise<IUser | null> {
        try {
            const result = await db.query(
                'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [newPassword, id]
            );
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error('Error in UserModel.updatePassword:', error);
            throw error;
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
            const result = await db.query(
                'DELETE FROM users WHERE id = $1 RETURNING id',
                [id]
            );
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error in UserModel.delete:', error);
            throw error;
        }
    }
}

export { UserModel as User };