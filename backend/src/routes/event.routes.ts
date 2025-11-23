import express from "express"
import { body } from "express-validator"
import * as eventController from "@/controllers/event.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Get all approved events (public)
router.get("/", eventController.getAllEvents)

// Get my events (authenticated users)
router.get("/my-events", authMiddleware, eventController.getMyEvents)

// Get pending events (admin only)
router.get("/admin/pending", authMiddleware, adminMiddleware, eventController.getPendingEvents)

// Get single event (public)
router.get("/:id", eventController.getEventById)

// Create event (authenticated users - both admin and students)
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time")
      .matches(/^\d{2}:\d{2}$/)
      .withMessage("Time must be in HH:MM format"),
    body("location").trim().notEmpty().withMessage("Location is required"),
  ],
  authMiddleware,
  eventController.createEvent,
)

// Update event (author or admin only)
router.put("/:id", authMiddleware, eventController.updateEvent)

// Delete event (author or admin only)
router.delete("/:id", authMiddleware, eventController.deleteEvent)

// Approve event (admin only)
router.post("/:id/approve", authMiddleware, adminMiddleware, eventController.approveEvent)

// Reject event (admin only)
router.post("/:id/reject", authMiddleware, adminMiddleware, eventController.rejectEvent)

// Register for event (authenticated users)
router.post("/:id/register", authMiddleware, eventController.registerForEvent)

// Get user's registered events (authenticated users)
router.get("/user/registrations", authMiddleware, eventController.getUserRegistrations)

// Get event attendees (admin only)
router.get("/:id/attendees", authMiddleware, adminMiddleware, eventController.getEventAttendees)

export default router
