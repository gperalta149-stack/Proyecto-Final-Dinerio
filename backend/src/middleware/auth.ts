import type { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import type { AuthRequest, JWTPayload } from "../types/index.js"

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
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