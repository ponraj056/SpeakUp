import { FastifyInstance } from 'fastify';
import { authService } from './auth.service';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  updateProfileSchema,
  requestOtpSchema,
  verifyOtpSchema,
  socialAuthSchema,
} from '../../shared/schemas';
import { sendSuccess } from '../../shared/response';

export async function authRoutes(fastify: FastifyInstance) {
  /** POST /auth/register */
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const result = await authService.register(body);
    return sendSuccess(reply, result, 201);
  });

  /** POST /auth/verify-email */
  fastify.post('/verify-email', async (request, reply) => {
    const { token } = verifyEmailSchema.parse(request.body);
    const result = await authService.verifyEmail(token);
    return sendSuccess(reply, result);
  });

  /** POST /auth/login */
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const result = await authService.login(body, (payload, opts) =>
      fastify.jwt.sign(payload, opts)
    );
    return sendSuccess(reply, result);
  });

  /** POST /auth/request-otp */
  fastify.post('/request-otp', async (request, reply) => {
    const { email } = requestOtpSchema.parse(request.body);
    const result = await authService.requestOtp(email);
    return sendSuccess(reply, result);
  });

  /** POST /auth/verify-otp */
  fastify.post('/verify-otp', async (request, reply) => {
    const { email, otp } = verifyOtpSchema.parse(request.body);
    const result = await authService.verifyOtp(email, otp, (payload, opts) =>
      fastify.jwt.sign(payload, opts)
    );
    return sendSuccess(reply, result);
  });

  /** POST /auth/social */
  fastify.post('/social', async (request, reply) => {
    const body = socialAuthSchema.parse(request.body);
    const result = await authService.socialAuth(body, (payload, opts) =>
      fastify.jwt.sign(payload, opts)
    );
    return sendSuccess(reply, result);
  });

  /** POST /auth/refresh */
  fastify.post('/refresh', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    const result = await authService.refresh(refreshToken, (payload, opts) =>
      fastify.jwt.sign(payload, opts)
    );
    return sendSuccess(reply, result);
  });

  /** DELETE /auth/logout */
  fastify.delete('/logout', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = request.body as { refreshToken?: string } | undefined;
    const result = await authService.logout(request.userId, body?.refreshToken);
    return sendSuccess(reply, result);
  });

  /** GET /auth/me */
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await authService.getProfile(request.userId);
    return sendSuccess(reply, user);
  });

  /** PATCH /auth/me */
  fastify.patch('/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const data = updateProfileSchema.parse(request.body);
    const user = await authService.updateProfile(request.userId, data);
    return sendSuccess(reply, user);
  });
}
