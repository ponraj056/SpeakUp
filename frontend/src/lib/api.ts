const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  error: { code: string; message: string } | null;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.accessToken = token;
  }

  getToken() {
    return this.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error?.message || 'Request failed',
        data.error?.code || 'UNKNOWN',
        response.status
      );
    }

    return data;
  }

  // Auth
  async register(email: string, password: string, displayName?: string) {
    return this.request<{ user: unknown; verifyToken: string }>('POST', '/auth/register', {
      email,
      password,
      displayName,
    });
  }

  async login(email: string, password: string, twoFaCode?: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      user: UserProfile;
    }>('POST', '/auth/login', { email, password, twoFaCode });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{ accessToken: string; refreshToken: string }>(
      'POST',
      '/auth/refresh',
      { refreshToken }
    );
  }

  async logout(refreshToken?: string) {
    return this.request('DELETE', '/auth/logout', { refreshToken });
  }

  async getProfile() {
    return this.request<UserProfile>('GET', '/auth/me');
  }

  async updateProfile(data: Partial<UserProfile>) {
    return this.request<UserProfile>('PATCH', '/auth/me', data);
  }

  // Lessons
  async getLessons(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Lesson[]>('GET', `/lessons${query}`);
  }

  async getLesson(slug: string) {
    return this.request<{ lesson: Lesson; progress: LessonProgress | null }>(
      'GET',
      `/lessons/${slug}`
    );
  }

  async completeLesson(id: string, data: { score?: number; timeSpentSeconds: number }) {
    return this.request('POST', `/lessons/${id}/complete`, data);
  }

  async getProgress() {
    return this.request<ProgressData>('GET', '/lessons/progress');
  }

  // AI
  async getScenarios() {
    return this.request<Scenario[]>('GET', '/ai/scenarios');
  }

  async aiChat(data: {
    sessionId?: string;
    scenario?: string;
    difficulty?: string;
    message: string;
  }) {
    return this.request<AIChatResponse>('POST', '/ai/chat', data);
  }

  async endAISession(sessionId: string) {
    return this.request('POST', `/ai/sessions/${sessionId}/end`);
  }

  async getSessionFeedback(sessionId: string) {
    return this.request<SessionFeedback>('GET', `/ai/sessions/${sessionId}/feedback`);
  }

  async grammarCheck(text: string) {
    return this.request('POST', '/ai/grammar', { text });
  }

  // Quiz
  async getDueQuiz(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<QuizDueResponse>('GET', `/quiz/due${query}`);
  }

  async submitAnswer(data: { questionId: string; userAnswer: string; timeTakenMs: number }) {
    return this.request<QuizAnswerResult>('POST', '/quiz/answer', data);
  }

  // Vocabulary
  async getVocabulary(page = 1, limit = 20) {
    return this.request<VocabWord[]>('GET', `/vocabulary?page=${page}&limit=${limit}`);
  }

  async addWord(data: { word: string; definition?: string; exampleSentence?: string }) {
    return this.request<VocabWord>('POST', '/vocabulary', data);
  }

  async getDueReviews() {
    return this.request<VocabWord[]>('GET', '/vocabulary/review');
  }

  async reviewWord(id: string, remembered: boolean) {
    return this.request('POST', `/vocabulary/${id}/review`, { remembered });
  }

  // Phrases
  async getPhrases(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<Phrase[]>('GET', `/phrases${query}`);
  }

  async getPhraseOfDay() {
    return this.request<Phrase>('GET', '/phrases/today');
  }

  // Billing
  async subscribe(plan: 'PRO_MONTHLY' | 'PRO_ANNUAL') {
    return this.request<{ sessionId: string; url: string }>('POST', '/billing/subscribe', {
      plan,
    });
  }

  async cancelSubscription() {
    return this.request('DELETE', '/billing/cancel');
  }

  async getSubscriptionStatus() {
    return this.request('GET', '/billing/status');
  }

  // Admin
  async getAdminMetrics() {
    return this.request('GET', '/admin/metrics');
  }

  async getAdminUsers(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set('search', search);
    return this.request('GET', `/admin/users?${params}`);
  }
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  nativeLanguage: string;
  currentLevel: string;
  role: string;
  plan: string;
  planExpiresAt: string | null;
  xpTotal: number;
  streakDays: number;
  streakLastAt: string | null;
  timezone: string;
  locale: string;
  twoFaEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  durationSeconds: number;
  contentJson: Record<string, unknown>;
  thumbnailUrl: string | null;
  isPremium: boolean;
  xpReward: number;
  tags: string[];
}

export interface LessonProgress {
  id: string;
  status: string;
  score: number | null;
  completedAt: string | null;
  timeSpentSeconds: number;
  attemptCount: number;
}

export interface ProgressData {
  user: {
    xpTotal: number;
    streakDays: number;
    streakLastAt: string | null;
    currentLevel: string;
  };
  completedCount: number;
  totalLessons: number;
  completionRate: number;
  recentProgress: Array<LessonProgress & { lesson: Lesson }>;
}

export interface Scenario {
  id: string;
  title: string;
  character: string;
}

export interface AIChatResponse {
  sessionId: string;
  scenario: string;
  difficulty: string;
  message: string;
  messageCount: number;
}

export interface SessionFeedback {
  session: Record<string, unknown>;
  scores: { grammar: number; vocabulary: number; fluency: number };
  feedback: Record<string, unknown>;
  messages: Array<{ role: string; content: string }>;
}

export interface QuizDueResponse {
  dueForReview: QuizQuestion[];
  newQuestions: QuizQuestion[];
  totalDue: number;
}

export interface QuizQuestion {
  id: string;
  type: string;
  level: string;
  prompt: string;
  options: unknown;
  audioUrl: string | null;
  difficultyRating: number;
}

export interface QuizAnswerResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string | null;
  xpEarned: number;
  nextReview: string;
  srsInterval: number;
}

export interface VocabWord {
  id: string;
  word: string;
  definition: string | null;
  exampleSentence: string | null;
  confidence: number;
  srsNextReview: string | null;
  reviewCount: number;
  createdAt: string;
}

export interface Phrase {
  id: string;
  text: string;
  translationJson: Record<string, string> | null;
  situation: string;
  formality: string;
  level: string;
  audioUrl: string | null;
  usageNote: string | null;
}

export const api = new ApiClient(API_BASE_URL);
