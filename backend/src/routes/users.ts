import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  changePassword,
} from "../controllers/userController.js"

const router = Router()

router.use(authenticate)

router.get("/profile", getUserProfile)
router.put("/profile", updateUserProfile)
router.put("/settings", updateUserSettings)
router.put("/password", changePassword)
// Alias: el frontend (userService.updateBudget) pega acá con { monthly_budget }.
// Reutiliza updateUserProfile porque ya soporta ese campo via COALESCE.
router.put("/budget", updateUserProfile)

export default router
