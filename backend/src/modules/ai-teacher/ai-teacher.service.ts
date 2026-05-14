import { prisma } from '../../config/database';
import { aiService } from '../ai/ai.service';
import { AppError } from '../../shared/errors';
import { CEFRLevel } from '@prisma/client';

export class AITeacherService {
  /**
   * Generate a weekly learning plan for a user.
   */
  async generateLearningPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        practiceSessions: { take: 10, orderBy: { createdAt: 'desc' } },
        mistakeNotebook: { take: 20 },
      },
    });

    if (!user) throw AppError.notFound('User not found');

    // Identify weak areas from mistake notebook and sessions
    const weakAreas = this.analyzeWeakAreas(user);

    // AI logic to build plan (Mocked for now)
    const plan = {
      userId,
      weekStarting: new Date().toISOString(),
      goal: `Reach ${user.currentLevel === 'C1' ? 'Fluency' : 'next CEFR level'}`,
      dailyLessons: [
        { day: 'Monday', topic: 'Present Perfect vs Past Simple', type: 'GRAMMAR' },
        { day: 'Tuesday', topic: 'The "th" sound', type: 'PRONUNCIATION' },
        { day: 'Wednesday', topic: 'Phrasal Verbs for Business', type: 'VOCABULARY' },
        // ... more days
      ],
      weakAreas,
    };

    return plan;
  }

  private analyzeWeakAreas(user: any) {
    const types = user.mistakeNotebook.map((m: any) => m.errorType);
    const counts = types.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }

  /**
   * Start a live teaching session with Sage (AI Teacher).
   */
  async startLiveLesson(userId: string, concept: string) {
    // Logic for Sage's persona and interactive loop
  }

  /**
   * Generate weekly PDF progress report.
   */
  async generateWeeklyReport(userId: string) {
    // Logic to aggregate scores and generate PDF (would use a library like PDFKit or Puppeteer)
    return { reportUrl: `https://cdn.peerup.app/reports/${userId}/week-24.pdf` };
  }
}

export const aiTeacherService = new AITeacherService();
