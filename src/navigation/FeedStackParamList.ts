// ============================================
// CommitAI Mobile - Feed Stack Navigation Types
// Main app navigation (tabs + modals)
// ============================================

export type MainTabParamList = {
  Home: undefined;
  Move: undefined;
  Profile: undefined;
};

export type FeedStackParamList = {
  Main: undefined;
  LiveWorkout: {
    exerciseType: string;
    target: string;
    duration: string;
    isPrivate?: boolean;
  };
  WorkoutSummary: {
    exerciseType: string;
    reps: number;
    target: number;
    duration: number; // in seconds
    success: boolean;
  };
  Leaderboard: undefined;
  Marketplace: undefined;
  CoinMenu: undefined;
  PublicProfile: { userId: string };
};
