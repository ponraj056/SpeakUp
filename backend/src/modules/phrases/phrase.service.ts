import { prisma } from '../../config/database';
import { PhraseFilterInput } from '../../shared/schemas';
import { Formality, CEFRLevel } from '@prisma/client';

export class PhraseService {
  /**
   * Search/filter phrases.
   */
  async listPhrases(filters: PhraseFilterInput) {
    const { situation, level, formality, page, limit, search } = filters;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };

    if (situation) where.situation = situation;
    if (level) where.level = level as CEFRLevel;
    if (formality) where.formality = formality as Formality;
    if (search) {
      where.text = { contains: search, mode: 'insensitive' };
    }

    const [phrases, total] = await Promise.all([
      prisma.phrase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.phrase.count({ where }),
    ]);

    return { phrases, total, page, limit };
  }

  /**
   * Get phrase of the day (rotates daily).
   */
  async getPhraseOfDay() {
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('-').reduce((sum, n) => sum + parseInt(n), 0);

    const totalPhrases = await prisma.phrase.count({ where: { isPublished: true } });
    const skip = hash % totalPhrases;

    const phrase = await prisma.phrase.findFirst({
      where: { isPublished: true },
      skip,
    });

    return phrase;
  }

  /**
   * Get all unique situations.
   */
  async getSituations() {
    const situations = await prisma.phrase.findMany({
      where: { isPublished: true },
      select: { situation: true },
      distinct: ['situation'],
    });

    return situations.map((s) => s.situation);
  }
}

export const phraseService = new PhraseService();
