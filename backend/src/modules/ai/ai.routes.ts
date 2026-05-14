import { FastifyInstance } from 'fastify';
import { aiService } from './ai.service';
import { aiChatSchema, grammarCheckSchema } from '../../shared/schemas';
import { sendSuccess } from '../../shared/response';

export async function aiRoutes(fastify: FastifyInstance) {
  /** GET /ai/scenarios - List available scenarios */
  fastify.get('/scenarios', async (_request, reply) => {
    const scenarios = aiService.getScenarios();
    return sendSuccess(reply, scenarios);
  });

  /** POST /ai/chat - AI conversation turn with SSE streaming */
  fastify.post('/chat', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = aiChatSchema.parse(request.body);

    const user = await fastify.prisma?.user.findUnique({
      where: { id: request.userId },
      select: { currentLevel: true },
    });

    // Set SSE headers
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    try {
      const result = await aiService.chatStream(
        request.userId,
        body,
        user?.currentLevel || 'B1',
        request.userPlan,
        (token) => {
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      );

      // Send final metadata
      reply.raw.write(`data: ${JSON.stringify({ 
        done: true, 
        sessionId: result.sessionId, 
        correction: result.correction 
      })}\n\n`);
      reply.raw.end();
    } catch (error: any) {
      reply.raw.write(`data: ${JSON.stringify({ error: error.message || 'Internal Server Error' })}\n\n`);
      reply.raw.end();
    }
  });

  /** POST /ai/grammar - Grammar check text */
  fastify.post('/grammar', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { text } = grammarCheckSchema.parse(request.body);

    const user = await fastify.prisma?.user.findUnique({
      where: { id: request.userId },
      select: { currentLevel: true },
    });

    const result = await aiService.grammarCheck(text, user?.currentLevel || 'B1');
    return sendSuccess(reply, result);
  });

  /** POST /ai/sessions/:id/end - End session and get feedback */
  fastify.post('/sessions/:id/end', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await aiService.endSession(id, request.userId);
    return sendSuccess(reply, result);
  });

  /** GET /ai/sessions/:id/feedback - Get session feedback card */
  fastify.get('/sessions/:id/feedback', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const result = await aiService.getSessionFeedback(id, request.userId);
    return sendSuccess(reply, result);
  });
}
