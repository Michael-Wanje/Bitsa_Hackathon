import type { Request, Response, NextFunction } from "express"
import { verifyToken, type JWTPayload } from "@/utils/jwt"

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ success: false, error: "Unauthorized", message: "No token provided" })
    }

    const user = verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, error: "Unauthorized", message: "Invalid or expired token" })
  }
}

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, error: "Forbidden", message: "Admin access required" })
  }
  next()
}
