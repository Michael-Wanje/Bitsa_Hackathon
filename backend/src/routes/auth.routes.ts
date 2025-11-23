import express from "express"
import { body } from "express-validator"
import * as authController from "@/controllers/auth.controller"
import { authMiddleware } from "@/middleware/auth"

const router = express.Router()

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("studentId").trim().notEmpty().withMessage("Student ID is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("course").trim().notEmpty().withMessage("Course is required"),
    body("yearOfStudy").isInt({ min: 1, max: 4 }).withMessage("Year of study must be between 1-4"),
  ],
  authController.register,
)

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login,
)

router.get("/me", authMiddleware, authController.getCurrentUser)

router.post(
  "/change-password",
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 8 }).withMessage("New password must be at least 8 characters"),
  ],
  authMiddleware,
  authController.changePassword,
)

export default router
