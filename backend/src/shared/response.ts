import { FastifyReply } from 'fastify';

/** Standard API response envelope */
interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error: null;
}

interface ApiErrorResponse {
  data: null;
  meta?: Record<string, unknown>;
  error: {
    code: string;
    message: string;
  };
}

/** Send a successful response with data */
export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): FastifyReply {
  const response: ApiResponse<T> = { data, meta, error: null };
  return reply.status(statusCode).send(response);
}

/** Send a paginated response */
export function sendPaginated<T>(
  reply: FastifyReply,
  data: T[],
  total: number,
  page: number,
  limit: number
): FastifyReply {
  return sendSuccess(reply, data, 200, {
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

/** Send an error response */
export function sendError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  code = 'ERROR'
): FastifyReply {
  const response: ApiErrorResponse = {
    data: null,
    error: { code, message },
  };
  return reply.status(statusCode).send(response);
}
