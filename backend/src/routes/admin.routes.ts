import express from "express"
import * as adminController from "@/controllers/admin.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Get dashboard statistics (admin only)
router.get("/stats", authMiddleware, adminMiddleware, adminController.getDashboardStats)

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, adminController.getAllUsers)

export default router
