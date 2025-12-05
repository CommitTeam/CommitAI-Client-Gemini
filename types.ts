
export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "1 min"
  intensity: 'Low' | 'Medium' | 'High';
}

export interface Gym {
  id: string;
  name: string;
  location?: string;
  isPartner: boolean; // Verified status
  memberCount: number;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  totalWorkouts: number;
  badges: string[]; // e.g. '3-day', '7-day'
  workoutBreakdown: Record<string, number>; // e.g. { 'Pushups': 1200, 'Squats': 500 }
}

export interface CoinTransaction {
  id: string;
  type: 'BET_PLACED' | 'BET_WON' | 'WORKOUT_REWARD' | 'DAILY_LOGIN' | 'SIGNUP_BONUS' | 'STORE_PURCHASE';
  amount: number;
  description: string;
  timestamp: number;
}

// --- STORE TYPES ---
export interface StoreItem {
  id: string;
  type: 'skin' | 'apparel' | 'accessory' | 'effect' | 'gift_card';
  name: string;
  description: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string; // Emoji or Image URL
  visualAsset: string; // CSS Class or Asset URL
}

export interface User {
  id: string;
  name: string;
  avatar: string; // URL or empty
  gym?: Gym; // Gym Affiliation
  level: number;
  coins: number;
  coinHistory: CoinTransaction[];
  stats: UserStats;
  dailyTagline?: {
    text: string;
    generatedAt: number;
  };
  nextMission?: string; // e.g., "Do 50 Pushups"
  lastActiveAt: number;
  
  // Inventory System
  inventory: string[]; // List of StoreItem IDs
  equipped: {
    skin: string; // StoreItem ID
    accessory?: string; // StoreItem ID
    effect?: string; // StoreItem ID
  };
}

export interface Bet {
  userId: string;
  prediction: 'success' | 'fail';
}

export interface Vote {
  userId: string;
  type: 'back' | 'callout';
}

// Legacy Challenge type for backward compatibility if needed, 
// but we are moving towards Activity types
export interface Challenge {
  id: string;
  user: User;
  workout: Workout;
  status: 'pending' | 'active' | 'completed' | 'failed';
  bets: Bet[];
  roast?: string; 
  roastAudio?: string;
  timestamp: number;
}

// New Types for Feed
export interface LiveSession {
  id: string;
  user: User;
  workoutTitle: string;
  viewers: number;
  hypeScore: number;
  thumbnail?: string; // Mock image URL
  currentReps?: number;
  totalReps?: number;
}

export interface Commitment {
  id: string;
  user: User;
  workoutTitle: string;
  deadline: number; // Timestamp
  votes: Vote[];
  currentUserVote?: 'back' | 'callout';
}

// Gamification Types
export interface Quest {
  id: string;
  title: string;
  description: string;
  metric: 'PUSHUPS' | 'SQUATS' | 'STEPS' | 'CALORIES' | 'LOGINS';
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  status: 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED' | 'CLAIMED';
  expiresAt: number;
  progress: number;
}

// Backend Activity Log Type
export interface ActivityLog {
    id: string;
    userId: string;
    actionType: string;
    metadata?: any;
    timestamp: number;
}

export interface LeaderboardEntry {
    rank: number;
    user: User;
    score: number; // usually coins
    trend: 'up' | 'down' | 'same';
    isLive?: boolean;
    streak?: number;
    recentHighlight?: string; // e.g. "Won 3 bets"
}

export interface GymLeaderboardEntry {
    rank: number;
    gym: Gym;
    totalScore: number;
    mvpUser?: User;
}

// Gemini Types
export interface RoastResponse {
  text: string;
}

// Notification Types
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'social' | 'streak' | 'vote';
  timestamp: number;
}