import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const getAllEvents = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 10, filter = "all" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum
    const now = new Date()

    const where: any = {
      status: "APPROVED" as any,
    }

    if (filter === "upcoming") {
      where.date = { gte: now }
    } else if (filter === "past") {
      where.date = { lt: now }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.event.count({ where }),
    ])

    res.json({
      success: true,
      data: {
        events: events.map((e) => ({
          ...e,
          attendeeCount: e._count.registrations,
          _count: undefined,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Events fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getEventById = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        _count: { select: { registrations: true } },
      },
    })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    res.json({
      success: true,
      data: {
        event: {
          ...event,
          attendeeCount: event._count.registrations,
          _count: undefined,
        },
      },
      message: "Event fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const createEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { title, description, date, time, endTime, location, imageUrl } = req.body
    const isAdminPost = req.user?.role === "ADMIN"

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        endTime: endTime || null,
        location,
        imageUrl,
        authorId: req.user?.userId!,
        status: isAdminPost ? ("APPROVED" as any) : ("PENDING" as any),
        isAdminPost,
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        _count: { select: { registrations: true } },
      },
    })

    res.status(201).json({
      success: true,
      data: {
        event: {
          ...event,
          attendeeCount: event._count.registrations,
          _count: undefined,
        },
      },
      message: isAdminPost ? "Event published successfully" : "Event submitted for approval",
    })
  } catch (error) {
    next(error)
  }
}

export const updateEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params
    const { title, description, date, time, endTime, location, imageUrl } = req.body

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    if (event.authorId !== req.user?.userId && req.user?.role !== "ADMIN") {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 403
      return next(err)
    }

    // Students can only edit pending or rejected events
    if (req.user?.role !== "ADMIN" && event.status === "APPROVED") {
      const err: AppError = new Error("Cannot edit approved events")
      err.statusCode = 403
      return next(err)
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(endTime !== undefined && { endTime: endTime || null }),
        ...(location && { location }),
        ...(imageUrl && { imageUrl }),
      },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        _count: { select: { registrations: true } },
      },
    })

    res.json({
      success: true,
      data: {
        event: {
          ...updatedEvent,
          attendeeCount: updatedEvent._count.registrations,
          _count: undefined,
        },
      },
      message: "Event updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const deleteEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    if (event.authorId !== req.user?.userId && req.user?.role !== "ADMIN") {
      const err: AppError = new Error("Unauthorized")
      err.statusCode = 403
      return next(err)
    }

    // Students can only delete pending or rejected events
    if (req.user?.role !== "ADMIN" && event.status === "APPROVED") {
      const err: AppError = new Error("Cannot delete approved events")
      err.statusCode = 403
      return next(err)
    }

    await prisma.event.delete({ where: { id } })

    res.json({
      success: true,
      data: null,
      message: "Event deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getMyEvents = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const userId = req.user?.userId
    const { page = 1, limit = 10 } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { authorId: userId },
        skip,
        take: limitNum,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count({ where: { authorId: userId } }),
    ])

    res.json({
      success: true,
      data: {
        events: events.map((e) => ({
          ...e,
          attendeeCount: e._count.registrations,
          _count: undefined,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Your events fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const approveEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: "APPROVED" as any },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        _count: { select: { registrations: true } },
      },
    })

    res.json({
      success: true,
      data: {
        event: {
          ...updatedEvent,
          attendeeCount: updatedEvent._count.registrations,
          _count: undefined,
        },
      },
      message: "Event approved successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const rejectEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: { status: "REJECTED" as any },
      include: {
        author: { select: { id: true, fullName: true, email: true } },
        _count: { select: { registrations: true } },
      },
    })

    res.json({
      success: true,
      data: {
        event: {
          ...updatedEvent,
          attendeeCount: updatedEvent._count.registrations,
          _count: undefined,
        },
      },
      message: "Event rejected successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingEvents = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { status: "PENDING" as any },
        skip,
        take: limitNum,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
          _count: { select: { registrations: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.event.count({ where: { status: "PENDING" as any } }),
    ])

    res.json({
      success: true,
      data: {
        events: events.map((e) => ({
          ...e,
          attendeeCount: e._count.registrations,
          _count: undefined,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Pending events fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const registerForEvent = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: {
        userId_eventId: {
          userId: req.user?.userId!,
          eventId: id,
        },
      },
    })

    if (existingRegistration) {
      const err: AppError = new Error("Already registered for this event")
      err.statusCode = 409
      return next(err)
    }

    await prisma.eventRegistration.create({
      data: {
        userId: req.user?.userId!,
        eventId: id,
      },
    })

    res.status(201).json({
      success: true,
      data: null,
      message: "Registered for event successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getUserRegistrations = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user?.userId! },
      include: {
        event: true,
      },
      orderBy: {
        registeredAt: 'desc',
      },
    })

    res.json({
      success: true,
      data: {
        registrations: registrations.map((r) => ({
          id: r.id,
          registeredAt: r.registeredAt,
          event: r.event,
        })),
      },
      message: "User registrations fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getEventAttendees = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const event = await prisma.event.findUnique({ where: { id } })

    if (!event) {
      const err: AppError = new Error("Event not found")
      err.statusCode = 404
      return next(err)
    }

    const attendees = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            studentId: true,
            course: true,
          },
        },
      },
    })

    res.json({
      success: true,
      data: {
        attendees: attendees.map((a) => a.user),
        totalAttendees: attendees.length,
      },
      message: "Event attendees fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}
