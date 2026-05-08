import { FastifyInstance } from 'fastify';
import { phraseService } from './phrase.service';
import { phraseFilterSchema } from '../../shared/schemas';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function phraseRoutes(fastify: FastifyInstance) {
  /** GET /phrases - Search/filter phrases */
  fastify.get('/', async (request, reply) => {
    const filters = phraseFilterSchema.parse(request.query);
    const result = await phraseService.listPhrases(filters);
    return sendPaginated(reply, result.phrases, result.total, result.page, result.limit);
  });

  /** GET /phrases/today - Phrase of the day */
  fastify.get('/today', async (_request, reply) => {
    const phrase = await phraseService.getPhraseOfDay();
    return sendSuccess(reply, phrase);
  });

  /** GET /phrases/situations - List situations */
  fastify.get('/situations', async (_request, reply) => {
    const situations = await phraseService.getSituations();
    return sendSuccess(reply, situations);
  });
}
