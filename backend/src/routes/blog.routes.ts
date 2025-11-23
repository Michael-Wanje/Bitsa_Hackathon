import express from "express"
import { body, param } from "express-validator"
import * as blogController from "@/controllers/blog.controller"
import { authMiddleware, adminMiddleware } from "@/middleware/auth"

const router = express.Router()

// Get all approved blogs (public)
router.get("/", blogController.getAllBlogs)

// Get my blogs (authenticated users)
router.get("/my-blogs", authMiddleware, blogController.getMyBlogs)

// Get pending blogs (admin only)
router.get("/admin/pending", authMiddleware, adminMiddleware, blogController.getPendingBlogs)

// Get single blog (public)
router.get("/:id", blogController.getBlogById)

// Create blog (authenticated users - both admin and students)
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("excerpt").trim().notEmpty().withMessage("Excerpt is required"),
    body("category").trim().notEmpty().withMessage("Category is required"),
  ],
  authMiddleware,
  blogController.createBlog,
)

// Update blog (admin or author only)
router.put("/:id", [param("id").notEmpty().withMessage("ID is required")], authMiddleware, blogController.updateBlog)

// Delete blog (admin or author only)
router.delete("/:id", authMiddleware, blogController.deleteBlog)

// Approve blog (admin only)
router.post("/:id/approve", authMiddleware, adminMiddleware, blogController.approveBlog)

// Reject blog (admin only)
router.post("/:id/reject", authMiddleware, adminMiddleware, blogController.rejectBlog)

export default router
