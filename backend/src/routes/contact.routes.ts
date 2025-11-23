import express from "express"
import { body } from "express-validator"
import * as contactController from "@/controllers/contact.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Send contact message (public)
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  contactController.sendContactMessage,
)

// Get all contact messages (admin only)
router.get("/", authMiddleware, adminMiddleware, contactController.getAllContactMessages)

// Mark message as read (admin only)
router.patch("/:id/read", authMiddleware, adminMiddleware, contactController.markMessageAsRead)

// Delete contact message (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, contactController.deleteContactMessage)

export default router
