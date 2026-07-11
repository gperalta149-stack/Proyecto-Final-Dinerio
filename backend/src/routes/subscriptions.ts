import { Router } from "express"
import { body } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getStatsSummary,
  getDashboardStats,
} from "../controllers/subscriptionController.js"

const router = Router()

router.use(authenticate)

const createSubscriptionValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
  body("billing_cycle").isIn(["monthly", "yearly", "weekly", "quarterly"]).withMessage("Invalid billing cycle"),
  body("next_billing_date").isISO8601().withMessage("Valid next billing date is required"),
]

router.get("/", getSubscriptions)
router.get("/stats/summary", getStatsSummary)
router.get("/dashboard/stats", getDashboardStats)
router.get("/:id", getSubscriptionById)
router.post("/", createSubscriptionValidators, createSubscription)
router.put("/:id", updateSubscription)
router.delete("/:id", deleteSubscription)

export default router
