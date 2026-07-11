import { Router } from 'express';
import { getCalendarEvents, getUpcomingPayments } from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/events', authenticate, getCalendarEvents);
router.get('/upcoming', authenticate, getUpcomingPayments);

export default router;
