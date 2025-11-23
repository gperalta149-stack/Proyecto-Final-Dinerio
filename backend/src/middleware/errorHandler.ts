import type { Request, Response } from "express"

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (err: AppError, req: Request, res: Response): void => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  console.error("Error:", {
    statusCode,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  })
}
