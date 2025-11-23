import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const sendContactMessage = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      const err: AppError = new Error("All fields are required")
      err.statusCode = 400
      return next(err)
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    })

    res.status(201).json({
      success: true,
      data: { message: contactMessage },
      message: "Message sent successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getAllContactMessages = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 20, isRead = "" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (isRead === "true") {
      where.isRead = true
    } else if (isRead === "false") {
      where.isRead = false
    }

    const [messages, total, unreadCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { sentAt: "desc" },
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.count({ where: { isRead: false } }),
    ])

    res.json({
      success: true,
      data: {
        messages,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Contact messages fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const markMessageAsRead = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    })

    res.json({
      success: true,
      data: { message },
      message: "Message marked as read",
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      const err: AppError = new Error("Message not found")
      err.statusCode = 404
      return next(err)
    }
    next(error)
  }
}

export const deleteContactMessage = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    await prisma.contactMessage.delete({ where: { id } })

    res.json({
      success: true,
      data: null,
      message: "Message deleted successfully",
    })
  } catch (error: any) {
    if (error.code === "P2025") {
      const err: AppError = new Error("Message not found")
      err.statusCode = 404
      return next(err)
    }
    next(error)
  }
}
