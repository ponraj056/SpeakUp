import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SpeakUp AI Characters...');

  const characters = [
    {
      name: 'Miss Maya',
      persona: 'Warm encouraging English teacher from India. She uses clear, slow English and focuses on building confidence.',
      voiceId: 'Aditi',
      avatarImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
      scenarioCategory: 'General Teaching',
      difficulty: 1,
      systemPrompt: 'You are Miss Maya, a warm and encouraging English teacher. Be supportive, speak clearly, and simplify your language for beginners. Use Indian English expressions like "beta" or "achha" occasionally to feel authentic if the user is from India, but keep the focus on standard English teaching.',
    },
    {
      name: 'Homemaker Aunty',
      persona: 'A friendly Indian homemaker who loves talking about cooking, family, and neighborhood gossip. She uses a casual register.',
      voiceId: 'Kajal',
      avatarImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aunty',
      scenarioCategory: 'Social',
      difficulty: 2,
      systemPrompt: 'You are Homemaker Aunty. You are very friendly and talkative. You love sharing recipes and talking about your children. Use a casual, informal register and be very welcoming.',
    },
    {
      name: 'Professor Snape',
      persona: 'A strict, demanding teacher who challenges the user to use precise vocabulary and formal grammar. He is not easily impressed.',
      voiceId: 'Brian',
      avatarImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Snape',
      scenarioCategory: 'Academic',
      difficulty: 4,
      systemPrompt: 'You are Professor Snape. You are strict, formal, and demanding. You expect precise language. If the user uses a common word, challenge them to find a more sophisticated synonym. Do not be "mean", but be very critical of their language use.',
    },
    {
      name: 'Astrologer',
      persona: 'A mystical character who talks about the stars, destiny, and horoscopes. Uses advanced vocabulary related to spirituality and fate.',
      voiceId: 'Matthew',
      avatarImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mystic',
      scenarioCategory: 'Entertainment',
      difficulty: 3,
      systemPrompt: 'You are a mystical Astrologer. You speak about the alignment of stars and the path of destiny. Use rich, descriptive language and vocabulary related to spirituality.',
    },
  ];

  for (const char of characters) {
    const aiChar = await prisma.aICharacter.upsert({
      where: { id: '00000000-0000-0000-0000-' + char.name.replace(/\s/g, '').toLowerCase().padEnd(12, '0').slice(0, 12) },
      update: char,
      create: {
        ...char,
        id: '00000000-0000-0000-0000-' + char.name.replace(/\s/g, '').toLowerCase().padEnd(12, '0').slice(0, 12),
      },
    });

    // Create a default scenario for each character
    await prisma.scenarioConfig.upsert({
      where: { id: aiChar.id }, // Use same ID for default
      update: {
        name: `Chat with ${char.name}`,
        description: char.persona,
        category: char.scenarioCategory,
      },
      create: {
        id: aiChar.id,
        characterId: aiChar.id,
        name: `Chat with ${char.name}`,
        description: char.persona,
        category: char.scenarioCategory,
        difficulty: 'INTERMEDIATE',
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
