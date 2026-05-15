import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { AppError } from '../../shared/errors';
import { RegisterInput, LoginInput } from '../../shared/schemas';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UserRole, UserPlan } from '@prisma/client';
import { encrypt, decrypt, hash } from '../../shared/utils/encryption';

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
   * Register a new user with Argon2id and PII encryption.
   */
  async register(data: RegisterInput) {
    const emailHash = hash(data.email);

    // Check if user exists using blind index
    const existingUser = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (existingUser) {
      throw AppError.badRequest('User with this email already exists');
    }

    // Encrypt PII
    const encryptedEmail = encrypt(data.email);
    const encryptedDisplayName = data.displayName ? encrypt(data.displayName) : encrypt('User');
    
    const passwordHash = await argon2.hash(data.password, ARGON2_OPTIONS);
    const verificationToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email: encryptedEmail,
        emailHash,
        passwordHash,
        displayName: encryptedDisplayName,
        nativeLanguage: data.nativeLanguage || 'en',
        englishLevel: 1,
        role: UserRole.USER,
        plan: UserPlan.FREE,
        verificationToken,
        emailVerified: false,
      },
    });

    // TODO: Send verification email
    // await sendVerificationEmail(data.email, verificationToken);

    return { 
      message: 'Registration successful. Please verify your email.',
      userId: user.id 
    };
  }

  /**
   * Login with email/password. Returns JWT tokens.
   */
  async login(input: LoginInput, jwtSign: (payload: object, opts?: object) => string) {
    const emailHash = hash(input.email);
    const user = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (!user || !user.passwordHash) {
      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw AppError.tooMany(`Account locked. Try again in ${minutesLeft} minutes.`);
    }

    // Verify password
    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      const newAttempts = user.failedAttempts + 1;
      const updateData: any = { failedAttempts: newAttempts };

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastSeenAt: new Date(),
      },
    });

    return this.generateAuthResponse(user, jwtSign);
  }

  /**
   * Request OTP for email login/signup.
   */
  async requestOtp(email: string) {
    const emailHash = hash(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if user exists, if not create a partial one (or just store OTP in Redis)
    let user = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: encrypt(email),
          emailHash,
          displayName: encrypt(email.split('@')[0]),
          otp,
          otpExpiresAt,
          emailVerified: false,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpiresAt },
      });
    }

    // TODO: Send OTP via email
    console.log(`OTP for ${email}: ${otp}`);

    return { message: 'OTP sent to your email' };
  }

  /**
   * Verify OTP and return auth response.
   */
  async verifyOtp(email: string, otp: string, jwtSign: (payload: object, opts?: object) => string) {
    const emailHash = hash(email);
    const user = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (!user || user.otp !== otp || (user.otpExpiresAt && user.otpExpiresAt < new Date())) {
      throw AppError.unauthorized('Invalid or expired OTP');
    }

    // Clear OTP and verify email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiresAt: null,
        emailVerified: true,
        lastSeenAt: new Date(),
      },
    });

    return this.generateAuthResponse(updatedUser, jwtSign);
  }

  /**
   * Social Authentication (Google, Facebook, LinkedIn, Apple)
   */
  async socialAuth(data: {
    provider: string;
    token: string;
    displayName?: string;
    email?: string;
  }, jwtSign: (payload: object, opts?: object) => string) {
    // In a real app, verify the token with the provider here.
    // For now, we'll assume the frontend verified it and passed valid info.
    
    if (!data.email) {
      throw AppError.badRequest('Email is required for social auth');
    }

    const emailHash = hash(data.email);
    let user = await prisma.user.findUnique({
      where: { emailHash },
    });

    const providerField = `${data.provider}Id`;
    const socialId = `social_${data.token.substring(0, 10)}`; // Mock social ID

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: encrypt(data.email),
          emailHash,
          displayName: encrypt(data.displayName || data.email.split('@')[0]),
          [providerField]: socialId,
          emailVerified: true,
          plan: UserPlan.FREE,
          lastSeenAt: new Date(),
        },
      });
    } else {
      // Update social ID if not set
      await prisma.user.update({
        where: { id: user.id },
        data: {
          [providerField]: socialId,
          emailVerified: true,
          lastSeenAt: new Date(),
        },
      });
    }

    return this.generateAuthResponse(user, jwtSign);
  }

  /**
   * Generate Access and Refresh tokens.
   */
  private async generateAuthResponse(user: any, jwtSign: (payload: object, opts?: object) => string) {
    const accessToken = jwtSign(
      { sub: user.id, role: user.role, plan: user.plan },
      { expiresIn: config.jwt.accessTtl }
    );

    const refreshToken = uuidv4();
    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30d

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
        email: decrypt(user.email),
        displayName: user.displayName ? decrypt(user.displayName) : null,
        englishLevel: user.englishLevel,
        role: user.role,
        plan: user.plan,
        xpTotal: user.xpTotal,
        streakDays: user.streakDays,
      },
    };
  }

  async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
      },
    });

    if (!user) {
      throw AppError.badRequest('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async refresh(refreshTokenStr: string, jwtSign: (payload: object, opts?: object) => string) {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenStr },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

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

  async logout(userId: string, refreshTokenStr?: string) {
    if (refreshTokenStr) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshTokenStr },
      });
    }
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound('User not found');
    }

    return {
      ...user,
      email: decrypt(user.email),
      displayName: user.displayName ? decrypt(user.displayName) : null,
    };
  }

  async updateProfile(userId: string, data: any) {
    const updateData: any = { ...data };
    if (data.displayName) updateData.displayName = encrypt(data.displayName);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return {
      ...user,
      email: decrypt(user.email),
      displayName: user.displayName ? decrypt(user.displayName) : null,
    };
  }
}

export const authService = new AuthService();
