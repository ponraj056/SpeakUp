import { prisma } from '../../lib/prisma';
import { Queue, Worker } from 'bullmq';
import { redis } from '../../lib/redis';

export class GamificationService {
  private leagueQueue: Queue;

  constructor() {
    this.leagueQueue = new Queue('league-reset', { connection: redis });
  }

  /**
   * Award XP and Trophies to a user.
   */
  async awardRewards(userId: string, type: 'MESSAGE' | 'EXERCISE' | 'SESSION' | 'LESSON' | 'DAILY_FIRST') {
    const rewards = {
      MESSAGE: { xp: 5, trophies: 0 },
      EXERCISE: { xp: 10, trophies: 0 },
      SESSION: { xp: 50, trophies: 5 },
      LESSON: { xp: 20, trophies: 0 },
      DAILY_FIRST: { xp: 100, trophies: 0 },
    };

    const { xp, trophies } = rewards[type];

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xpTotal: { increment: xp },
      },
    });

    if (trophies > 0) {
      const today = new Date();
      const weekStart = this.getWeekStart(today);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      await prisma.leagueEntry.upsert({
        where: {
          userId_weekStart: { userId, weekStart },
        },
        update: {
          trophies: { increment: trophies },
        },
        create: {
          userId,
          weekStart,
          weekEnd,
          tier: 'BRONZE',
          trophies,
        },
      });
    }

    await this.checkStreak(userId);

    return { xp, trophies, newTotalXp: user.xpTotal };
  }

  /**
   * Update streak logic.
   */
  private async checkStreak(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastPractice = user.streakLastAt ? new Date(user.streakLastAt) : null;
    if (lastPractice) lastPractice.setHours(0, 0, 0, 0);

    if (!lastPractice || lastPractice.getTime() < today.getTime()) {
      // It's a new day of practice
      const isConsecutive = lastPractice && (today.getTime() - lastPractice.getTime() <= 86400000);
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          streakDays: isConsecutive ? { increment: 1 } : 1,
          streakLastAt: new Date(),
        },
      });
    }
  }

  private getWeekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  /**
   * League reset job (Every Monday).
   */
  async processLeagueReset() {
    // 1. Get all active league entries for the past week
    // 2. Sort by trophies within each tier
    // 3. Promote top 5, demote bottom 3
    // 4. Create new week entries
    // (Implementation omitted for brevity, but this is where BullMQ worker logic goes)
  }
}
