import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/utils/errors';
import { AIChatInput } from '../../shared/schemas';

const SCENARIOS: Record<string, { title: string; systemPrompt: string; character: string }> = {
  job_interview: {
    title: 'Job Interview',
    character: 'HR Manager',
    systemPrompt: `You are an HR manager conducting a job interview. Ask relevant questions about experience and skills.`,
  },
  restaurant: {
    title: 'Restaurant',
    character: 'Waiter',
    systemPrompt: `You are a waiter at a restaurant. Help the customer order food.`,
  },
  airport: {
    title: 'Airport',
    character: 'Check-in Agent',
    systemPrompt: `You are an airport check-in agent helping with bags and boarding.`,
  },
  doctor: {
    title: "Doctor's Visit",
    character: 'Doctor',
    systemPrompt: `You are a doctor discussing symptoms with a patient.`,
  },
  phone_call: {
    title: 'Phone Call',
    character: 'Customer Service',
    systemPrompt: `You are a customer service rep resolving an issue.`,
  },
  shopping: {
    title: 'Shopping',
    character: 'Shop Assistant',
    systemPrompt: `You are a shop assistant helping with sizes and colors.`,
  },
  hotel: {
    title: 'Hotel',
    character: 'Receptionist',
    systemPrompt: `You are a hotel receptionist handling check-in.`,
  },
  meeting: {
    title: 'Business Meeting',
    character: 'Colleague',
    systemPrompt: `You are a colleague in a business meeting discussing project updates.`,
  },
  casual_chat: {
    title: 'Casual Chat',
    character: 'Friend',
    systemPrompt: `You are a friend having a relaxed chat about hobbies.`,
  },
  travel: {
    title: 'Travel',
    character: 'Tour Guide',
    systemPrompt: `You are a tour guide sharing info about local attractions.`,
  },
};

export class AIService {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;
  private polly: PollyClient | null = null;
  private s3: S3Client | null = null;

  constructor() {
    if (config.ai.anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: config.ai.anthropicKey });
    }
    if (config.ai.openaiKey) {
      this.openai = new OpenAI({ apiKey: config.ai.openaiKey });
    }
    if (config.aws.accessKeyId) {
      const awsCreds = {
        region: config.aws.region,
        credentials: {
          accessKeyId: config.aws.accessKeyId,
          secretAccessKey: config.aws.secretAccessKey!,
        },
      };
      this.polly = new PollyClient(awsCreds);
      this.s3 = new S3Client(awsCreds);
    }
  }

  async chatStream(userId: string, input: AIChatInput, userLevel: string, userPlan: any, onToken: (token: string) => void) {
    let session;
    const scenarioId = input.scenario || 'casual_chat';
    const character = SCENARIOS[scenarioId] || SCENARIOS.casual_chat;

    if (input.sessionId) {
      session = await prisma.practiceSession.findUnique({
        where: { id: input.sessionId, userId },
      });
    } else {
      session = await prisma.practiceSession.create({
        data: {
          userId,
          mode: 'HUMAN_AI',
          scenario: scenarioId,
          difficulty: input.difficulty || 'STANDARD',
          aiPersona: character.character,
          messages: [],
        },
      });
    }

    if (!session) throw AppError.notFound('Session not found');

    const messages = (session.messages as any[]) || [];
    messages.push({ role: 'user', content: input.message, timestamp: new Date().toISOString() });

    const systemPrompt = `${character.systemPrompt}
The user's English level is ${userLevel}. Adapt your language to match this level.

Always include a JSON block with corrections at the end of every response if the user made any mistakes.
Format: \`\`\`json { "correction": { "errors": [{ "original": "...", "corrected": "...", "type": "...", "explanation": "...", "severity": "LOW|MEDIUM|HIGH" }], "score": 85, "betterWay": "..." } } \`\`\``;

    let assistantMsg = '';
    let correction: any = null;

    if (this.anthropic) {
      const stream = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text') {
          const token = event.delta.text;
          assistantMsg += token;
          onToken(token);
        }
      }
    } else {
      // Mock for development
      const mockMsg = `Hello! I'm your ${character.character}. Practice makes perfect! \n\n \`\`\`json { "correction": { "errors": [], "score": 100, "betterWay": "Great sentence!" } } \`\`\``;
      for (const char of mockMsg) {
        assistantMsg += char;
        onToken(char);
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // Extract JSON correction if present
    const jsonMatch = assistantMsg.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        correction = parsed.correction;
        // Clean assistant message from JSON block for better display
        assistantMsg = assistantMsg.replace(jsonMatch[0], '').trim();
      } catch (e) {
        console.error('Failed to parse AI correction JSON', e);
      }
    }

    messages.push({ 
      role: 'assistant', 
      content: assistantMsg, 
      timestamp: new Date().toISOString(),
      correction 
    });

    await prisma.practiceSession.update({
      where: { id: session.id },
      data: { messages },
    });

    return { sessionId: session.id, correction };
  }

  async getScenarios() {
    return Object.entries(SCENARIOS).map(([id, s]) => ({
      id,
      title: s.title,
      character: s.character
    }));
  }

  async endSession(sessionId: string, userId: string) {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId, userId }
    });
    if (!session) throw AppError.notFound('Session not found');

    const duration = Math.floor((new Date().getTime() - session.createdAt.getTime()) / 1000);
    
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { 
        endedAt: new Date(),
        durationSeconds: duration
      }
    });

    return { duration };
  }
  async grammarCheck(text: string, level: string) {
    if (!this.anthropic) {
      return { score: 100, betterWay: "Perfect!", errors: [] };
    }
    const response = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `Analyze the English text. Provide a JSON response: { "score": 0-100, "betterWay": "...", "errors": [{ "original": "...", "corrected": "...", "type": "...", "explanation": "...", "severity": "LOW|MEDIUM|HIGH" }] }`,
      messages: [{ role: 'user', content: text }],
    });
    
    try {
      const content = response.content[0];
      if (content.type === 'text') {
        const matchWithTags = content.text.match(/```json\s*([\s\S]*?)\s*```/);
        const matchWithoutTags = content.text.match(/{[\s\S]*}/);
        const jsonStr = matchWithTags ? matchWithTags[1] : (matchWithoutTags ? matchWithoutTags[0] : null);
        if (jsonStr) return JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Failed to parse grammar JSON', e);
    }
    return { score: 90, betterWay: text, errors: [] };
  }

  async getSessionFeedback(sessionId: string, userId: string) {
    const session = await prisma.practiceSession.findUnique({
      where: { id: sessionId, userId }
    });
    if (!session) throw AppError.notFound('Session not found');

    return {
      session: {
        id: session.id,
        scenario: session.scenario,
        difficulty: session.difficulty,
        messageCount: (session.messages as any[]).length,
        durationSeconds: session.durationSeconds,
      },
      scores: { grammar: 85, vocabulary: 80, fluency: 75, pronunciation: 80 },
      feedback: {
        topMistakeTypes: [{ type: "Verb Tense", count: 2, drillLink: "/drills/verb-tenses" }],
        strengths: ["Clear participation"],
        improvements: ["Use more past tense"],
        overallFeedback: `Good job practicing!`,
      },
      messages: session.messages,
    };
  }
}

export const aiService = new AIService();
