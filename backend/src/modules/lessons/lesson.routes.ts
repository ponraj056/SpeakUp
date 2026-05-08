import { FastifyInstance } from 'fastify';
import { lessonService } from './lesson.service';
import { lessonFilterSchema, completeLessonSchema } from '../../shared/schemas';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function lessonRoutes(fastify: FastifyInstance) {
  /** GET /lessons - List lessons with filters */
  fastify.get('/', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const filters = lessonFilterSchema.parse(request.query);
    const result = await lessonService.listLessons(filters, request.userPlan);
    return sendPaginated(reply, result.lessons, result.total, result.page, result.limit);
  });

  /** GET /lessons/:slug - Get lesson detail */
  fastify.get('/:slug', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const result = await lessonService.getLessonBySlug(slug, request.userId);
    return sendSuccess(reply, result);
  });

  /** POST /lessons/:id/complete - Complete a lesson */
  fastify.post('/:id/complete', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = completeLessonSchema.parse(request.body);
    const result = await lessonService.completeLesson(request.userId, id, body);
    return sendSuccess(reply, result);
  });

  /** GET /users/me/progress - User progress dashboard */
  fastify.get('/progress', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const result = await lessonService.getUserProgress(request.userId);
    return sendSuccess(reply, result);
  });
}
