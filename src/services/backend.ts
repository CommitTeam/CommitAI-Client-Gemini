// ============================================
// CommitAI Mobile - Backend Service
// Mock backend using AsyncStorage
// ============================================

import {
  User,
  Commitment,
  CoinTransaction,
  ActivityLog,
  Vote,
  LeaderboardEntry,
  GymLeaderboardEntry,
  Gym,
  VoteResponse,
} from '@/types';
import {
  UserStorage,
  CommitmentStorage,
  VoteStorage,
  LogStorage,
  saveData,
  loadData,
} from './storage';
import {
  STORAGE_KEYS,
  MOCK_NAMES,
  MOCK_GYMS,
  WORKOUT_TYPES,
  WORKOUT_TARGETS,
  WORKOUT_TIMES,
  VOTE_CONFIG,
  STORE_CATALOG,
} from '@/constants';

// ---------- Helpers ----------

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

// ---------- Database Seeding ----------

export const seedDatabase = async (): Promise<void> => {
  console.log('Seeding Database...');

  const existingUsers = await UserStorage.loadAll();
  if (existingUsers && existingUsers.length > 0) {
    console.log('Database already seeded');
    return;
  }

  const mockUsers: User[] = MOCK_NAMES.slice(0, 20).map((name, i) => {
    const coinHistory: CoinTransaction[] = [];
    const wins = Math.floor(Math.random() * 50);

    for (let j = 0; j < wins; j++) {
      coinHistory.push({
        id: `tx_seed_${i}_${j}`,
        type: 'BET_WON',
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

// ---------- User Operations ----------

export const loginUser = async (username: string): Promise<User> => {
  await delay(300);

  const users = (await UserStorage.loadAll()) || [];
  let user = users.find((u) => u.name.toLowerCase() === username.toLowerCase());

  if (!user) {
    // Create new user
    user = {
      id: generateId('u'),
      name: username,
      avatar: '',
      level: 1,
      coins: 500,
      coinHistory: [
        {
          id: generateId('tx'),
          type: 'SIGNUP_BONUS',
          amount: 500,
          description: 'Welcome Bonus!',
          timestamp: Date.now(),
        },
      ],
      stats: {
        currentStreak: 0,
        bestStreak: 0,
        totalWorkouts: 0,
        badges: [],
        workoutBreakdown: {},
      },
      inventory: ['skin_default'],
      equipped: { skin: 'skin_default' },
      lastActiveAt: Date.now(),
    };

    users.push(user);
    await UserStorage.saveAll(users);
  } else {
    // Update last active
    user.lastActiveAt = Date.now();
    const index = users.findIndex((u) => u.id === user!.id);
    users[index] = user;
    await UserStorage.saveAll(users);
  }

  await UserStorage.saveCurrent(user);
  await logActivity(user.id, 'LOGIN');

  return user;
};

export const updateUserAvatar = async (
  userId: string,
  avatarUrl: string
): Promise<User | null> => {
  await delay(200);

  const users = (await UserStorage.loadAll()) || [];
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return null;

  users[index].avatar = avatarUrl;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(users[index]);

  return users[index];
};

export const updateUser = async (user: User): Promise<User> => {
  const users = (await UserStorage.loadAll()) || [];
  const index = users.findIndex((u) => u.id === user.id);

  if (index !== -1) {
    users[index] = user;
    await UserStorage.saveAll(users);
  }

  await UserStorage.saveCurrent(user);
  return user;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const users = (await UserStorage.loadAll()) || [];
  const filtered = users.filter((u) => u.id !== userId);
  await UserStorage.saveAll(filtered);
  await UserStorage.clearCurrent();
  return true;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const users = (await UserStorage.loadAll()) || [];
  return users.find((u) => u.id === userId) || null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  return await UserStorage.loadCurrent();
};

// ---------- Commitment Operations ----------

export const createCommitment = async (
  user: User,
  workoutTitle: string,
  deadline: number
): Promise<Commitment> => {
  const commitment: Commitment = {
    id: generateId('c'),
    user,
    workoutTitle,
    deadline,
    votes: [],
  };

  const commitments = (await CommitmentStorage.loadAll()) || [];
  commitments.unshift(commitment);
  await CommitmentStorage.saveAll(commitments);

  await logActivity(user.id, 'CREATE_COMMITMENT', { workoutTitle });

  return commitment;
};

export const getFeed = async (currentUserId: string): Promise<Commitment[]> => {
  await delay(100);

  const commitments = (await CommitmentStorage.loadAll()) || [];
  const globalVotes = (await VoteStorage.loadAll()) || [];

  return commitments.map((c) => {
    const userVote = globalVotes.find(
      (v: any) => v.userId === currentUserId && v.targetId === c.id
    );
    return {
      ...c,
      currentUserVote: userVote?.type,
    };
  });
};

// ---------- Voting Operations ----------

export const placeVote = async (
  userId: string,
  commitmentId: string,
  type: 'back' | 'callout'
): Promise<VoteResponse> => {
  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }

  const user = users[userIndex];
  const globalVotes = (await VoteStorage.loadAll()) || [];

  // Check for existing vote
  const existingVote = globalVotes.find(
    (v: any) => v.userId === userId && v.targetId === commitmentId
  );

  if (existingVote) {
    return {
      success: false,
      message: "You already voted! Move on. Boost someone else's ego!",
    };
  }

  // Check coins
  if (user.coins < VOTE_CONFIG.COST) {
    return { success: false, message: 'Low Points. Recharge required.' };
  }

  // Check if live session (mock)
  const isLive = commitmentId.startsWith('l_');

  if (!isLive) {
    const commitments = (await CommitmentStorage.loadAll()) || [];
    const commIndex = commitments.findIndex((c) => c.id === commitmentId);

    if (commIndex === -1) {
      return { success: false, message: 'Commitment not found' };
    }

    commitments[commIndex].votes.push({ userId, type });
    await CommitmentStorage.saveAll(commitments);
  }

  // Deduct coins
  user.coins -= VOTE_CONFIG.COST;
  const tx: CoinTransaction = {
    id: generateId('tx'),
    type: 'BET_PLACED',
    amount: -VOTE_CONFIG.COST,
    description: `Vote (${type.toUpperCase()}) on ${isLive ? 'Live Session' : 'User'}`,
    timestamp: Date.now(),
  };
  user.coinHistory.push(tx);

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  // Record global vote
  globalVotes.push({
    userId,
    targetId: commitmentId,
    type,
    timestamp: Date.now(),
  });
  await VoteStorage.saveAll(globalVotes);

  await logActivity(userId, 'PLACE_BET', { commitmentId, type, isLive });

  return { success: true, message: 'Vote Placed!', updatedUser: user };
};

// ---------- Leaderboard Operations ----------

export const getLeaderboard = async (
  type: 'top_humans' | 'friends' | 'workouts_done' | 'top_gyms',
  currentUserId: string
): Promise<LeaderboardEntry[] | GymLeaderboardEntry[]> => {
  await delay(200);

  const users = (await UserStorage.loadAll()) || [];
  let sortedUsers: User[] = [...users];

  const enhanceUser = (user: User, index: number): LeaderboardEntry => ({
    rank: index + 1,
    user,
    score: user.coins,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    isLive: Math.random() > 0.8,
    streak: user.stats.currentStreak || Math.floor(Math.random() * 10),
    recentHighlight:
      Math.random() > 0.5
        ? `${Math.floor(Math.random() * 5) + 2} day streak`
        : `Won ${Math.floor(Math.random() * 100) + 50} bets`,
  });

  if (type === 'top_gyms') {
    const gymMap = new Map<string, GymLeaderboardEntry>();
    MOCK_GYMS.forEach((gym) => {
      gymMap.set(gym.id, { rank: 0, gym, totalScore: 0 });
    });

    users.forEach((u) => {
      if (u.gym) {
        const entry = gymMap.get(u.gym.id);
        if (entry) {
          entry.totalScore += u.coins;
          if (!entry.mvpUser || u.coins > entry.mvpUser.coins) {
            entry.mvpUser = u;
          }
        }
      }
    });

    return Array.from(gymMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }

  if (type === 'friends') {
    sortedUsers = sortedUsers
      .filter((_, i) => i % 3 === 0)
      .sort((a, b) => b.coins - a.coins);
  } else if (type === 'workouts_done') {
    sortedUsers.sort((a, b) => b.stats.totalWorkouts - a.stats.totalWorkouts);
  } else {
    sortedUsers.sort((a, b) => b.coins - a.coins);
  }

  return sortedUsers.map(enhanceUser);
};

// ---------- Store Operations ----------

export const purchaseItem = async (
  userId: string,
  itemId: string
): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  const item = STORE_CATALOG.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, message: 'Item not found' };
  }

  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }

  const user = users[userIndex];

  if (user.inventory.includes(itemId)) {
    return { success: false, message: 'Already owned!' };
  }

  if (user.coins < item.price) {
    return { success: false, message: 'Not enough coins!' };
  }

  user.coins -= item.price;
  user.inventory.push(itemId);

  const tx: CoinTransaction = {
    id: generateId('tx'),
    type: 'STORE_PURCHASE',
    amount: -item.price,
    description: `Purchased ${item.name}`,
    timestamp: Date.now(),
  };
  user.coinHistory.push(tx);

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  return { success: true, message: 'Purchase successful!', updatedUser: user };
};

export const equipItem = async (
  userId: string,
  itemId: string
): Promise<User | null> => {
  const item = STORE_CATALOG.find((i) => i.id === itemId);
  if (!item) return null;

  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return null;

  const user = users[userIndex];

  if (!user.inventory.includes(itemId)) return null;

  if (item.type === 'skin') {
    user.equipped.skin = itemId;
  } else if (item.type === 'accessory') {
    user.equipped.accessory = itemId;
  } else if (item.type === 'effect') {
    user.equipped.effect = itemId;
  }

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  return user;
};

// ---------- Activity Logging ----------

export const logActivity = async (
  userId: string,
  actionType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  const logs = (await LogStorage.loadAll()) || [];
  const newLog: ActivityLog = {
    id: generateId('log'),
    userId,
    actionType,
    metadata,
    timestamp: Date.now(),
  };
  logs.push(newLog);
  await LogStorage.saveAll(logs);
};

export const getTimeSpent = async (userId: string): Promise<number> => {
  const logs = (await LogStorage.loadAll()) || [];
  const userLogs = logs.filter((l) => l.userId === userId);
  return userLogs.length * 5; // Mock: 5 mins per action
};

// ---------- Feedback ----------

export const sendFeedback = async (
  userId: string,
  message: string
): Promise<boolean> => {
  await delay(500);
  console.log(`[FEEDBACK] User ${userId}: ${message}`);
  await logActivity(userId, 'SEND_FEEDBACK', { messageLength: message.length });
  return true;
};

// ---------- Export All ----------

export default {
  seedDatabase,
  loginUser,
  updateUserAvatar,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  logout,
  createCommitment,
  getFeed,
  placeVote,
  getLeaderboard,
  purchaseItem,
  equipItem,
  logActivity,
  getTimeSpent,
  sendFeedback,
};
