import { FastifyInstance } from 'fastify';
import { adminService } from './admin.service';
import { updateLessonSchema, paginationSchema } from '../../shared/schemas';
import { sendSuccess, sendPaginated } from '../../shared/response';

export async function adminRoutes(fastify: FastifyInstance) {
  // All admin routes require authentication + ADMIN role
  fastify.addHook('preHandler', fastify.authenticate);
  fastify.addHook('preHandler', fastify.requireRole('ADMIN'));

  /** GET /admin/metrics - Platform KPIs */
  fastify.get('/metrics', async (_request, reply) => {
    const metrics = await adminService.getMetrics();
    return sendSuccess(reply, metrics);
  });

  /** GET /admin/users - List all users */
  fastify.get('/users', async (request, reply) => {
    const { page, limit } = paginationSchema.parse(request.query);
    const { search } = request.query as { search?: string };
    const result = await adminService.listUsers(page, limit, search);
    return sendPaginated(reply, result.users, result.total, result.page, result.limit);
  });

  /** PATCH /admin/lessons/:id - Update/publish lesson */
  fastify.patch('/lessons/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = updateLessonSchema.parse(request.body);
    const lesson = await adminService.updateLesson(id, body);

    // Audit log
    await adminService.logAction(
      request.userId,
      'UPDATE_LESSON',
      'lesson',
      id,
      body,
      request.ip
    );

    return sendSuccess(reply, lesson);
  });
}
