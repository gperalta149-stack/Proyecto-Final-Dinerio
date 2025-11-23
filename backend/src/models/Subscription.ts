import db from '../config/database';

export interface ISubscription {
    id: string;
    user_id: string;
    category_id?: string | null;
    name: string;
    description?: string | null;
    amount: number;
    currency: string;
    billing_cycle: string;
    start_date?: string;
    next_billing_date: string;
    status: 'active' | 'cancelled' | 'paused';
    payment_method?: string | null;
    website_url?: string | null;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateSubscriptionData {
    user_id: string;
    category_id?: string | null;
    name: string;
    description?: string;
    amount: number;
    currency?: string;
    billing_cycle: string;
    start_date?: string;
    next_billing_date?: string;
    status?: string;
    payment_method?: string;
    website_url?: string;
    notes?: string;
}

export interface UpdateSubscriptionData {
    category_id?: string | null;
    name?: string;
    description?: string;
    amount?: number;
    currency?: string;
    billing_cycle?: string;
    start_date?: string;
    next_billing_date?: string;
    status?: string;
    payment_method?: string;
    website_url?: string;
    notes?: string;
}

export class SubscriptionModel {
    static async findByUserId(userId: string): Promise<ISubscription[]> {
        try {
        const result = await db.query(
            `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM subscriptions s
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE s.user_id = $1
            ORDER BY s.next_billing_date ASC`,
            [userId]
        );
        return result.rows;
        } catch (error) {
        console.error('Error in SubscriptionModel.findByUserId:', error);
        throw error;
        }
    }

    static async findById(id: string): Promise<ISubscription | null> {
        try {
        const result = await db.query(
            `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM subscriptions s
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE s.id = $1`,
            [id]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
        console.error('Error in SubscriptionModel.findById:', error);
        throw error;
        }
    }

    static async create(subscriptionData: CreateSubscriptionData): Promise<ISubscription> {
        try {
        const {
            user_id,
            category_id,
            name,
            description,
            amount,
            currency = 'USD',
            billing_cycle,
            start_date,
            next_billing_date,
            status = 'active',
            payment_method,
            website_url,
            notes
        } = subscriptionData;

        let finalNextBillingDate = next_billing_date;
        if (!finalNextBillingDate && start_date) {
            const startDate = new Date(start_date);
            if (billing_cycle === 'monthly') {
            startDate.setMonth(startDate.getMonth() + 1);
            } else if (billing_cycle === 'yearly') {
            startDate.setFullYear(startDate.getFullYear() + 1);
            } else if (billing_cycle === 'weekly') {
            startDate.setDate(startDate.getDate() + 7);
            } else if (billing_cycle === 'quarterly') {
            startDate.setMonth(startDate.getMonth() + 3);
            }
            finalNextBillingDate = startDate.toISOString().split('T')[0];
        }

        const result = await db.query(
            `INSERT INTO subscriptions (
            user_id, category_id, name, description, amount, currency,
            billing_cycle, start_date, next_billing_date, status,
            payment_method, website_url, notes, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
            RETURNING *`,
            [
            user_id,
            category_id,
            name,
            description,
            amount,
            currency,
            billing_cycle,
            start_date || new Date().toISOString().split('T')[0],
            finalNextBillingDate || new Date().toISOString().split('T')[0],
            status,
            payment_method,
            website_url,
            notes
            ]
        );

        return result.rows[0];
        } catch (error) {
        console.error('Error in SubscriptionModel.create:', error);
        throw error;
        }
    }

    static async update(id: string, subscriptionData: UpdateSubscriptionData): Promise<ISubscription | null> {
        try {
        const updates: string[] = [];
        const params: any[] = [];
        let paramCount = 1;

        if (subscriptionData.category_id !== undefined) {
            updates.push(`category_id = $${paramCount}`);
            params.push(subscriptionData.category_id);
            paramCount++;
        }
        if (subscriptionData.name !== undefined) {
            updates.push(`name = $${paramCount}`);
            params.push(subscriptionData.name);
            paramCount++;
        }
        if (subscriptionData.description !== undefined) {
            updates.push(`description = $${paramCount}`);
            params.push(subscriptionData.description);
            paramCount++;
        }
        if (subscriptionData.amount !== undefined) {
            updates.push(`amount = $${paramCount}`);
            params.push(subscriptionData.amount);
            paramCount++;
        }
        if (subscriptionData.currency !== undefined) {
            updates.push(`currency = $${paramCount}`);
            params.push(subscriptionData.currency);
            paramCount++;
        }
        if (subscriptionData.billing_cycle !== undefined) {
            updates.push(`billing_cycle = $${paramCount}`);
            params.push(subscriptionData.billing_cycle);
            paramCount++;
        }
        if (subscriptionData.start_date !== undefined) {
            updates.push(`start_date = $${paramCount}`);
            params.push(subscriptionData.start_date);
            paramCount++;
        }
        if (subscriptionData.next_billing_date !== undefined) {
            updates.push(`next_billing_date = $${paramCount}`);
            params.push(subscriptionData.next_billing_date);
            paramCount++;
        }
        if (subscriptionData.status !== undefined) {
            updates.push(`status = $${paramCount}`);
            params.push(subscriptionData.status);
            paramCount++;
        }
        if (subscriptionData.payment_method !== undefined) {
            updates.push(`payment_method = $${paramCount}`);
            params.push(subscriptionData.payment_method);
            paramCount++;
        }
        if (subscriptionData.website_url !== undefined) {
            updates.push(`website_url = $${paramCount}`);
            params.push(subscriptionData.website_url);
            paramCount++;
        }
        if (subscriptionData.notes !== undefined) {
            updates.push(`notes = $${paramCount}`);
            params.push(subscriptionData.notes);
            paramCount++;
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        updates.push('updated_at = NOW()');
        params.push(id);

        const query = `UPDATE subscriptions SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        
        const result = await db.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
        console.error('Error in SubscriptionModel.update:', error);
        throw error;
        }
    }

    static async delete(id: string): Promise<boolean> {
        try {
        const result = await db.query(
            'DELETE FROM subscriptions WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows.length > 0;
        } catch (error) {
        console.error('Error in SubscriptionModel.delete:', error);
        throw error;
        }
    }

    static async findByQuery(query: string, params: any[]): Promise<any[]> {
        try {
        const result = await db.query(query, params);
        return result.rows;
        } catch (error) {
        console.error('Error in SubscriptionModel.findByQuery:', error);
        throw error;
        }
    }

    static async getUpcomingSubscriptions(userId: string, days: number = 30): Promise<ISubscription[]> {
        try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const result = await db.query(
            `SELECT s.*, c.name as category_name, c.color as category_color, c.icon as category_icon
            FROM subscriptions s
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE s.user_id = $1
            AND s.status = 'active'
            AND s.next_billing_date BETWEEN $2 AND $3
            ORDER BY s.next_billing_date ASC`,
            [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
        );

        return result.rows;
        } catch (error) {
        console.error('Error in SubscriptionModel.getUpcomingSubscriptions:', error);
        throw error;
        }
    }
}

export { SubscriptionModel as Subscription };