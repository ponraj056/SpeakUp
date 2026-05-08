import { FastifyInstance } from 'fastify';
import { vocabularyService } from './vocabulary.service';
import { addVocabularySchema, paginationSchema } from '../../shared/schemas';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function vocabularyRoutes(fastify: FastifyInstance) {
  /** GET /vocabulary - List user's vocabulary */
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const result = await vocabularyService.getVocabulary(request.userId, page, limit);
    return sendPaginated(reply, result.words, result.total, result.page, result.limit);
  });

  /** POST /vocabulary - Add a word */
  fastify.post('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = addVocabularySchema.parse(request.body);
    const word = await vocabularyService.addWord(request.userId, body);
    return sendSuccess(reply, word, 201);
  });

  /** GET /vocabulary/review - Get words due for review */
  fastify.get('/review', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const words = await vocabularyService.getDueReviews(request.userId);
    return sendSuccess(reply, words);
  });

  /** POST /vocabulary/:id/review - Review a word */
  fastify.post('/:id/review', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { remembered } = request.body as { remembered: boolean };
    const result = await vocabularyService.reviewWord(request.userId, id, remembered);
    return sendSuccess(reply, result);
  });

  /** DELETE /vocabulary/:id - Delete a word */
  fastify.delete('/:id', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await vocabularyService.deleteWord(request.userId, id);
    return sendSuccess(reply, result);
  });
}
