import { Response } from 'express';
import type { AuthRequest } from '../types/index.js';
import { SubscriptionModel } from '../models/Subscription.js';

interface CalendarSubscriptionRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextBillingDate: string;
  billingCycle: string;
  status: string;
  categoryId: string | null;
  category_name: string | null;
  category_color: string | null;
}

interface UpcomingPaymentRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  next_billing_date: string;
  billing_cycle: string;
  category_name: string | null;
  category_color: string | null;
}

export const getCalendarEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { month, year } = req.query;
    let query = `
      SELECT
        s.id,
        s.name,
        s.amount,
        s.currency,
        s.next_billing_date as "nextBillingDate",
        s.billing_cycle as "billingCycle",
        s.status,
        s.category_id as "categoryId",
        c.name as "category_name",
        c.color as "category_color"
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1 AND s.status IN ('active', 'cancelled')
    `;
    const params: (string | number)[] = [userId];

    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);

      query += ` AND s.next_billing_date BETWEEN $2 AND $3`;
      params.push(startDate.toISOString().split('T')[0]);
      params.push(endDate.toISOString().split('T')[0]);
    }
    query += ` ORDER BY s.next_billing_date ASC`;
    const result = await SubscriptionModel.findByQuery(query, params);

    const events = (result as CalendarSubscriptionRow[]).map((sub) => ({
      id: sub.id,
      title: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      date: sub.nextBillingDate,
      billing_cycle: sub.billingCycle,
      status: sub.status,
      category_id: sub.categoryId,
      category_name: sub.category_name,
      category_color: sub.category_color,
      type: 'payment' as const
    }));
    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUpcomingPayments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { days = 30 } = req.query;
    const subscriptions = await SubscriptionModel.getUpcomingSubscriptions(
      userId,
      parseInt(days as string)
    );
    const payments = (subscriptions as UpcomingPaymentRow[]).map((sub) => ({
      id: sub.id,
      name: sub.name,
      amount: sub.amount,
      currency: sub.currency,
      next_billing_date: sub.next_billing_date,
      billing_cycle: sub.billing_cycle,
      categoryName: sub.category_name,
      categoryColor: sub.category_color
    }));
    res.json(payments);
  } catch (error) {
    console.error('Error fetching upcoming payments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
