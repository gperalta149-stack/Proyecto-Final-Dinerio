import { Router } from "express"
import { register, login, getProfile, updateBudget, requestPasswordReset, checkAvailability } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = Router()

// Rutas públicas
router.post("/register", register)
router.post("/login", login)
router.post("/password-reset", requestPasswordReset)
router.get("/check-availability", checkAvailability)

// Rutas protegidas
router.get("/profile", authenticate, getProfile)
router.put("/budget", authenticate, updateBudget)

export default router
