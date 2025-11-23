import type { Response } from "express"
import { validationResult } from "express-validator"
import { PrismaClient } from "@prisma/client"
import { hashPassword, comparePassword } from "@/utils/password"
import { generateToken } from "@/utils/jwt"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const register = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const err: AppError = new Error("Validation failed")
      err.statusCode = 400
      err.errors = errors.array()
      return next(err)
    }

    const { name, studentId, email, password, course, yearOfStudy } = req.body

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { studentId }] },
    })

    if (existingUser) {
      const err: AppError = new Error("Email or Student ID already registered")
      err.statusCode = 409
      return next(err)
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        fullName: name,
        studentId,
        email,
        password: hashedPassword,
        course,
        yearOfStudy,
      },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          studentId: user.studentId,
          course: user.course,
          yearOfStudy: user.yearOfStudy,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          role: user.role,
        },
        token,
      },
      message: "User registered successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const err: AppError = new Error("Validation failed")
      err.statusCode = 400
      err.errors = errors.array()
      return next(err)
    }

    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      const err: AppError = new Error("Invalid email or password")
      err.statusCode = 401
      return next(err)
    }

    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      const err: AppError = new Error("Invalid email or password")
      err.statusCode = 401
      return next(err)
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          studentId: user.studentId,
          course: user.course,
          yearOfStudy: user.yearOfStudy,
          phoneNumber: user.phoneNumber,
          bio: user.bio,
          role: user.role,
        },
        token,
      },
      message: "Login successful",
    })
  } catch (error) {
    next(error)
  }
}

export const getCurrentUser = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
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
      message: "User fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const err: AppError = new Error("Validation failed")
      err.statusCode = 400
      err.errors = errors.array()
      return next(err)
    }

    const { currentPassword, newPassword } = req.body
    const userId = req.user?.userId

    if (!userId) {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 401
      return next(err)
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      const err: AppError = new Error("User not found")
      err.statusCode = 404
      return next(err)
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password)
    if (!isPasswordValid) {
      const err: AppError = new Error("Current password is incorrect")
      err.statusCode = 401
      return next(err)
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({
      success: true,
      data: null,
      message: "Password changed successfully",
    })
  } catch (error) {
    next(error)
  }
}
