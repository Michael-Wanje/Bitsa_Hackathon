import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const getAllUsers = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where = search
      ? {
          OR: [
            { fullName: { contains: search as string, mode: "insensitive" as any } },
            { email: { contains: search as string, mode: "insensitive" as any } },
            { studentId: { contains: search as string, mode: "insensitive" as any } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          fullName: true,
          studentId: true,
          course: true,
          yearOfStudy: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Users fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        course: true,
        yearOfStudy: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      const err: AppError = new Error("User not found")
      err.statusCode = 404
      return next(err)
    }

    res.json({
      success: true,
      data: { user },
      message: "User fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const updateUserProfile = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params
    const { fullName, phoneNumber, bio } = req.body

    // Users can only update their own profile unless they're admin
    if (req.user?.userId !== id && req.user?.role !== "ADMIN") {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 403
      return next(err)
    }

    // Only allow updating these specific fields (not email, studentId, course, yearOfStudy)
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        studentId: true,
        course: true,
        yearOfStudy: true,
        phoneNumber: true,
        bio: true,
        role: true,
      },
    })

    res.json({
      success: true,
      data: { user },
      message: "User profile updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    await prisma.user.delete({ where: { id } })

    res.json({
      success: true,
      data: null,
      message: "User deleted successfully",
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      const err: AppError = new Error("User not found")
      err.statusCode = 404
      return next(err)
    }
    next(error)
  }
}

export const deleteOwnAccount = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 401
      return next(err)
    }

    // Delete the user account
    await prisma.user.delete({ where: { id: userId } })

    res.json({
      success: true,
      data: null,
      message: "Account deleted successfully",
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      const err: AppError = new Error("User not found")
      err.statusCode = 404
      return next(err)
    }
    next(error)
  }
}
