import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../shared/utils/errors';

export default fp(async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.setErrorHandler((error, request, reply) => {
    // Log error
    request.log.error(error);

    // If it's a known AppError
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        data: null,
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
        },
      });
    }

    // Handle Zod Validation Errors (from fastify-type-provider-zod or manual)
    if (error.validation) {
      return reply.status(400).send({
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.validation,
        },
      });
    }

    // Default 500
    const isProd = process.env.NODE_ENV === 'production';
    return reply.status(500).send({
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: isProd ? 'Internal server error' : error.message,
        stack: isProd ? undefined : error.stack,
      },
    });
  });

  // Handle 404
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      data: null,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    });
  });
});
