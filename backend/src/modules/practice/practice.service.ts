import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { AppError } from '../../shared/utils/errors';
import { io } from '../../server';

const MATCH_QUEUE_PREFIX = 'match_queue:';

export class PracticeService {
  /**
   * Add user to matching queue.
   * Format: match_queue:{language}:{level_range}
   */
  async findMatch(userId: string, language: string = 'en') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    const level = user.englishLevel;
    const queueKey = `${MATCH_QUEUE_PREFIX}${language}:${Math.floor(level / 2)}`;

    // Add user to Redis Sorted Set with timestamp as score
    const now = Date.now();
    await redis.zadd(queueKey, now, userId);

    // Look for a match (users within ±1 level group, added in last 10s)
    // For simplicity, we just look in the same key
    const potentialMatches = await redis.zrangebyscore(queueKey, now - 10000, now + 10000);
    
    const partnerId = potentialMatches.find(id => id !== userId);

    if (partnerId) {
      // Remove both from queue
      await redis.zrem(queueKey, userId, partnerId);

      // Create session
      const session = await prisma.practiceSession.create({
        data: {
          userId,
          partnerId,
          mode: 'HUMAN_HUMAN',
          language,
          level,
        },
        include: {
          user: true,
          partner: true,
        },
      });

      // Notify users via WebSocket
      io.to(`user:${userId}`).emit('match:found', {
        sessionId: session.id,
        partner: {
          id: session.partner!.id,
          displayName: session.partner!.displayName,
          avatarUrl: session.partner!.avatarUrl,
          avatarColor: session.partner!.avatarColor,
        },
      });

      io.to(`user:${partnerId}`).emit('match:found', {
        sessionId: session.id,
        partner: {
          id: session.user.id,
          displayName: session.user.displayName,
          avatarUrl: session.user.avatarUrl,
          avatarColor: session.user.avatarColor,
        },
      });

      return { matched: true, sessionId: session.id };
    }

    return { matched: false, status: 'queued' };
  }

  /**
   * Cancel matchmaking.
   */
  async cancelMatch(userId: string) {
    // We'd need to know which queue they were in, or search all queues.
    // For now, let's assume one main queue.
    const keys = await redis.keys(`${MATCH_QUEUE_PREFIX}*`);
    for (const key of keys) {
      await redis.zrem(key, userId);
    }
    return { success: true };
  }

  /**
   * Record a message in a session.
   */
  async addMessage(sessionId: string, message: { role: string; content: string; corrections?: any }) {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) return;

    const messages = (session.messages as any[]) || [];
    messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { messages },
    });
  }
}
