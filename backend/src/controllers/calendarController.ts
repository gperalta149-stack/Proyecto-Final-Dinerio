import { Response } from 'express';
import { SubscriptionModel } from '../models/Subscription.js';
import { getOccurrenceDateInMonth, type BillingCycle } from '../services/BillingCycleService.js';
import type { AuthRequest } from '../types/index.js';

interface CalendarSubscriptionRow {
  id: string;
  name: string;
  amount: number;
  currency: string;
  startDate: string;
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

// Eventos del calendario: trae las suscripciones del usuario (activas o canceladas)
// y proyecta en qué mes toca cada cobro según su ciclo. Así las recurrentes aparecen todos
// los meses que corresponden, reutilizando la lógica de billingCycleService.
export const getCalendarEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { month, year } = req.query;

    // Trae TODAS las suscripciones activas/canceladas del usuario (sin
    // filtrar por fecha en la consulta SQL): la proyección de qué mes le
    // corresponde a cada una se calcula en el paso siguiente, con la misma
    // lógica de reconstrucción de ciclos que usa el reporte financiero
    // (billingCycleService, ver documentación técnica 5.3.9), para que
    // una suscripción recurrente aparezca en el calendario todos los
    // meses que efectivamente le corresponden según su ciclo --- y no solo
    // en el mes de su próxima fecha de cobro.
    const query = `
      SELECT
        s.id,
        s.name,
        s.amount,
        s.currency,
        s.start_date as "startDate",
        s.next_billing_date as "nextBillingDate",
        s.billing_cycle as "billingCycle",
        s.status,
        s.category_id as "categoryId",
        c.name as "category_name",
        c.color as "category_color"
      FROM subscriptions s
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.user_id = $1 AND s.status IN ('active', 'cancelled')
      ORDER BY s.next_billing_date ASC
    `;
    const result = await SubscriptionModel.findByQuery(query, [userId]);

    const targetMonth = month ? Number.parseInt(month as string) : new Date().getMonth() + 1;
    const targetYear = year ? Number.parseInt(year as string) : new Date().getFullYear();

    const events = (result as CalendarSubscriptionRow[])
      .map((sub) => {
        const occurrence = getOccurrenceDateInMonth(
          new Date(sub.startDate),
          new Date(sub.nextBillingDate),
          sub.billingCycle as BillingCycle,
          targetYear,
          targetMonth
        );
        if (!occurrence) return null;

        // Fecha local en formato YYYY-MM-DD, sin pasar por toISOString()
        // (que convierte a UTC y puede correr el día según el huso horario).
        // Formatea la fecha en hora local (YYYY-MM-DD) para que el día no cambie por zonas horarias.
        const y = occurrence.getFullYear();
        const m = String(occurrence.getMonth() + 1).padStart(2, '0');
        const d = String(occurrence.getDate()).padStart(2, '0');

        return {
          id: sub.id,
          title: sub.name,
          amount: sub.amount,
          currency: sub.currency,
          date: `${y}-${m}-${d}`,
          billing_cycle: sub.billingCycle,
          status: sub.status,
          category_id: sub.categoryId,
          category_name: sub.category_name,
          category_color: sub.category_color,
          type: 'payment' as const,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Próximos pagos: devuelve las suscripciones con cobro dentro de N días (default 30)
// usando un método del modelo Subscription (getUpcomingSubscriptions), aislado por userId.
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