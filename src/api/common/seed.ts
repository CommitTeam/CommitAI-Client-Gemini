// Database seeding - Used on app initialization
import { User, Commitment, Vote } from '@/types';
import { UserStorage, CommitmentStorage, VoteStorage, LogStorage } from '@/services/storage';
import {
  MOCK_NAMES,
  MOCK_GYMS,
  WORKOUT_TYPES,
  WORKOUT_TARGETS,
  WORKOUT_TIMES,
} from '@/constants';

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateId = (prefix: string = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const generateVotes = (backCount: number, calloutCount: number): Vote[] => {
  const votes: Vote[] = [];
  for (let i = 0; i < backCount; i++) {
    votes.push({ userId: `mock_${i}`, type: 'back' });
  }
  for (let i = 0; i < calloutCount; i++) {
    votes.push({ userId: `mock_callout_${i}`, type: 'callout' });
  }
  return votes;
};

const generateStandardWorkout = (): string => {
  const type = getRandomItem(WORKOUT_TYPES);
  const targets = WORKOUT_TARGETS[type];
  const target = getRandomItem(targets);
  const time = getRandomItem(WORKOUT_TIMES);
  return `${target} ${type} in ${time}`;
};

export const seedDatabase = async (): Promise<void> => {
  console.log('Seeding Database...');

  const existingUsers = await UserStorage.loadAll();
  if (existingUsers && existingUsers.length > 0) {
    console.log('Database already seeded');
    return;
  }

  const mockUsers: User[] = MOCK_NAMES.slice(0, 20).map((name, i) => {
    const coinHistory = [];
    const wins = Math.floor(Math.random() * 50);

    for (let j = 0; j < wins; j++) {
      coinHistory.push({
        id: `tx_seed_${i}_${j}`,
        type: 'BET_WON' as const,
        amount: 60,
        description: 'Points Surge (Win)',
        timestamp: Date.now() - Math.floor(Math.random() * 1000000000),
      });
    }

    const gym = Math.random() > 0.2 ? getRandomItem(MOCK_GYMS) : undefined;

    return {
      id: `u_${name.toLowerCase()}`,
      name,
      avatar: '',
      gym,
      level: Math.floor(Math.random() * 10) + 1,
      coins: Math.floor(Math.random() * 5000) + 500,
      coinHistory,
      stats: {
        currentStreak: Math.floor(Math.random() * 20),
        bestStreak: Math.floor(Math.random() * 50),
        totalWorkouts: Math.floor(Math.random() * 200),
        badges: Math.random() > 0.5 ? ['7-day'] : [],
        workoutBreakdown: {},
      },
      inventory: ['skin_default'],
      equipped: { skin: 'skin_default' },
      lastActiveAt: Date.now(),
    };
  });

  const mockCommitments: Commitment[] = [];
  for (let i = 0; i < 25; i++) {
    const user = mockUsers[i % mockUsers.length];
    const title = generateStandardWorkout();
    const backVotes = Math.floor(Math.random() * 50);
    const calloutVotes = Math.floor(Math.random() * 20);

    mockCommitments.push({
      id: `c_${i}`,
      user,
      workoutTitle: title,
      deadline: Date.now() + Math.random() * 86400000,
      votes: generateVotes(backVotes, calloutVotes),
    });
  }

  await UserStorage.saveAll(mockUsers);
  await CommitmentStorage.saveAll(mockCommitments);
  await VoteStorage.saveAll([]);
  await LogStorage.saveAll([]);

  console.log('Database seeded successfully');
};
