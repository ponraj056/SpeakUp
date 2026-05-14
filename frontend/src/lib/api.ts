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
  async register(data: { email: string; password?: string; displayName: string; nativeLanguage?: string }) {
    return this.request<{ user: UserProfile; tokens: { accessToken: string; refreshToken: string } }>('POST', '/auth/register', data);
  }

  async login(email: string, password?: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      user: UserProfile;
    }>('POST', '/auth/login', { email, password });
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
    return this.request<{ lesson: Lesson; progress: any }>(
      'GET',
      `/lessons/${slug}`
    );
  }

  async completeLesson(id: string, data: { score?: number; timeSpentSeconds: number }) {
    return this.request('POST', `/lessons/${id}/complete`, data);
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

  async aiChatStream(
    data: {
      sessionId?: string;
      scenario?: string;
      difficulty?: string;
      message: string;
    },
    onToken: (token: string) => void,
    onDone: (result: { sessionId: string; correction?: any }) => void,
    onError: (error: string) => void
  ) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...data, stream: true }),
      });

      if (!response.ok) {
        throw new Error('Streaming request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body in response');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const jsonText = line.trim().substring(6);
            if (jsonText === '[DONE]') break;
            const json = JSON.parse(jsonText);
            if (json.token) onToken(json.token);
            if (json.done) onDone(json);
            if (json.error) onError(json.error);
          }
        }
      }
    } catch (err: any) {
      onError(err.message);
    }
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

  // Billing
  async createSubscription(plan: 'monthly' | 'annual') {
    return this.request<{ subscription_id: string; payment_link: string }>(
      'POST', 
      plan === 'monthly' ? '/billing/subscribe' : '/billing/subscribe-annual'
    );
  }

  async cancelSubscription() {
    return this.request('DELETE', '/billing/cancel');
  }

  async getSubscriptionStatus() {
    return this.request('GET', '/billing/status');
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
  avatarColor: string | null;
  nativeLanguage: string;
  englishLevel: number;
  plan: 'FREE' | 'TRIAL' | 'PAID';
  planExpiresAt: string | null;
  xpTotal: number;
  streakDays: number;
  timezone: string;
  locale: string;
  twoFaEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
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

export interface Scenario {
  id: string;
  title: string;
  character: string;
}

export interface AIChatResponse {
  sessionId: string;
  message: string;
  correction?: any;
}

export interface SessionFeedback {
  scores: { grammar: number; vocabulary: number; fluency: number };
  summary: string;
  mistakes: string[];
  recommendations: string[];
}

export const api = new ApiClient(API_BASE_URL);
