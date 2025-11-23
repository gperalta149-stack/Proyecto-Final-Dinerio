import { Request, Response } from 'express';
import { SubscriptionModel } from '../models/Subscription';

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
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
      WHERE s.user_id = $1 AND s.status = 'active'
    `;

    const params: any[] = [userId];

    // Se va a filtrar por mes y año si se proporcionan
    if (month && year) {
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      
      query += ` AND s.next_billing_date BETWEEN $2 AND $3`;
      params.push(startDate.toISOString().split('T')[0]);
      params.push(endDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY s.next_billing_date ASC`;

    const result = await SubscriptionModel.findByQuery(query, params);
    
    const events = result.map((sub: any) => ({
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
      type: 'payment'
    }));

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUpcomingPayments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { days = 30 } = req.query;

    const subscriptions = await SubscriptionModel.getUpcomingSubscriptions(
      userId,
      parseInt(days as string)
    );

    const payments = subscriptions.map((sub: any) => ({
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