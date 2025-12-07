// ============================================
// CommitAI Mobile - Type Definitions
// Converted from web version with RN additions
// ============================================

// ---------- Core Entities ----------

export interface Workout {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "1 min", "30 secs"
  intensity: 'Low' | 'Medium' | 'High';
}

export interface Gym {
  id: string;
  name: string;
  location?: string;
  isPartner: boolean;
  memberCount: number;
}

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  badges: string[]; // e.g. '3-day', '7-day'
  workoutBreakdown: Record<string, number>; // e.g. { 'Pushups': 1200 }
}

export interface CoinTransaction {
  id: string;
  type: 'BET_PLACED' | 'BET_WON' | 'WORKOUT_REWARD' | 'DAILY_LOGIN' | 'SIGNUP_BONUS' | 'STORE_PURCHASE';
  amount: number;
  description: string;
  timestamp: number;
}

// Transaction type for storage/history
export interface Transaction {
  id: string;
  userId: string;
  type: 'workout' | 'vote_placed' | 'vote_won' | 'purchase' | 'reward' | 'bonus';
  amount: number;
  description: string;
  timestamp: number;
}

// ---------- Store/Marketplace ----------

export type StoreItemType = 'skin' | 'apparel' | 'accessory' | 'effect' | 'gift_card';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface StoreItem {
  id: string;
  type: StoreItemType;
  name: string;
  description: string;
  price: number;
  rarity: ItemRarity;
  icon: string; // Emoji or Image URL
  visualAsset: string; // Gradient class or Asset URL
}

// ---------- User ----------

export interface UserEquipped {
  skin: string; // StoreItem ID
  accessory?: string;
  effect?: string;
}

export interface User {
  id: string;
  name: string;
  avatar: string; // URL or empty
  gym?: Gym;
  level: number;
  coins: number;
  coinHistory: CoinTransaction[];
  stats: UserStats;
  dailyTagline?: {
    text: string;
    generatedAt: number;
  };
  nextMission?: string;
  lastActiveAt: number;
  inventory: string[]; // List of StoreItem IDs
  equipped: UserEquipped;
}

// ---------- Voting & Betting ----------

export interface Bet {
  userId: string;
  prediction: 'success' | 'fail';
}

export interface Vote {
  userId: string;
  type: 'back' | 'callout';
}

// ---------- Challenge (Legacy) ----------

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

// ---------- Feed Types ----------

export interface LiveSession {
  id: string;
  user: User;
  workoutTitle: string;
  viewers: number;
  hypeScore: number;
  thumbnail?: string;
  currentReps?: number;
  totalReps?: number;
  isPrivate?: boolean;
}

export interface Commitment {
  id: string;
  user: User;
  workoutTitle: string;
  deadline: number;
  votes: Vote[];
  currentUserVote?: 'back' | 'callout';
}

// ---------- Gamification ----------

export type QuestMetric = 'PUSHUPS' | 'SQUATS' | 'STEPS' | 'CALORIES' | 'LOGINS';
export type QuestStatus = 'AVAILABLE' | 'ACCEPTED' | 'COMPLETED' | 'CLAIMED';

export interface Quest {
  id: string;
  title: string;
  description: string;
  metric: QuestMetric;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  status: QuestStatus;
  expiresAt: number;
  progress: number;
}

// ---------- Leaderboard ----------

export type LeaderboardTrend = 'up' | 'down' | 'same';

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  trend: LeaderboardTrend;
  isLive?: boolean;
  streak?: number;
  recentHighlight?: string;
}

export interface GymLeaderboardEntry {
  rank: number;
  gym: Gym;
  totalScore: number;
  mvpUser?: User;
}

// ---------- Activity Logging ----------

export interface ActivityLog {
  id: string;
  userId: string;
  actionType: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

// ---------- Notifications ----------

export type NotificationType = 'social' | 'streak' | 'vote' | 'workout' | 'achievement';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read?: boolean;
}

// ---------- AI/Gemini Types ----------

export interface RoastResponse {
  text: string;
}

export interface TaglineResponse {
  text: string;
  generatedAt: number;
}

// ---------- Navigation Types ----------

export type RootStackParamList = {
  Login: undefined;
  AvatarSelection: { username: string };
  GymSelection: { userId: string };
  Main: undefined;
  LiveWorkout: { 
    exerciseType: string; 
    target: string; 
    duration: string;
    isPrivate?: boolean;
  };
  Leaderboard: undefined;
  Marketplace: undefined;
  CoinMenu: undefined;
  PublicProfile: { userId: string };
  WorkoutSummary: {
    exerciseType: string;
    reps: number;
    target: number;
    duration: number; // in seconds
    success: boolean;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Move: undefined;
  Profile: undefined;
};

// ---------- Workout/Exercise Types ----------

export type ExerciseStage = 'UP' | 'DOWN' | null;

export interface ExerciseState {
  stage: ExerciseStage;
  reps: number;
  lastFeedback: string;
}

export type WorkoutType = 'Pushups' | 'Squats' | 'Jumping Jacks' | 'Steps' | 'Distance Walk' | 'Calories';

export interface WorkoutConfig {
  type: WorkoutType;
  target: string;
  duration: string;
}

// ---------- App State ----------

export type AppStateType = 'login' | 'avatar' | 'gym' | 'app';
export type ViewType = 'home' | 'move' | 'profile' | 'live-session';

// ---------- Component Props Common Types ----------

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface WorkoutResultProps {
  success: boolean;
  reps: number;
  pointsEarned: number;
  workoutTitle: string;
}

// ---------- API Response Types ----------

export interface VoteResponse {
  success: boolean;
  message: string;
  updatedUser?: User;
}

export interface LoginResponse {
  user: User;
  isNewUser: boolean;
}
