import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Zap,
  Flame,
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Moon,
  HelpCircle,
  MessageSquare,
  Shield,
  Trash2,
} from 'lucide-react-native';
import { useDispatch } from 'react-redux';

import { User } from '@/types';
import { COLORS } from '@/constants';
import { getCurrentUser, deleteUser } from '@/services/backend';
import { BrutalistButton } from '@/components/ui';
import { FeedStackParamList, MainTabParamList } from '@/navigation/FeedStackParamList';
import { deleteAccessToken, deleteRefreshToken, deleteUsername } from '@/store/secureStore';
import { resetAuth } from '@/store/authSlice';
import type { AppDispatch } from '@/store/store';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<FeedStackParamList>
>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await deleteAccessToken();
            await deleteRefreshToken();
            await deleteUsername();

            dispatch(resetAuth());
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (currentUser) {
              await deleteUser(currentUser.id);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
          },
        },
      ]
    );
  };

  const handleMarketplace = () => {
    Haptics.selectionAsync();
    navigation.navigate('Marketplace');
  };

  if (!currentUser) {
    return (
      <SafeAreaView className="flex-1 bg-systemBg">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-systemGray1">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl =
    currentUser.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;

  return (
    <SafeAreaView className="flex-1 bg-systemBg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="items-center pt-5 pb-6">
          <View className="relative mb-4">
            <Image source={{ uri: avatarUrl }} className="w-[100px] h-[100px] rounded-[50px] bg-systemGray6" />
            <View className="absolute bottom-0 right-0 bg-black w-8 h-8 rounded-2xl items-center justify-center border-[3px] border-systemBg">
              <Text className="text-sm font-black text-acidGreen">{currentUser.level}</Text>
            </View>
          </View>
          <Text className="text-[28px] font-extrabold text-black mb-1">{currentUser.name}</Text>
          {currentUser.gym && (
            <Text className="text-sm font-semibold text-systemGray1">{currentUser.gym.name}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white rounded-[20px] p-4 items-center shadow-sm">
            <Zap size={24} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
            <Text className="text-2xl font-black text-black mt-2">{currentUser.coins}</Text>
            <Text className="text-[11px] font-semibold text-systemGray1 uppercase tracking-wider">Points</Text>
          </View>
          <View className="flex-1 bg-white rounded-[20px] p-4 items-center shadow-sm">
            <Flame size={24} color={COLORS.voteOrange} fill={COLORS.voteOrange} />
            <Text className="text-2xl font-black text-black mt-2">{currentUser.stats.currentStreak}</Text>
            <Text className="text-[11px] font-semibold text-systemGray1 uppercase tracking-wider">Streak</Text>
          </View>
          <View className="flex-1 bg-white rounded-[20px] p-4 items-center shadow-sm">
            <Trophy size={24} color={COLORS.punchBlue} />
            <Text className="text-2xl font-black text-black mt-2">{currentUser.stats.totalWorkouts}</Text>
            <Text className="text-[11px] font-semibold text-systemGray1 uppercase tracking-wider">Workouts</Text>
          </View>
        </View>

        {/* Marketplace Button */}
        <Pressable className="flex-row items-center bg-white rounded-[20px] p-5 mb-6 shadow-sm" onPress={handleMarketplace}>
          <View className="flex-1">
            <Text className="text-lg font-bold text-black mb-1">🛍️ Marketplace</Text>
            <Text className="text-[13px] text-systemGray1">
              Unlock skins, effects & rewards
            </Text>
          </View>
          <ChevronRight size={24} color={COLORS.systemGray1} />
        </Pressable>

        {/* Settings Section */}
        <View className="mb-6">
          <Text className="text-[13px] font-bold text-systemGray1 uppercase tracking-wide mb-3 ml-1">Settings</Text>

          <View className="bg-white rounded-[20px] overflow-hidden shadow-sm">
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <Bell size={20} color={COLORS.black} />
                <Text className="text-base font-semibold text-black">Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.systemGray4, true: COLORS.acidGreen }}
                thumbColor={COLORS.white}
              />
            </View>

            <View className="h-px bg-systemGray5 ml-[52px]" />

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <Moon size={20} color={COLORS.black} />
                <Text className="text-base font-semibold text-black">Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.systemGray4, true: COLORS.acidGreen }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <Text className="text-[13px] font-bold text-systemGray1 uppercase tracking-wide mb-3 ml-1">Support</Text>

          <View className="bg-white rounded-[20px] overflow-hidden shadow-sm">
            <Pressable className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <HelpCircle size={20} color={COLORS.black} />
                <Text className="text-base font-semibold text-black">Help & FAQ</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>

            <View className="h-px bg-systemGray5 ml-[52px]" />

            <Pressable className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <MessageSquare size={20} color={COLORS.black} />
                <Text className="text-base font-semibold text-black">Send Feedback</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>

            <View className="h-px bg-systemGray5 ml-[52px]" />

            <Pressable className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <Shield size={20} color={COLORS.black} />
                <Text className="text-base font-semibold text-black">Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <View className="bg-white rounded-[20px] overflow-hidden border border-red-700/20">
            <Pressable className="flex-row items-center gap-3 p-4" onPress={handleLogout}>
              <LogOut size={20} color={COLORS.voteRed} />
              <Text className="text-base font-semibold text-voteRed">Log Out</Text>
            </Pressable>

            <View className="h-px bg-systemGray5 ml-[52px]" />

            <Pressable className="flex-row items-center gap-3 p-4" onPress={handleDeleteAccount}>
              <Trash2 size={20} color={COLORS.voteRed} />
              <Text className="text-base font-semibold text-voteRed">Delete Account</Text>
            </Pressable>
          </View>
        </View>

        {/* Version */}
        <Text className="text-center text-xs text-systemGray2 mt-5">CommitAI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
