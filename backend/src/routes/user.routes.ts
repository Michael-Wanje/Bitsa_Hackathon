import express from "express"
import { body, param } from "express-validator"
import * as userController from "@/controllers/user.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Get all users (admin only)
router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers)

// Get user by ID
router.get("/:id", authMiddleware, userController.getUserById)

// Update user profile (only fullName, phoneNumber, bio can be changed)
router.put(
  "/:id",
  [
    param("id").notEmpty().withMessage("ID is required"),
    body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
    body("phoneNumber").optional().trim(),
    body("bio").optional().trim(),
  ],
  authMiddleware,
  userController.updateUserProfile,
)

// Delete user (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser)

// Delete own account (authenticated users only)
router.delete("/account/delete", authMiddleware, userController.deleteOwnAccount)

export default router
