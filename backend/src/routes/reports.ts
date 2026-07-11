import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import {
  exportSubscriptionsCSV,
  getFinancialReport,
  getMonthlyEvolution,
} from "../controllers/reportController.js"

const router = Router()

router.use(authenticate)

router.get("/export/csv", exportSubscriptionsCSV)
router.get("/financial", getFinancialReport)
router.get("/monthly-evolution", getMonthlyEvolution)

export default router
