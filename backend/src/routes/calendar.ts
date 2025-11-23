import { Router } from 'express';
import { getCalendarEvents, getUpcomingPayments } from '../controllers/calendarController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/events', authenticate, getCalendarEvents);
router.get('/upcoming', authenticate, getUpcomingPayments);

export default router;