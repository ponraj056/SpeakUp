import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { AppError } from '../../shared/errors';
import { LessonFilterInput, CompleteLessonInput } from '../../shared/schemas';
import { CEFRLevel, LessonCategory, UserPlan } from '@prisma/client';

const CACHE_TTL = 300; // 5 minutes

export class LessonService {
  /**
   * List lessons with filtering, pagination, and caching.
   */
  async listLessons(filters: LessonFilterInput, userPlan: UserPlan) {
    const { category, level, page, limit, search } = filters;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: Record<string, unknown> = { isPublished: true };

    if (category) where.category = category as LessonCategory;
    if (level) where.level = level as CEFRLevel;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    // Free users can only see non-premium lessons
    if (userPlan === 'FREE') {
      where.isPremium = false;
    }

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          level: true,
          durationSeconds: true,
          thumbnailUrl: true,
          isPremium: true,
          xpReward: true,
          tags: true,
        },
      }),
      prisma.lesson.count({ where }),
    ]);

    return { lessons, total, page, limit };
  }

  /**
   * Get a single lesson by slug with full content.
   */
  async getLessonBySlug(slug: string, userId?: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
      include: {
        quizQuestions: {
          select: {
            id: true,
            type: true,
            level: true,
            prompt: true,
            options: true,
            audioUrl: true,
            difficultyRating: true,
          },
        },
      },
    });

    if (!lesson || !lesson.isPublished) {
      throw AppError.notFound('Lesson not found');
    }

    // Get user's progress for this lesson
    let progress = null;
    if (userId) {
      progress = await prisma.userLessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: lesson.id } },
      });
    }

    return { lesson, progress };
  }

  /**
   * Mark lesson as completed, award XP, update streak.
   */
  async completeLesson(
    userId: string,
    lessonId: string,
    input: CompleteLessonInput
  ) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw AppError.notFound('Lesson not found');
    }

    // Upsert lesson progress
    const progress = await prisma.userLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        status: 'COMPLETED',
        score: input.score || null,
        timeSpentSeconds: input.timeSpentSeconds,
        completedAt: new Date(),
        attemptCount: 1,
      },
      update: {
        status: 'COMPLETED',
        score: input.score || undefined,
        timeSpentSeconds: { increment: input.timeSpentSeconds },
        completedAt: new Date(),
        attemptCount: { increment: 1 },
      },
    });

    // Award XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakLastAt: true, streakDays: true },
    });

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const lastStreak = user?.streakLastAt?.toISOString().split('T')[0];

    let streakUpdate: Record<string, unknown> = {};

    // Update streak if not already counted today
    if (lastStreak !== today) {
      const yesterday = new Date(now.getTime() - 86400000)
        .toISOString()
        .split('T')[0];

      if (lastStreak === yesterday) {
        // Continue streak
        streakUpdate = {
          streakDays: { increment: 1 },
          streakLastAt: now,
        };
      } else {
        // Reset streak
        streakUpdate = {
          streakDays: 1,
          streakLastAt: now,
        };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: { increment: lesson.xpReward },
        lastSeenAt: now,
        ...streakUpdate,
      },
    });

    return {
      progress,
      xpEarned: lesson.xpReward,
    };
  }

  /**
   * Get user's progress across all lessons.
   */
  async getUserProgress(userId: string) {
    const [
      completedCount,
      totalLessons,
      recentProgress,
      user,
    ] = await Promise.all([
      prisma.userLessonProgress.count({
        where: { userId, status: 'COMPLETED' },
      }),
      prisma.lesson.count({ where: { isPublished: true } }),
      prisma.userLessonProgress.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        include: {
          lesson: {
            select: { title: true, slug: true, category: true, level: true },
          },
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          xpTotal: true,
          streakDays: true,
          streakLastAt: true,
          currentLevel: true,
        },
      }),
    ]);

    return {
      user,
      completedCount,
      totalLessons,
      completionRate: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0,
      recentProgress,
    };
  }
}

export const lessonService = new LessonService();
