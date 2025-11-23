import { Router, Response } from "express"
import { authenticate } from "../middleware/auth.js"
import type { AuthRequest } from "../types/index.js"

const router = Router()

router.use(authenticate)

router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileType, base64Data, fileName } = req.body

    if (!fileType || !base64Data) {
      res.status(400).json({ error: "Tipo de archivo y datos son requeridos" })
      return
    }
    
    const fileUrl = `/uploads/${req.user!.userId}/${Date.now()}-${fileName || 'file'}`

    res.json({
      message: "Archivo subido exitosamente",
      fileUrl,
      fileType,
      fileName: fileName || `file-${Date.now()}`
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: "Error al subir archivo" })
  }
})

export default router