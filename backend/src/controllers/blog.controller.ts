import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const getAllBlogs = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Public endpoint - show only approved blogs
    const where: any = {
      status: "APPROVED" as any,
      ...(search && {
        OR: [
          { title: { contains: search as string, mode: "insensitive" as any } },
          { excerpt: { contains: search as string, mode: "insensitive" as any } },
        ],
      }),
      ...(category && category !== "All" && { category: category as string }),
    }

    const [blogs, total, categories] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limitNum,
        include: { author: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({
        where: { status: "APPROVED" as any },
        distinct: ["category"],
        select: { category: true },
      }),
    ])

    const uniqueCategories = ["All", ...new Set(categories.map((c) => c.category))]

    res.json({
      success: true,
      data: {
        blogs,
        categories: uniqueCategories,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Blogs fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getBlogById = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const blog = await prisma.blogPost.findUnique({
      where: { id },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    })

    if (!blog) {
      const err: AppError = new Error("Blog post not found")
      err.statusCode = 404
      return next(err)
    }

    res.json({
      success: true,
      data: { blog },
      message: "Blog fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const createBlog = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { title, content, excerpt, thumbnail, category } = req.body
    const isAdminPost = req.user?.role === "ADMIN"

    const blog = await prisma.blogPost.create({
      data: {
        title,
        content,
        excerpt,
        thumbnail,
        category,
        authorId: req.user?.userId!,
        status: isAdminPost ? ("APPROVED" as any) : ("PENDING" as any),
        isAdminPost,
      },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    })

    res.status(201).json({
      success: true,
      data: { blog },
      message: isAdminPost ? "Blog published successfully" : "Blog submitted for approval",
    })
  } catch (error) {
    next(error)
  }
}

export const updateBlog = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params
    const { title, content, excerpt, thumbnail, category } = req.body

    const blog = await prisma.blogPost.findUnique({ where: { id } })

    if (!blog) {
      const err: AppError = new Error("Blog post not found")
      err.statusCode = 404
      return next(err)
    }

    if (blog.authorId !== req.user?.userId && req.user?.role !== "ADMIN") {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 403
      return next(err)
    }

    // Students can only edit pending or rejected blogs
    if (req.user?.role !== "ADMIN" && blog.status === "APPROVED") {
      const err: AppError = new Error("Cannot edit approved blog posts")
      err.statusCode = 403
      return next(err)
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt && { excerpt }),
        ...(thumbnail && { thumbnail }),
        ...(category && { category }),
      },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    })

    res.json({
      success: true,
      data: { blog: updatedBlog },
      message: "Blog updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const deleteBlog = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const blog = await prisma.blogPost.findUnique({ where: { id } })

    if (!blog) {
      const err: AppError = new Error("Blog post not found")
      err.statusCode = 404
      return next(err)
    }

    if (blog.authorId !== req.user?.userId && req.user?.role !== "ADMIN") {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 403
      return next(err)
    }

    // Students can only delete pending or rejected blogs
    if (req.user?.role !== "ADMIN" && blog.status === "APPROVED") {
      const err: AppError = new Error("Cannot delete approved blog posts")
      err.statusCode = 403
      return next(err)
    }

    await prisma.blogPost.delete({ where: { id } })

    res.json({
      success: true,
      data: null,
      message: "Blog deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getMyBlogs = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId
    const { page = 1, limit = 10 } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { authorId: userId },
        skip,
        take: limitNum,
        include: { author: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.blogPost.count({ where: { authorId: userId } }),
    ])

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Your blogs fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const approveBlog = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const blog = await prisma.blogPost.findUnique({ where: { id } })

    if (!blog) {
      const err: AppError = new Error("Blog post not found")
      err.statusCode = 404
      return next(err)
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id },
      data: { status: "APPROVED" as any },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    })

    res.json({
      success: true,
      data: { blog: updatedBlog },
      message: "Blog approved successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const rejectBlog = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const blog = await prisma.blogPost.findUnique({ where: { id } })

    if (!blog) {
      const err: AppError = new Error("Blog post not found")
      err.statusCode = 404
      return next(err)
    }

    const updatedBlog = await prisma.blogPost.update({
      where: { id },
      data: { status: "REJECTED" as any },
      include: { author: { select: { id: true, fullName: true, email: true } } },
    })

    res.json({
      success: true,
      data: { blog: updatedBlog },
      message: "Blog rejected successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingBlogs = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const [blogs, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PENDING" as any },
        skip,
        take: limitNum,
        include: { author: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.blogPost.count({ where: { status: "PENDING" as any } }),
    ])

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Pending blogs fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}
