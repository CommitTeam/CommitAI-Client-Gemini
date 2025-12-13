import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FeedStackParamList } from './FeedStackParamList';
import { COLORS } from '@/constants';
import { MainTabs } from './CustomTabBar';
import {
  LiveWorkoutScreen,
  WorkoutSetupScreen,
  WorkoutTransition,
  WorkoutSummaryScreen,
  LeaderboardScreen,
  MarketplaceScreen,
  CoinMenuScreen,
  PublicProfileScreen,
} from '@/screens';

const Stack = createNativeStackNavigator<FeedStackParamList>();

const FeedStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.systemBg },
      }}
    >
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen
        name="WorkoutSetup"
        component={WorkoutSetupScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="WorkoutTransition"
        component={WorkoutTransition}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="LiveWorkout"
        component={LiveWorkoutScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CoinMenu"
        component={CoinMenuScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

export default FeedStack;
