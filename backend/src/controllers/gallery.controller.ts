import type { Response } from "express"
import { PrismaClient } from "@prisma/client"
import type { AuthRequest } from "@/middleware/auth"
import type { AppError } from "@/middleware/error-handler"

const prisma = new PrismaClient()

export const getAllPhotos = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { page = 1, limit = 12, eventId = "", year = "" } = req.query
    const pageNum = Number.parseInt(page as string)
    const limitNum = Number.parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (eventId && eventId !== "All") {
      where.eventId = eventId as string
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01`)
      const endOfYear = new Date(`${Number.parseInt(year as string) + 1}-01-01`)
      where.uploadedAt = {
        gte: startOfYear,
        lt: endOfYear,
      }
    }

    const [photos, total, events, years] = await Promise.all([
      prisma.galleryPhoto.findMany({
        where,
        skip,
        take: limitNum,
        include: { event: { select: { id: true, title: true } } },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.galleryPhoto.count({ where }),
      prisma.event.findMany({
        distinct: ["id"],
        select: { id: true, title: true },
      }),
      prisma.galleryPhoto.findMany({
        distinct: ["uploadedAt"],
        select: { uploadedAt: true },
      }),
    ])

    const uniqueYears = [...new Set(years.map((p) => new Date(p.uploadedAt).getFullYear()))].sort((a, b) => b - a)

    res.json({
      success: true,
      data: {
        photos,
        filters: {
          events: [{ id: "All", title: "All Events" }, ...events],
          years: uniqueYears,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: "Photos fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const getPhotoById = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const photo = await prisma.galleryPhoto.findUnique({
      where: { id },
      include: { event: { select: { id: true, title: true } } },
    })

    if (!photo) {
      const err: AppError = new Error("Photo not found")
      err.statusCode = 404
      return next(err)
    }

    res.json({
      success: true,
      data: { photo },
      message: "Photo fetched successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const uploadPhoto = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { imageUrl, caption, eventId } = req.body

    if (!imageUrl) {
      const err: AppError = new Error("Image URL is required")
      err.statusCode = 400
      return next(err)
    }

    const photo = await prisma.galleryPhoto.create({
      data: {
        imageUrl,
        caption: caption || null,
        eventId: eventId || null,
      },
      include: { event: { select: { id: true, title: true } } },
    })

    res.status(201).json({
      success: true,
      data: { photo },
      message: "Photo uploaded successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const updatePhotoCaption = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params
    const { caption } = req.body

    const photo = await prisma.galleryPhoto.findUnique({ where: { id } })

    if (!photo) {
      const err: AppError = new Error("Photo not found")
      err.statusCode = 404
      return next(err)
    }

    const updatedPhoto = await prisma.galleryPhoto.update({
      where: { id },
      data: { caption },
      include: { event: { select: { id: true, title: true } } },
    })

    res.json({
      success: true,
      data: { photo: updatedPhoto },
      message: "Photo caption updated successfully",
    })
  } catch (error) {
    next(error)
  }
}

export const deletePhoto = async (req: AuthRequest, res: Response, next: any) => {
  try {
    const { id } = req.params

    const photo = await prisma.galleryPhoto.findUnique({ where: { id } })

    if (!photo) {
      const err: AppError = new Error("Photo not found")
      err.statusCode = 404
      return next(err)
    }

    await prisma.galleryPhoto.delete({ where: { id } })

    res.json({
      success: true,
      data: null,
      message: "Photo deleted successfully",
    })
  } catch (error) {
    next(error)
  }
}
