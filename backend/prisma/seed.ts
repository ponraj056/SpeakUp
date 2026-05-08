import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin User ──
  const adminPass = await argon2.hash('Admin@123', { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@speakup.app' },
    update: {},
    create: { email: 'admin@speakup.app', passwordHash: adminPass, displayName: 'Admin', role: 'ADMIN', plan: 'PRO', currentLevel: 'C1', emailVerified: true, xpTotal: 5000, streakDays: 30 },
  });
  console.log('  ✅ Admin user created:', admin.email);

  // ── Demo Learner ──
  const learnerPass = await argon2.hash('Learner@123', { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
  const learner = await prisma.user.upsert({
    where: { email: 'learner@speakup.app' },
    update: {},
    create: { email: 'learner@speakup.app', passwordHash: learnerPass, displayName: 'Demo Learner', role: 'LEARNER', plan: 'FREE', currentLevel: 'A2', emailVerified: true, xpTotal: 350, streakDays: 5 },
  });
  console.log('  ✅ Learner created:', learner.email);

  // ── Lessons ──
  const lessons = [
    { title: 'Present Simple vs Present Continuous', slug: 'present-simple-continuous', category: 'GRAMMAR' as const, level: 'A2' as const, durationSeconds: 420, xpReward: 15, contentJson: { sections: [{ type: 'text', content: 'Learn the difference between present simple and continuous tenses.' }, { type: 'example', content: 'I work vs I am working' }] }, tags: ['tenses', 'beginner'], isPublished: true, orderIndex: 1 },
    { title: "The 'TH' Sound: Voiced & Voiceless", slug: 'th-sound-mastery', category: 'PRONUNCIATION' as const, level: 'A2' as const, durationSeconds: 360, xpReward: 10, contentJson: { sections: [{ type: 'text', content: 'Master both TH sounds in English.' }] }, tags: ['sounds', 'th'], isPublished: true, orderIndex: 2 },
    { title: 'Essential Travel Vocabulary', slug: 'travel-vocabulary', category: 'VOCABULARY' as const, level: 'A1' as const, durationSeconds: 300, xpReward: 10, contentJson: { sections: [{ type: 'text', content: '50 essential words for traveling.' }] }, tags: ['travel', 'beginner'], isPublished: true, orderIndex: 3 },
    { title: 'Making Small Talk', slug: 'small-talk-skills', category: 'SPEAKING_SKILLS' as const, level: 'B1' as const, durationSeconds: 480, xpReward: 20, contentJson: { sections: [{ type: 'text', content: 'How to start and maintain casual conversations.' }] }, tags: ['social', 'conversation'], isPublished: true, orderIndex: 4 },
    { title: 'Past Perfect & Narratives', slug: 'past-perfect-narratives', category: 'GRAMMAR' as const, level: 'B1' as const, durationSeconds: 420, xpReward: 20, contentJson: { sections: [{ type: 'text', content: 'Use past perfect to tell stories.' }] }, tags: ['tenses', 'intermediate'], isPublished: true, orderIndex: 5 },
    { title: 'Connected Speech & Linking', slug: 'connected-speech-linking', category: 'PRONUNCIATION' as const, level: 'B2' as const, durationSeconds: 360, xpReward: 25, contentJson: { sections: [{ type: 'text', content: 'Sound more natural with connected speech.' }] }, tags: ['fluency'], isPublished: true, isPremium: true, orderIndex: 6 },
    { title: 'Business Idioms & Collocations', slug: 'business-idioms-collocations', category: 'VOCABULARY' as const, level: 'B2' as const, durationSeconds: 480, xpReward: 25, contentJson: { sections: [{ type: 'text', content: 'Essential business expressions.' }] }, tags: ['business', 'idioms'], isPublished: true, isPremium: true, orderIndex: 7 },
    { title: 'Intonation Patterns in Questions', slug: 'intonation-patterns', category: 'SPEAKING_SKILLS' as const, level: 'B1' as const, durationSeconds: 360, xpReward: 15, contentJson: { sections: [{ type: 'text', content: 'How your voice rises and falls in questions.' }] }, tags: ['intonation'], isPublished: true, orderIndex: 8 },
    { title: 'Conditional Sentences (0-3)', slug: 'conditional-sentences', category: 'GRAMMAR' as const, level: 'B2' as const, durationSeconds: 540, xpReward: 30, contentJson: { sections: [{ type: 'text', content: 'Master all four conditional types.' }] }, tags: ['conditionals'], isPublished: true, isPremium: true, orderIndex: 9 },
    { title: 'Vowel Sounds: Ship vs Sheep', slug: 'vowel-minimal-pairs', category: 'PRONUNCIATION' as const, level: 'A1' as const, durationSeconds: 300, xpReward: 10, contentJson: { sections: [{ type: 'text', content: 'Distinguish minimal pairs in English.' }] }, tags: ['vowels'], isPublished: true, orderIndex: 10 },
  ];

  for (const lesson of lessons) {
    await prisma.lesson.upsert({ where: { slug: lesson.slug }, update: {}, create: lesson });
  }
  console.log(`  ✅ ${lessons.length} lessons seeded`);

  // ── Quiz Questions ──
  const quizzes = [
    { type: 'MULTIPLE_CHOICE' as const, level: 'A1' as const, prompt: 'She ___ to work every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 'goes', explanation: "Third person singular present simple uses 'goes'.", tags: ['present-simple'] },
    { type: 'FILL_BLANK' as const, level: 'A2' as const, prompt: 'I have been ___ (wait) for an hour.', options: null, correctAnswer: 'waiting', explanation: 'Present perfect continuous: have been + verb-ing.', tags: ['perfect-continuous'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'B1' as const, prompt: 'If I ___ you, I would apologize.', options: ['am', 'was', 'were', 'be'], correctAnswer: 'were', explanation: "Second conditional uses 'were' for all subjects.", tags: ['conditionals'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'A2' as const, prompt: 'The news ___ shocking.', options: ['is', 'are', 'were', 'have'], correctAnswer: 'is', explanation: "'News' is uncountable and takes singular verb.", tags: ['uncountable'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'B1' as const, prompt: 'He suggested ___ a break.', options: ['to take', 'taking', 'take', 'took'], correctAnswer: 'taking', explanation: "'Suggest' is followed by a gerund.", tags: ['gerunds'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'B1' as const, prompt: 'I wish I ___ more time.', options: ['have', 'had', 'has', 'having'], correctAnswer: 'had', explanation: "After 'wish' for present, use past simple.", tags: ['wish'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'A1' as const, prompt: '___ you like some coffee?', options: ['Do', 'Would', 'Are', 'Have'], correctAnswer: 'Would', explanation: "'Would you like' is used for polite offers.", tags: ['polite'] },
    { type: 'MULTIPLE_CHOICE' as const, level: 'B2' as const, prompt: 'Neither the students nor the teacher ___ present.', options: ['was', 'were', 'is', 'are'], correctAnswer: 'was', explanation: "With 'neither...nor', verb agrees with nearest subject.", tags: ['subject-verb'] },
  ];

  for (const q of quizzes) {
    await prisma.quizQuestion.create({ data: q });
  }
  console.log(`  ✅ ${quizzes.length} quiz questions seeded`);

  // ── Phrases ──
  const phrases = [
    { text: "Could I have the bill, please?", situation: "restaurant", formality: "PROFESSIONAL" as const, level: "A2" as const, usageNote: "Use 'check' in American English" },
    { text: "I'd like to check in, please.", situation: "hotel", formality: "PROFESSIONAL" as const, level: "A1" as const, usageNote: "Standard hotel check-in" },
    { text: "Where's the nearest ATM?", situation: "travel", formality: "CASUAL" as const, level: "A1" as const, usageNote: "'Cash machine' in British English" },
    { text: "I'm afraid I have a complaint.", situation: "hotel", formality: "FORMAL" as const, level: "B1" as const, usageNote: "Polite way to complain" },
    { text: "Could you tell me the way to...?", situation: "travel", formality: "PROFESSIONAL" as const, level: "A2" as const, usageNote: "More polite than 'Where is...?'" },
    { text: "I've been experiencing some discomfort.", situation: "doctor", formality: "PROFESSIONAL" as const, level: "B1" as const, usageNote: "Medical consultation starter" },
    { text: "What would you recommend?", situation: "restaurant", formality: "CASUAL" as const, level: "A2" as const, usageNote: "Asking waiter for suggestions" },
    { text: "I'd like to try this on.", situation: "shopping", formality: "CASUAL" as const, level: "A1" as const, usageNote: "Trying on clothes" },
    { text: "My flight has been delayed.", situation: "airport", formality: "PROFESSIONAL" as const, level: "A2" as const, usageNote: "At the airline desk" },
    { text: "Let me walk you through the agenda.", situation: "meeting", formality: "PROFESSIONAL" as const, level: "B2" as const, usageNote: "Opening a meeting" },
    { text: "I'm calling regarding...", situation: "phone", formality: "FORMAL" as const, level: "B1" as const, usageNote: "Phone call opener" },
    { text: "What do you do for fun?", situation: "social", formality: "CASUAL" as const, level: "A1" as const, usageNote: "Small talk question" },
    { text: "Could you put me through to...?", situation: "phone", formality: "FORMAL" as const, level: "B1" as const, usageNote: "Asking to be transferred" },
    { text: "I believe I'm well-suited for this role.", situation: "interview", formality: "FORMAL" as const, level: "B2" as const, usageNote: "Interview statement" },
    { text: "It's on the house.", situation: "restaurant", formality: "CASUAL" as const, level: "B1" as const, usageNote: "Means 'it's free'" },
  ];

  for (const p of phrases) {
    await prisma.phrase.create({ data: p });
  }
  console.log(`  ✅ ${phrases.length} phrases seeded`);

  // ── Achievements ──
  const achievements = [
    { key: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson', xpReward: 10, criteria: { type: 'lessons_completed', count: 1 } },
    { key: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', xpReward: 50, criteria: { type: 'streak', count: 7 } },
    { key: 'streak_30', title: 'Monthly Master', description: '30-day streak!', xpReward: 200, criteria: { type: 'streak', count: 30 } },
    { key: 'words_100', title: 'Word Collector', description: 'Learn 100 words', xpReward: 50, criteria: { type: 'words_learned', count: 100 } },
    { key: 'ai_10', title: 'Conversationalist', description: 'Complete 10 AI sessions', xpReward: 50, criteria: { type: 'ai_sessions', count: 10 } },
    { key: 'level_up', title: 'Level Up', description: 'Reach CEFR level B1', xpReward: 100, criteria: { type: 'cefr_level', level: 'B1' } },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a });
  }
  console.log(`  ✅ ${achievements.length} achievements seeded`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('   Admin:   admin@speakup.app / Admin@123');
  console.log('   Learner: learner@speakup.app / Learner@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
