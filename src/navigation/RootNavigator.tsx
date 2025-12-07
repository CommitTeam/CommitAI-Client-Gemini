// ============================================
// CommitAI Mobile - Root Navigator
// Combines Auth and Feed stacks in a single root navigator
// ============================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthStackParamList } from './AuthStackParamList';
import { FeedStackParamList, MainTabParamList } from './FeedStackParamList';
import CustomTabBar from './CustomTabBar';
import { COLORS } from '@/constants';

// Import Screens
import {
  LoginScreen,
  SignUpScreen,
  OTPVerificationScreen,
  AvatarSelectionScreen,
  HomeScreen,
  MoveScreen,
  ProfileScreen,
  LiveWorkoutScreen,
  LeaderboardScreen,
  MarketplaceScreen,
  CoinMenuScreen,
  PublicProfileScreen,
  WorkoutSummaryScreen,
} from '@/screens';

// Combine Auth and Feed param lists for the root navigator
export type RootNavigatorParamList = AuthStackParamList & FeedStackParamList;

const Stack = createNativeStackNavigator<RootNavigatorParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ---------- Main Tab Navigator ----------

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Move" component={MoveScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// ---------- Root Navigator ----------

const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.systemBg },
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="OTPVerification"
          component={OTPVerificationScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="AvatarSelection"
          component={AvatarSelectionScreen}
          options={{ animation: 'slide_from_bottom' }}
        />

        {/* Main App (Tabs) */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Workout Flow */}
        <Stack.Screen
          name="LiveWorkout"
          component={LiveWorkoutScreen}
          options={{
            animation: 'fade',
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="WorkoutSummary"
          component={WorkoutSummaryScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />

        {/* Modals */}
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="Marketplace"
          component={MarketplaceScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="CoinMenu"
          component={CoinMenuScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PublicProfile"
          component={PublicProfileScreen}
          options={{
            animation: 'slide_from_right',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
