import { FastifyInstance } from 'fastify';
import { quizService } from './quiz.service';
import { quizAnswerSchema } from '../../shared/schemas';
import { sendSuccess } from '../../shared/response';

export async function quizRoutes(fastify: FastifyInstance) {
  /** GET /quiz/due - Get SRS-scheduled questions */
  fastify.get('/due', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { limit } = request.query as { limit?: number };
    const result = await quizService.getDueQuestions(request.userId, limit || 10);
    return sendSuccess(reply, result);
  });

  /** POST /quiz/answer - Submit quiz answer */
  fastify.post('/answer', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = quizAnswerSchema.parse(request.body);
    const result = await quizService.submitAnswer(request.userId, body);
    return sendSuccess(reply, result);
  });
}
