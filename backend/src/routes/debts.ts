import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getDebts,
  getDebtsSummary,
  createManualDebt,
  markDebtAsPaid,
  postponeDebt,
  deleteDebt,
} from '../controllers/debtController.js';
const router = Router();
router.use(authenticate);
router.get('/',           getDebts);
router.get('/summary',    getDebtsSummary);
router.post('/',          createManualDebt);
router.put('/:id/pay',    markDebtAsPaid);
router.put('/:id/postpone', postponeDebt);
router.delete('/:id',     deleteDebt);
export default router;
