// Leaderboard API - Used by LeaderboardScreen
import { User, LeaderboardEntry, GymLeaderboardEntry } from '@/types';
import { UserStorage } from '@/services/storage';
import { MOCK_GYMS } from '@/constants';
import { delay } from '../common/utils';

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
