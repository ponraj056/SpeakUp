import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import { config } from '../config/env';
import { AppError } from '../shared/errors';
import { safeGet } from '../config/redis';
import { prisma } from '../config/database';
import { UserRole, UserPlan } from '@prisma/client';

/** JWT payload shape */
export interface JwtPayload {
  sub: string;
  role: UserRole;
  plan: UserPlan;
  iat?: number;
  exp?: number;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
    userRole: UserRole;
    userPlan: UserPlan;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  // Register JWT plugin
  fastify.register(fjwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.accessTtl,
    },
  });

  /**
   * Decorator: authenticate - verifies JWT and checks token denylist.
   * Use as preHandler on protected routes.
   */
  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        const payload = await request.jwtVerify<JwtPayload>();

        // Check if token is denylisted (revoked)
        const isDenied = await safeGet(`token:deny:${payload.sub}:${payload.iat}`);
        if (isDenied) {
          throw AppError.unauthorized('Token has been revoked');
        }

        // Check if user is still active
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { isActive: true, role: true, plan: true },
        });

        if (!user || !user.isActive) {
          throw AppError.unauthorized('Account is deactivated');
        }

        request.userId = payload.sub;
        request.userRole = user.role;
        request.userPlan = user.plan;
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw AppError.unauthorized('Invalid or expired token');
      }
    }
  );

  /**
   * Decorator: requireRole - checks user has required role.
   */
  fastify.decorate('requireRole', function (...roles: UserRole[]) {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
      if (!roles.includes(request.userRole)) {
        throw AppError.forbidden('Insufficient permissions');
      }
    };
  });

  /**
   * Decorator: requirePlan - checks user has Pro plan.
   */
  fastify.decorate('requirePlan', function (plan: UserPlan) {
    return async function (request: FastifyRequest, _reply: FastifyReply) {
      if (request.userPlan !== plan && request.userRole !== 'ADMIN') {
        throw AppError.forbidden('This feature requires a Pro subscription');
      }
    };
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (...roles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requirePlan: (plan: UserPlan) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, { name: 'auth' });
