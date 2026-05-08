import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';

import { config } from './config/env';
import { prisma } from './config/database';
import { redis, isRedisAvailable } from './config/redis';

// Plugins
import authPlugin from './plugins/auth';
import errorHandler from './plugins/errorHandler';

// Routes
import { authRoutes } from './modules/auth/auth.routes';
import { lessonRoutes } from './modules/lessons/lesson.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { quizRoutes } from './modules/quiz/quiz.routes';
import { vocabularyRoutes } from './modules/vocabulary/vocabulary.routes';
import { phraseRoutes } from './modules/phrases/phrase.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { adminRoutes } from './modules/admin/admin.routes';

async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: config.server.isDev ? 'info' : 'warn',
      transport: config.server.isDev
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
  });

  // ─── Security Plugins ──────────────────────────────────────────────

  await fastify.register(helmet, {
    contentSecurityPolicy: config.server.isProd ? undefined : false,
  });

  await fastify.register(cors, {
    origin: config.server.isDev
      ? ['http://localhost:3000', 'http://localhost:3001']
      : [config.server.frontendUrl],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await fastify.register(cookie, {
    secret: config.jwt.secret,
  });

  // ─── Rate Limiting ─────────────────────────────────────────────────

  const rateLimitOpts: Record<string, unknown> = {
    max: 300,
    timeWindow: '1 minute',
    keyGenerator: (request: any) => {
      return request.userId || request.ip;
    },
  };

  // Only use Redis for rate limiting if available
  if (isRedisAvailable()) {
    rateLimitOpts.redis = redis;
  }

  await fastify.register(rateLimit, rateLimitOpts as any);

  // ─── Custom Plugins ────────────────────────────────────────────────

  await fastify.register(errorHandler);
  await fastify.register(authPlugin);

  // ─── API Routes ────────────────────────────────────────────────────

  fastify.register(authRoutes, { prefix: '/v1/auth' });
  fastify.register(lessonRoutes, { prefix: '/v1/lessons' });
  fastify.register(aiRoutes, { prefix: '/v1/ai' });
  fastify.register(quizRoutes, { prefix: '/v1/quiz' });
  fastify.register(vocabularyRoutes, { prefix: '/v1/vocabulary' });
  fastify.register(phraseRoutes, { prefix: '/v1/phrases' });
  fastify.register(billingRoutes, { prefix: '/v1/billing' });
  fastify.register(adminRoutes, { prefix: '/v1/admin' });

  // ─── Health Check ──────────────────────────────────────────────────

  fastify.get('/health', async () => {
    const dbHealthy = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
    const redisHealthy = isRedisAvailable();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        redis: redisHealthy ? 'healthy' : 'unavailable (using in-memory fallback)',
      },
    };
  });

  // ─── Root ──────────────────────────────────────────────────────────

  fastify.get('/', async () => ({
    name: 'SpeakUp API',
    version: '1.0.0',
    docs: '/documentation',
  }));

  return fastify;
}

// ─── Start Server ────────────────────────────────────────────────────

async function start() {
  try {
    // Try to connect to Redis (non-blocking)
    try {
      await redis.connect();
    } catch (err) {
      console.warn('⚠️  Redis not available — running without cache. Features like token denylist will use in-memory fallback.');
    }

    const server = await buildServer();

    await server.listen({
      port: config.server.port,
      host: config.server.host,
    });

    console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🎤 SpeakUp API Server                   ║
    ║   Running on port ${config.server.port}                  ║
    ║   Environment: ${config.server.env.padEnd(20)}    ║
    ║   Redis: ${isRedisAvailable() ? 'Connected ✅' : 'Unavailable ⚠️'}                  ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    for (const signal of signals) {
      process.on(signal, async () => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        await server.close();
        await prisma.$disconnect();
        if (isRedisAvailable()) await redis.quit();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
