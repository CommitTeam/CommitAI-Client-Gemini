// ============================================
// CommitAI Mobile - Feed Stack Navigator
// Main app with tabs and modal screens
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Pressable, StyleSheet } from 'react-native';
import { Home, Flame, User } from 'lucide-react-native';

import { FeedStackParamList, MainTabParamList } from './FeedStackParamList';
import { COLORS } from '@/constants';

// Import Screens
import {
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

const Stack = createNativeStackNavigator<FeedStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ---------- Custom Tab Bar ----------

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Center button (Move) has special styling
          if (route.name === 'Move') {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.centerButton}
              >
                <Flame
                  size={28}
                  color={COLORS.acidGreen}
                  fill={COLORS.acidGreen}
                />
              </Pressable>
            );
          }

          const IconComponent = route.name === 'Home' ? Home : User;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabButton}
            >
              <IconComponent
                size={24}
                color={isFocused ? COLORS.black : COLORS.systemGray1}
                strokeWidth={isFocused ? 2.5 : 2}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

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

// ---------- Feed Stack Navigator ----------

const FeedStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.systemBg },
      }}
    >
      {/* Main Tabs */}
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
  );
};

export default FeedStack;

// ---------- Styles ----------

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tabButton: {
    padding: 8,
  },
  centerButton: {
    position: 'absolute',
    left: '50%',
    marginLeft: -32, // Half of width
    top: -24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
