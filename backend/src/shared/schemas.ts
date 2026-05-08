import { z } from 'zod';

// ─── Auth Schemas ──────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
  displayName: z.string().min(2).max(50).optional(),
  nativeLanguage: z.string().min(2).max(10).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  twoFaCode: z.string().length(6).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const magicLinkSchema = z.object({
  email: z.string().email(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// ─── User Schemas ──────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  nativeLanguage: z.string().min(2).max(10).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

// ─── Lesson Schemas ────────────────────────────────────────────────

export const lessonFilterSchema = z.object({
  category: z.enum(['GRAMMAR', 'PRONUNCIATION', 'VOCABULARY', 'SPEAKING_SKILLS']).optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
});

export const completeLessonSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  timeSpentSeconds: z.number().min(0),
});

// ─── Quiz Schemas ──────────────────────────────────────────────────

export const quizAnswerSchema = z.object({
  questionId: z.string().uuid(),
  userAnswer: z.string().min(1),
  timeTakenMs: z.number().min(0),
});

// ─── AI Schemas ────────────────────────────────────────────────────

export const aiChatSchema = z.object({
  sessionId: z.string().uuid().optional(),
  scenario: z.string().min(1).optional(),
  difficulty: z.enum(['GUIDED', 'STANDARD', 'CHALLENGE']).optional(),
  message: z.string().min(1).max(2000),
  isVoice: z.boolean().default(false),
});

export const grammarCheckSchema = z.object({
  text: z.string().min(1).max(5000),
});

// ─── Vocabulary Schemas ────────────────────────────────────────────

export const addVocabularySchema = z.object({
  word: z.string().min(1).max(100),
  definition: z.string().max(500).optional(),
  exampleSentence: z.string().max(500).optional(),
});

// ─── Phrase Schemas ────────────────────────────────────────────────

export const phraseFilterSchema = z.object({
  situation: z.string().optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']).optional(),
  formality: z.enum(['CASUAL', 'PROFESSIONAL', 'FORMAL']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
});

// ─── Billing Schemas ───────────────────────────────────────────────

export const subscribeSchema = z.object({
  plan: z.enum(['PRO_MONTHLY', 'PRO_ANNUAL']),
});

// ─── Admin Schemas ─────────────────────────────────────────────────

export const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.enum(['GRAMMAR', 'PRONUNCIATION', 'VOCABULARY', 'SPEAKING_SKILLS']).optional(),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1']).optional(),
  contentJson: z.record(z.unknown()).optional(),
  isPublished: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  xpReward: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// ─── Pagination ────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ─── Types ─────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type LessonFilterInput = z.infer<typeof lessonFilterSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type QuizAnswerInput = z.infer<typeof quizAnswerSchema>;
export type AIChatInput = z.infer<typeof aiChatSchema>;
export type GrammarCheckInput = z.infer<typeof grammarCheckSchema>;
export type AddVocabularyInput = z.infer<typeof addVocabularySchema>;
export type PhraseFilterInput = z.infer<typeof phraseFilterSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
