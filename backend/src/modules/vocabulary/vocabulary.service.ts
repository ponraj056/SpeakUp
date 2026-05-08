import { prisma } from '../../config/database';
import { AppError } from '../../shared/errors';
import { AddVocabularyInput } from '../../shared/schemas';

export class VocabularyService {
  /**
   * Get user's vocabulary list with SRS info.
   */
  async getVocabulary(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [words, total] = await Promise.all([
      prisma.userVocabulary.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userVocabulary.count({ where: { userId } }),
    ]);

    return { words, total, page, limit };
  }

  /**
   * Add a word to vocabulary.
   */
  async addWord(userId: string, input: AddVocabularyInput) {
    const existing = await prisma.userVocabulary.findUnique({
      where: { userId_word: { userId, word: input.word.toLowerCase() } },
    });

    if (existing) {
      throw AppError.conflict('Word already in vocabulary');
    }

    const word = await prisma.userVocabulary.create({
      data: {
        userId,
        word: input.word.toLowerCase(),
        definition: input.definition,
        exampleSentence: input.exampleSentence,
        srsNextReview: new Date(Date.now() + 86400000), // tomorrow
      },
    });

    return word;
  }

  /**
   * Get words due for SRS review.
   */
  async getDueReviews(userId: string) {
    const words = await prisma.userVocabulary.findMany({
      where: {
        userId,
        srsNextReview: { lte: new Date() },
      },
      orderBy: { srsNextReview: 'asc' },
      take: 20,
    });

    return words;
  }

  /**
   * Update word review (SRS).
   */
  async reviewWord(userId: string, wordId: string, remembered: boolean) {
    const word = await prisma.userVocabulary.findUnique({
      where: { id: wordId, userId },
    });

    if (!word) {
      throw AppError.notFound('Word not found');
    }

    let nextInterval: number;
    let newConfidence: number;

    if (remembered) {
      // Increase interval
      nextInterval = Math.max(1, (word.reviewCount + 1) * 2);
      newConfidence = Math.min(1, word.confidence + 0.15);
    } else {
      // Reset interval
      nextInterval = 1;
      newConfidence = Math.max(0, word.confidence - 0.2);
    }

    const updated = await prisma.userVocabulary.update({
      where: { id: wordId },
      data: {
        reviewCount: { increment: 1 },
        confidence: newConfidence,
        srsNextReview: new Date(Date.now() + nextInterval * 86400000),
      },
    });

    return updated;
  }

  /**
   * Delete a word from vocabulary.
   */
  async deleteWord(userId: string, wordId: string) {
    await prisma.userVocabulary.deleteMany({
      where: { id: wordId, userId },
    });
    return { message: 'Word removed' };
  }
}

export const vocabularyService = new VocabularyService();
