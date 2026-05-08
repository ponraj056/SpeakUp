import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { config } from '../../config/env';
import { AppError } from '../../shared/errors';
import { AIChatInput, GrammarCheckInput } from '../../shared/schemas';
import { AIDifficulty, CEFRLevel } from '@prisma/client';

/** AI scenario configurations with character prompts */
const SCENARIOS: Record<string, { title: string; systemPrompt: string; character: string }> = {
  job_interview: {
    title: 'Job Interview',
    character: 'HR Manager',
    systemPrompt: `You are an HR manager conducting a job interview. Ask relevant questions about experience, skills, and motivation. Be professional but friendly. Evaluate the candidate's English communication.`,
  },
  restaurant: {
    title: 'Restaurant',
    character: 'Waiter',
    systemPrompt: `You are a friendly waiter at a restaurant. Help the customer order food, suggest specials, and handle requests. Be patient and helpful.`,
  },
  airport: {
    title: 'Airport',
    character: 'Check-in Agent',
    systemPrompt: `You are an airport check-in agent. Help the passenger with check-in, baggage, boarding passes, and answer questions about their flight.`,
  },
  doctor: {
    title: "Doctor's Visit",
    character: 'Doctor',
    systemPrompt: `You are a general practitioner doctor. Ask about symptoms, provide basic advice, and schedule follow-ups. Be empathetic and clear.`,
  },
  phone_call: {
    title: 'Phone Call',
    character: 'Customer Service',
    systemPrompt: `You are a customer service representative handling a phone call. Help resolve issues, take orders, or answer inquiries professionally.`,
  },
  shopping: {
    title: 'Shopping',
    character: 'Shop Assistant',
    systemPrompt: `You are a helpful shop assistant. Help the customer find products, discuss sizes/colors, handle returns, and process purchases.`,
  },
  hotel: {
    title: 'Hotel',
    character: 'Receptionist',
    systemPrompt: `You are a hotel receptionist. Handle check-in/check-out, room requests, recommendations for local attractions, and resolve complaints.`,
  },
  meeting: {
    title: 'Business Meeting',
    character: 'Colleague',
    systemPrompt: `You are a colleague in a business meeting. Discuss project updates, brainstorm ideas, and make decisions. Be collaborative and professional.`,
  },
  casual_chat: {
    title: 'Casual Chat',
    character: 'Friend',
    systemPrompt: `You are a friendly person having a casual conversation. Talk about hobbies, weekend plans, movies, food, or travel. Be relaxed and engaging.`,
  },
  travel: {
    title: 'Travel',
    character: 'Tour Guide',
    systemPrompt: `You are a knowledgeable tour guide. Share information about attractions, help with directions, recommend activities, and tell interesting stories.`,
  },
};

/** CEFR level vocabulary guidelines */
const LEVEL_GUIDELINES: Record<string, string> = {
  A1: 'Use only very simple words and short sentences. Max 10 words per response. Basic present tense only.',
  A2: 'Use simple everyday vocabulary. Short sentences with basic grammar. Present and past tense.',
  B1: 'Use intermediate vocabulary. Moderate sentence length. Include some idioms. All common tenses.',
  B2: 'Use upper-intermediate vocabulary. Complex sentences allowed. Include phrasal verbs and idioms.',
  C1: 'Use advanced vocabulary naturally. Complex grammar, nuanced expressions, and sophisticated language.',
};

const DAILY_AI_LIMIT_FREE = 3;
const AI_CACHE_TTL = 86400; // 24 hours

export class AIService {
  private client: Anthropic | null = null;

  private getClient(): Anthropic {
    if (!this.client) {
      if (!config.ai.anthropicKey) {
        throw AppError.internal('Anthropic API key not configured');
      }
      this.client = new Anthropic({ apiKey: config.ai.anthropicKey });
    }
    return this.client;
  }

  /**
   * Handle an AI conversation turn. Creates or continues a session.
   */
  async chat(userId: string, input: AIChatInput, userLevel: CEFRLevel, userPlan: string) {
    // Rate limit free users
    if (userPlan === 'FREE') {
      const todayKey = `ai:limit:${userId}:${new Date().toISOString().split('T')[0]}`;
      const count = await redis.incr(todayKey);
      if (count === 1) {
        await redis.expire(todayKey, 86400);
      }
      if (count > DAILY_AI_LIMIT_FREE) {
        throw AppError.tooMany(
          'Daily AI chat limit reached. Upgrade to Pro for unlimited conversations.'
        );
      }
    }

    let session;

    if (input.sessionId) {
      // Continue existing session
      session = await prisma.aISession.findUnique({
        where: { id: input.sessionId, userId },
      });
      if (!session) {
        throw AppError.notFound('Session not found');
      }
    } else {
      // Create new session
      const scenario = input.scenario || 'casual_chat';
      if (!SCENARIOS[scenario]) {
        throw AppError.badRequest('Invalid scenario');
      }

      session = await prisma.aISession.create({
        data: {
          userId,
          scenario,
          difficulty: (input.difficulty as AIDifficulty) || 'STANDARD',
          languageLevel: userLevel,
          messages: [],
        },
      });
    }

    // Build message history
    const messages = (session.messages as Array<{ role: string; content: string }>) || [];
    messages.push({ role: 'user', content: input.message });

    // Build system prompt
    const scenarioConfig = SCENARIOS[session.scenario] || SCENARIOS.casual_chat;
    const levelGuide = LEVEL_GUIDELINES[session.languageLevel] || LEVEL_GUIDELINES.B1;

    const difficultyInstructions: Record<string, string> = {
      GUIDED: 'Provide hints in parentheses after your response. Suggest what the user could say next.',
      STANDARD: 'Respond naturally. Correct major errors gently inline.',
      CHALLENGE: 'Respond naturally without any hints or corrections. Use advanced language.',
    };

    const systemPrompt = `${scenarioConfig.systemPrompt}

Language Level: ${session.languageLevel}. ${levelGuide}

Difficulty: ${session.difficulty}. ${difficultyInstructions[session.difficulty] || ''}

You are playing the role of: ${scenarioConfig.character}

IMPORTANT RULES:
- Stay in character at all times
- Adapt vocabulary complexity to the user's CEFR level (${session.languageLevel})
- Keep responses concise (2-4 sentences typically)
- If the user makes grammar mistakes, gently correct them in your response
- Be encouraging and supportive
- Respond ONLY in English`;

    // Check cache
    const cacheKey = `ai:cache:${session.scenario}:${session.difficulty}:${input.message.substring(0, 50)}`;
    const cached = await redis.get(cacheKey);

    let aiResponse: string;

    if (cached && messages.length <= 2) {
      // Use cached response for first exchanges
      aiResponse = cached;
    } else {
      // Call Claude API
      const client = this.getClient();
      const claudeMessages = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await client.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 500,
        system: systemPrompt,
        messages: claudeMessages,
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      aiResponse = textBlock?.text || 'I apologize, I could not generate a response.';

      // Cache first responses
      if (messages.length <= 2) {
        await redis.setex(cacheKey, AI_CACHE_TTL, aiResponse);
      }
    }

    // Add AI response to messages
    messages.push({ role: 'assistant', content: aiResponse });

    // Update session
    await prisma.aISession.update({
      where: { id: session.id },
      data: { messages },
    });

    return {
      sessionId: session.id,
      scenario: session.scenario,
      difficulty: session.difficulty,
      message: aiResponse,
      messageCount: messages.length,
    };
  }

  /**
   * Grammar check a text using Claude.
   */
  async grammarCheck(text: string, userLevel: CEFRLevel) {
    const client = this.getClient();

    const response = await client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1000,
      system: `You are an expert English grammar checker for ${userLevel} level learners.
Analyze the text and return a JSON object with:
- "correctedText": the corrected version
- "errors": array of {original, correction, explanation, type} where type is grammar/spelling/punctuation
- "score": 0-100 grammar score
- "suggestions": array of improvement tips

Return ONLY valid JSON, no markdown.`,
      messages: [{ role: 'user', content: text }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    try {
      return JSON.parse(textBlock?.text || '{}');
    } catch {
      return {
        correctedText: text,
        errors: [],
        score: 100,
        suggestions: [],
      };
    }
  }

  /**
   * End session and generate feedback card.
   */
  async endSession(sessionId: string, userId: string) {
    const session = await prisma.aISession.findUnique({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw AppError.notFound('Session not found');
    }

    const messages = session.messages as Array<{ role: string; content: string }>;
    const userMessages = messages.filter((m) => m.role === 'user');

    // Use Claude to generate feedback
    const client = this.getClient();
    const response = await client.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1000,
      system: `Analyze this English conversation and provide a feedback card. Return JSON only:
{
  "grammarScore": 0-100,
  "vocabularyScore": 0-100,
  "fluencyScore": 0-100,
  "topCorrections": [{"original": "", "corrected": "", "explanation": ""}],
  "newWords": ["word1", "word2"],
  "strengths": ["strength1"],
  "improvements": ["improvement1"],
  "overallFeedback": "paragraph of feedback"
}`,
      messages: [{
        role: 'user',
        content: `Conversation (user level: ${session.languageLevel}):\n${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    let feedback;
    try {
      feedback = JSON.parse(textBlock?.text || '{}');
    } catch {
      feedback = {
        grammarScore: 70,
        vocabularyScore: 70,
        fluencyScore: 70,
        topCorrections: [],
        newWords: [],
        strengths: [],
        improvements: [],
        overallFeedback: 'Good practice session!',
      };
    }

    // Calculate duration
    const duration = Math.floor(
      (new Date().getTime() - session.createdAt.getTime()) / 1000
    );

    // Update session with feedback
    await prisma.aISession.update({
      where: { id: sessionId },
      data: {
        grammarScore: feedback.grammarScore,
        vocabularyScore: feedback.vocabularyScore,
        fluencyScore: feedback.fluencyScore,
        feedbackJson: feedback,
        durationSeconds: duration,
        endedAt: new Date(),
      },
    });

    // Auto-add new words to vocabulary
    if (feedback.newWords?.length > 0) {
      for (const word of feedback.newWords.slice(0, 10)) {
        await prisma.userVocabulary.upsert({
          where: { userId_word: { userId, word } },
          create: {
            userId,
            word,
            sourceSessionId: sessionId,
            srsNextReview: new Date(Date.now() + 86400000), // tomorrow
          },
          update: {},
        });
      }
    }

    // Award XP based on conversation length
    const xpEarned = Math.min(userMessages.length * 5, 50);
    await prisma.user.update({
      where: { id: userId },
      data: { xpTotal: { increment: xpEarned } },
    });

    return { feedback, xpEarned, duration };
  }

  /** Get list of available scenarios */
  getScenarios() {
    return Object.entries(SCENARIOS).map(([key, value]) => ({
      id: key,
      title: value.title,
      character: value.character,
    }));
  }

  /** Get session feedback */
  async getSessionFeedback(sessionId: string, userId: string) {
    const session = await prisma.aISession.findUnique({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw AppError.notFound('Session not found');
    }

    return {
      session: {
        id: session.id,
        scenario: session.scenario,
        difficulty: session.difficulty,
        languageLevel: session.languageLevel,
        messageCount: (session.messages as unknown[]).length,
        durationSeconds: session.durationSeconds,
        endedAt: session.endedAt,
      },
      scores: {
        grammar: session.grammarScore,
        vocabulary: session.vocabularyScore,
        fluency: session.fluencyScore,
      },
      feedback: session.feedbackJson,
      messages: session.messages,
    };
  }
}

export const aiService = new AIService();
