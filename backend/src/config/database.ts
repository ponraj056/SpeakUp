import { PrismaClient } from '@prisma/client';
import { config } from './env';

/** Singleton Prisma client instance */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.server.isDev ? ['query', 'warn', 'error'] : ['error'],
  });

if (!config.server.isProd) {
  globalForPrisma.prisma = prisma;
}
