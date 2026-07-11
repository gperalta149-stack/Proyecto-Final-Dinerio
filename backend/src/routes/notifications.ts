import { Router } from "express"
import { authenticate } from "../middleware/auth.js"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  testGenerateNotifications,
} from "../controllers/notificationController.js"

const router = Router()

router.use(authenticate)

router.get("/", getNotifications)
router.get("/unread/count", getUnreadCount)
router.post("/", createNotification)
router.put("/:id/read", markAsRead)
router.put("/read-all", markAllAsRead)
router.delete("/:id", deleteNotification)
router.post("/test-generate", testGenerateNotifications)

export default router
