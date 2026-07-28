import jwt, { type SignOptions } from "jsonwebtoken"
import type { JWTPayload } from "../types/index.js"

const JWT_SECRET = process.env.JWT_SECRET

const JWT_EXPIRES_IN =
  (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"]

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required")
}

export const generateToken = (
  userId: string,
  email: string,
  name?: string
): string => {
  return jwt.sign(
    { userId, email, name },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  )
}

export const verifyToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, JWT_SECRET)

  if (typeof decoded === "string") {
    throw new Error("Invalid token")
  }

  return decoded as JWTPayload
}