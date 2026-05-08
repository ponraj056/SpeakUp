import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../shared/errors';
import { sendError } from '../shared/response';
import { ZodError } from 'zod';
import { config } from '../config/env';

/**
 * Global error handler plugin.
 * Catches all errors and returns a consistent JSON envelope.
 */
async function errorHandlerPlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    // Log error in development
    if (config.server.isDev) {
      request.log.error(error);
    }

    // AppError - known operational errors
    if (error instanceof AppError) {
      return sendError(reply, error.statusCode, error.message, error.code);
    }

    // Zod validation errors
    if (error instanceof ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      return sendError(reply, 400, messages.join('; '), 'VALIDATION_ERROR');
    }

    // Fastify validation errors
    if (error.validation) {
      return sendError(reply, 400, error.message, 'VALIDATION_ERROR');
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return sendError(reply, 429, 'Too many requests. Please slow down.', 'RATE_LIMITED');
    }

    // Unknown errors - don't leak internals
    console.error('Unhandled error:', error);
    return sendError(reply, 500, 'Internal server error', 'INTERNAL_ERROR');
  });
}

export default fp(errorHandlerPlugin, { name: 'errorHandler' });
