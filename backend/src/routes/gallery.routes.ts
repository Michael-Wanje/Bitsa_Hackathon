import express from "express"
import { body, param } from "express-validator"
import * as galleryController from "@/controllers/gallery.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Get all photos (public)
router.get("/", galleryController.getAllPhotos)

// Get single photo (public)
router.get("/:id", galleryController.getPhotoById)

// Upload photo (admin only)
router.post(
  "/",
  [body("imageUrl").notEmpty().withMessage("Image URL is required")],
  authMiddleware,
  adminMiddleware,
  galleryController.uploadPhoto,
)

// Update photo caption (admin only)
router.put(
  "/:id",
  [param("id").notEmpty().withMessage("ID is required")],
  authMiddleware,
  adminMiddleware,
  galleryController.updatePhotoCaption,
)

// Delete photo (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, galleryController.deletePhoto)

export default router
