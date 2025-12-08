// ============================================
// CommitAI Mobile - Custom Tab Bar
// Bottom navigation with Home, Move, and Profile tabs
// The Move button is elevated above the bar for emphasis
// ============================================

import React from 'react';
import { View, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Flame, User } from 'lucide-react-native';
import { COLORS } from '@/constants';
import { MainTabParamList } from './FeedStackParamList';
import { HomeScreen, MoveScreen, ProfileScreen } from '@/screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, navigation }) => {
  return (
    <View
      className="absolute bottom-6 left-4 right-4 z-50"
      pointerEvents="box-none"
    >
      <View
        className="flex-row items-center justify-between bg-white/90 rounded-[32px] h-16 px-8 shadow-lg border border-white/50"
        style={{ elevation: 10 }}
      >
        {state.routes.map((route: any, index: number) => {
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

          if (route.name === 'Move') {
            return (
              <View
                key={route.key}
                className="absolute left-0 right-0 -top-6 items-center justify-center"
                style={{ zIndex: 20 }}
                pointerEvents="box-none"
              >
                <Pressable
                  onPress={onPress}
                  className="w-16 h-16 rounded-full bg-black items-center justify-center shadow-lg"
                  style={{ elevation: 12 }}
                >
                  <Flame size={28} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
                </Pressable>
              </View>
            );
          }

          const IconComponent = route.name === 'Home' ? Home : User;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="p-2"
              style={{ zIndex: 10 }}
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

/**
 * MainTabs - Bottom tab navigator with custom tab bar
 *
 * Tabs:
 * - Home: Main feed with commitments and trending workouts
 * - Move: Workout creation screen (elevated button in center)
 * - Profile: User profile and settings
 *
 * To navigate to other screens from these tabs, use:
 *   navigation.navigate('Leaderboard')
 *   navigation.navigate('LiveWorkout', { params })
 */
export const MainTabs = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Move" component={MoveScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default CustomTabBar;
