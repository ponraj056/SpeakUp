import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors';
import { UpdateLessonInput } from '../../shared/schemas';

export class AdminService {
  /**
   * Get platform KPIs.
   */
  async getMetrics() {
    const now = new Date();
    const todayStart = new Date(now.toISOString().split('T')[0]);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeToday,
      activeMonth,
      proUsers,
      totalLessons,
      completedLessons,
      totalAISessions,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { lastSeenAt: { gte: todayStart } },
      }),
      prisma.user.count({
        where: { lastSeenAt: { gte: monthStart } },
      }),
      prisma.user.count({
        where: { plan: 'PRO' },
      }),
      prisma.lesson.count(),
      prisma.userLessonProgress.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.aISession.count(),
      prisma.user.count({
        where: { createdAt: { gte: monthStart } },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        dau: activeToday,
        mau: activeMonth,
        proUsers,
        newThisMonth: recentSignups,
      },
      content: {
        totalLessons,
        completedLessons,
        totalAISessions,
        completionRate: totalLessons > 0 ? ((completedLessons / (totalUsers * totalLessons)) * 100).toFixed(1) : '0',
      },
      revenue: {
        proUsers,
        estimatedMRR: proUsers * 8.99,
      },
    };
  }

  /**
   * List users with filters for admin.
   */
  async listUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          currentLevel: true,
          role: true,
          plan: true,
          xpTotal: true,
          streakDays: true,
          isActive: true,
          lastSeenAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Publish/unpublish a lesson.
   */
  async updateLesson(lessonId: string, data: UpdateLessonInput) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw AppError.notFound('Lesson not found');

    return prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
  }

  /**
   * Log admin action.
   */
  async logAction(
    actorId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string
  ) {
    await prisma.auditLog.create({
      data: { actorId, action, targetType, targetId, metadata, ipAddress },
    });
  }
}

export const adminService = new AdminService();
