import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors';
import { QuizAnswerInput } from '../../shared/schemas';

/**
 * SM-2 Spaced Repetition Algorithm.
 * Calculates next review date based on answer quality.
 */
function sm2Algorithm(
  quality: number, // 0-5 quality (0=fail, 5=perfect)
  previousInterval: number,
  previousEase: number
): { interval: number; easeFactor: number; nextReview: Date } {
  let interval: number;
  let easeFactor = previousEase;

  // Adjust ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  if (quality < 3) {
    // Failed - reset interval
    interval = 1;
  } else if (previousInterval === 0) {
    interval = 1;
  } else if (previousInterval === 1) {
    interval = 6;
  } else {
    interval = Math.round(previousInterval * easeFactor);
  }

  const nextReview = new Date(Date.now() + interval * 86400000);

  return { interval, easeFactor, nextReview };
}

export class QuizService {
  /**
   * Get questions due for review today (SRS-scheduled).
   */
  async getDueQuestions(userId: string, limit = 10) {
    // Get questions due for review
    const dueAttempts = await prisma.userQuizAttempt.findMany({
      where: {
        userId,
        srsNextReview: { lte: new Date() },
      },
      include: {
        question: true,
      },
      take: limit,
      orderBy: { srsNextReview: 'asc' },
    });

    // If not enough due questions, get new ones
    const dueQuestionIds = dueAttempts.map((a) => a.questionId);
    const remaining = limit - dueAttempts.length;

    let newQuestions: unknown[] = [];
    if (remaining > 0) {
      // Get questions user hasn't attempted yet
      const attemptedIds = await prisma.userQuizAttempt.findMany({
        where: { userId },
        select: { questionId: true },
        distinct: ['questionId'],
      });

      const attemptedQuestionIds = attemptedIds.map((a) => a.questionId);

      newQuestions = await prisma.quizQuestion.findMany({
        where: {
          id: { notIn: [...attemptedQuestionIds, ...dueQuestionIds] },
        },
        take: remaining,
        orderBy: { difficultyRating: 'asc' },
      });
    }

    return {
      dueForReview: dueAttempts.map((a) => a.question),
      newQuestions,
      totalDue: dueAttempts.length,
    };
  }

  /**
   * Submit answer, update SM-2 schedule, and award XP.
   */
  async submitAnswer(userId: string, input: QuizAnswerInput) {
    const question = await prisma.quizQuestion.findUnique({
      where: { id: input.questionId },
    });

    if (!question) {
      throw AppError.notFound('Question not found');
    }

    // Check if answer is correct
    const isCorrect = input.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    // Quality score: 5 if correct fast, 3 if correct slow, 1 if wrong
    let quality: number;
    if (isCorrect) {
      quality = input.timeTakenMs < 10000 ? 5 : 3;
    } else {
      quality = 1;
    }

    // Get previous attempt data for SM-2
    const previousAttempt = await prisma.userQuizAttempt.findFirst({
      where: { userId, questionId: input.questionId },
      orderBy: { attemptedAt: 'desc' },
    });

    const previousInterval = previousAttempt?.srsIntervalDays || 0;
    const previousEase = previousAttempt?.srsEaseFactor || 2.5;

    const { interval, easeFactor, nextReview } = sm2Algorithm(
      quality,
      previousInterval,
      previousEase
    );

    // Create attempt record
    const attempt = await prisma.userQuizAttempt.create({
      data: {
        userId,
        questionId: input.questionId,
        userAnswer: input.userAnswer,
        isCorrect,
        timeTakenMs: input.timeTakenMs,
        srsNextReview: nextReview,
        srsIntervalDays: interval,
        srsEaseFactor: easeFactor,
      },
    });

    // Update question difficulty rating using IRT
    const totalAttempts = await prisma.userQuizAttempt.count({
      where: { questionId: input.questionId },
    });
    const correctAttempts = await prisma.userQuizAttempt.count({
      where: { questionId: input.questionId, isCorrect: true },
    });

    const newDifficulty = 1 - (correctAttempts / totalAttempts);
    await prisma.quizQuestion.update({
      where: { id: input.questionId },
      data: { difficultyRating: newDifficulty },
    });

    // Award XP
    const xpEarned = isCorrect ? 5 : 1;
    await prisma.user.update({
      where: { id: userId },
      data: { xpTotal: { increment: xpEarned } },
    });

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      xpEarned,
      nextReview: nextReview.toISOString(),
      srsInterval: interval,
    };
  }
}

export const quizService = new QuizService();
