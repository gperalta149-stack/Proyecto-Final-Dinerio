import { Router } from "express"
import { body } from "express-validator"
import { authenticate } from "../middleware/auth.js"
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "../controllers/categoryController.js"

const router = Router()

router.use(authenticate)

// Usar el controlador que SÍ incluye subscription_count
router.get("/", getCategories)

router.post(
  "/",
  [body("name").trim().notEmpty(), body("color").matches(/^#[0-9A-F]{6}$/i)],
  createCategory
)

router.put("/:id", updateCategory)

router.delete("/:id", deleteCategory)

export default router