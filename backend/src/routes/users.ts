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
router.put("/budget", updateUserProfile)

export default router
