import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"

const prisma = new PrismaClient()

export const getDashboardStats = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const [totalUsers, totalBlogs, totalEvents, totalPhotos, totalRegistrations, recentMessages] = await Promise.all([
      prisma.user.count(),
      prisma.blogPost.count(),
      prisma.event.count(),
      prisma.galleryPhoto.count(),
      prisma.eventRegistration.count(),
      prisma.contactMessage.findMany({
        take: 5,
        orderBy: { sentAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          sentAt: true,
          isRead: true,
        },
      }),
    ])

    const upcomingEvents = await prisma.event.findMany({
      where: { date: { gte: new Date() } },
      take: 5,
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        date: true,
        _count: { select: { registrations: true } },
      },
    })

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBlogs,
          totalEvents,
          totalPhotos,
          totalRegistrations,
        },
        recentMessages,
        upcomingEvents: upcomingEvents.map((e) => ({
          ...e,
          attendeeCount: e._count.registrations,
          _count: undefined,
        })),
      },
      message: "Dashboard statistics fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getAllUsers = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 20, search = "", role = "" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search as string, mode: "insensitive" as any } },
        { email: { contains: search as string, mode: "insensitive" as any } },
        { studentId: { contains: search as string, mode: "insensitive" as any } },
      ]
    }

    if (role && role !== "All") {
      where.role = role as string
    }

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
        orderBy: { createdAt: "desc" },
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
