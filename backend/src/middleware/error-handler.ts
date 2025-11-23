import type { Request, Response, NextFunction } from "express"

export interface AppError extends Error {
  statusCode?: number
  errors?: any
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  console.error(`[Error] ${statusCode}: ${message}`)

  res.status(statusCode).json({
    success: false,
    error: message,
    message: statusCode === 500 ? "An unexpected error occurred" : message,
    ...(process.env.NODE_ENV === "development" && { details: err.errors }),
  })
}
