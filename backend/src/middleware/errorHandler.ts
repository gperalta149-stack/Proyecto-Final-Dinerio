import type { Request, Response } from "express"

// Interfaz que extiende Error con datos que permiten clasificar errores operativos (statusCode, isOperational).
export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

// Middleware centralizado de errores: captura cualquier error y responde con el código HTTP y mensaje adecuado.
// En desarrollo incluye el stack trace para facilitar el debug; en producción lo oculta.
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

// Middleware de rutas no encontradas: si ningún ruteador responde la URL, devuelve 404 con la ruta solicitada.
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`,
  })
}
