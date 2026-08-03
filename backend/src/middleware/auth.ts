import type { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { AuthRequest, JWTPayload } from "../types/index.js"

// Middleware de autenticación: protege las rutas privadas verificando el token JWT antes de llegar al controlador.
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extrae el token del header Authorization en formato "Bearer <token>". Si no existe o no es válido, responde 401.
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" })
      return
    }
    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      res.status(500).json({ error: "JWT secret not configured" })
      return
    }
// Verifica la firma del token con el secreto JWT. Si es válido, deja el usuario decodificado en req.user
// para que cada controlador pueda filtrar por userId. El try/catch devuelve 401 ante token inválido o vencido.
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    }
    next()
  } catch (error) {
    console.error("Authentication error:", error)
    res.status(401).json({ error: "Invalid or expired token" })
  }
}
