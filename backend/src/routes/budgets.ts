import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import {
  getBudgetForMonth,
  upsertBudget,
  deleteBudget,
} from "../controllers/budgetController.js"

const router = Router()
router.use(authenticate)

router.get("/:year/:month", getBudgetForMonth)
router.put("/:year/:month", upsertBudget)
router.delete("/:year/:month", deleteBudget)

export default router
