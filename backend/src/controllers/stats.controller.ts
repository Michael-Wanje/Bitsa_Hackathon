import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalBlogs, totalEvents] = await Promise.all([
      prisma.user.count(),
      prisma.blogPost.count({ where: { status: 'APPROVED' } }),
      prisma.event.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBlogs,
        totalEvents,
      },
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
};
