import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { AppError } from '../../shared/errors';
import { RegisterInput, LoginInput } from '../../shared/schemas';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, UserPlan } from '@prisma/client';

/** Argon2id config per OWASP recommendation */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,
  parallelism: 4,
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export class AuthService {
  /**
   * Register a new user with email/password.
   * Sends verification email via token.
   */
  async register(input: RegisterInput) {
    // Check for existing user
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw AppError.conflict('An account with this email already exists', 'EMAIL_EXISTS');
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);

    // Generate email verification token
    const verifyToken = uuidv4();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        displayName: input.displayName || input.email.split('@')[0],
        nativeLanguage: input.nativeLanguage || 'en',
        verifyToken,
        verifyTokenExp,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        currentLevel: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    });

    // TODO: Send verification email via SendGrid
    // await sendVerificationEmail(user.email, verifyToken);

    return { user, verifyToken };
  }

  /**
   * Verify email with token.
   */
  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExp: { gt: new Date() },
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExp: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Login with email/password. Returns JWT tokens.
   * Implements account lockout after 5 failed attempts.
   */
  async login(input: LoginInput, jwtSign: (payload: object, opts?: object) => string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    // Generic error to prevent enumeration
    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw AppError.tooMany(
        `Account locked. Try again in ${minutesLeft} minutes.`
      );
    }

    // Verify password
    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      // Increment failed attempts
      const newAttempts = user.failedAttempts + 1;
      const updateData: Record<string, unknown> = { failedAttempts: newAttempts };

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check email verification
    if (!user.emailVerified) {
      throw AppError.forbidden('Please verify your email first', 'EMAIL_NOT_VERIFIED');
    }

    // Check 2FA if enabled
    if (user.twoFaEnabled) {
      if (!input.twoFaCode) {
        return { requiresTwoFa: true };
      }
      // TODO: Validate TOTP code
      // const isValidTotp = verifyTotp(user.twoFaSecret, input.twoFaCode);
      // if (!isValidTotp) throw AppError.unauthorized('Invalid 2FA code');
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastSeenAt: new Date(),
      },
    });

    // Generate tokens
    const accessToken = jwtSign(
      { sub: user.id, role: user.role, plan: user.plan },
      { expiresIn: config.jwt.accessTtl }
    );

    const refreshToken = uuidv4();
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiry,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        currentLevel: user.currentLevel,
        role: user.role,
        plan: user.plan,
        xpTotal: user.xpTotal,
        streakDays: user.streakDays,
      },
    };
  }

  /**
   * Rotate access token using refresh token.
   */
  async refresh(refreshTokenStr: string, jwtSign: (payload: object, opts?: object) => string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new tokens
    const accessToken = jwtSign(
      { sub: storedToken.user.id, role: storedToken.user.role, plan: storedToken.user.plan },
      { expiresIn: config.jwt.accessTtl }
    );

    const newRefreshToken = uuidv4();
    await prisma.refreshToken.create({
      data: {
        userId: storedToken.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout - revoke refresh token and denylist access token.
   */
  async logout(userId: string, refreshTokenStr?: string) {
    // Revoke all refresh tokens for user
    if (refreshTokenStr) {
      await prisma.refreshToken.updateMany({
        where: { userId, token: refreshTokenStr },
        data: { revokedAt: new Date() },
      });
    }

    // Add user to deny list for 15 min (access token TTL)
    await redis.setex(`token:deny:${userId}`, 900, '1');

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        nativeLanguage: true,
        currentLevel: true,
        role: true,
        plan: true,
        planExpiresAt: true,
        xpTotal: true,
        streakDays: true,
        streakLastAt: true,
        timezone: true,
        locale: true,
        twoFaEnabled: true,
        emailVerified: true,
        createdAt: true,
        lastSeenAt: true,
      },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: Record<string, unknown>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        nativeLanguage: true,
        currentLevel: true,
        timezone: true,
        locale: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
