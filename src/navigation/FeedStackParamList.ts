export type MainTabParamList = {
  Home: undefined;
  Move: undefined;
  Profile: undefined;
};

export type FeedStackParamList = {
  Main: undefined;
  WorkoutSetup: {
    exerciseType: string;
    target: string;
    duration: string;
    level: string;
  };
  WorkoutTransition: {
    exerciseType: string;
    target: string;
    duration: string;
  };
  LiveWorkout: {
    exerciseType: string;
    target: string;
    duration: string;
  };
  WorkoutSummary: {
    exerciseType: string;
    reps: number;
    target: number;
    duration: number;
    success: boolean;
  };
  Leaderboard: undefined;
  Marketplace: undefined;
  CoinMenu: undefined;
  PublicProfile: { userId: string };
};
