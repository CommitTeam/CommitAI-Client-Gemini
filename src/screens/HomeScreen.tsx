import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';

import { User, Commitment } from '@/types';
import { COLORS, TIMING } from '@/constants';
import {
  getCurrentUser,
  getFeed,
  placeVote,
  getLeaderboard,
} from '@/services/backend';
import { HeroBanner, TrendingSection } from '@/components/feed';
import { FeedStackParamList, MainTabParamList } from '@/navigation/FeedStackParamList';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<FeedStackParamList>
>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBets, setShowAllBets] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, TIMING.FEED_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        // User not found - they need to log in again
        // This should be handled by RootNavigator, but we'll set state to show loading
        return;
      }
      setCurrentUser(user);

      const feed = await getFeed(user.id);
      setCommitments(feed);

      const leaderboard = await getLeaderboard('top_humans', user.id);
      if (Array.isArray(leaderboard)) {
        const userEntry = leaderboard.find((e: any) => e.user.id === user.id);
        setCurrentUserRank(userEntry?.rank || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleVote = async (id: string, type: 'back' | 'callout') => {
    if (!currentUser) return;

    const result = await placeVote(currentUser.id, id, type);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.updatedUser) setCurrentUser(result.updatedUser);
      const feed = await getFeed(currentUser.id);
      setCommitments(feed);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Vote Failed', result.message);
    }
  };

  const handleOpenMove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleViewProfile = (userId: string) => {
    navigation.navigate('PublicProfile', { userId });
  };

  const handleGoLive = (commitment: Commitment) => {
    const parts = commitment.workoutTitle.split(' ');
    const target = parts[0];
    const type = parts.slice(1, -2).join(' ');

    navigation.navigate('LiveWorkout', {
      exerciseType: type || 'Pushups',
      target: target || '20',
      duration: '2 min',
    });
  };

  if (!currentUser) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.systemBg }} edges={[]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base" style={{ color: COLORS.systemGray1 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.systemBg }} edges={[]}>
      {/* Floating Header Pills */}
      <View className="absolute top-[60px] left-4 right-4 flex-row justify-between z-40">
        <Pressable
          className="flex-row items-center bg-black/60 px-3 py-1.5 rounded-[20px] "
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text className="text-xl font-black italic" style={{ color: COLORS.white }}>
            #{currentUserRank || '-'}
          </Text>
          <Text
            className="text-[10px] font-bold uppercase ml-2"
            style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}
          >
            RANK
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center bg-white/90 px-3 py-1 rounded-[20px]"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={() => navigation.navigate('CoinMenu')}
        >
          <Text className="text-sm font-bold mr-2" style={{ color: COLORS.black }}>
            {currentUser.coins}
          </Text>
          <Zap size={14} color={COLORS.black} fill={COLORS.black} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.acidGreen} />
        }
      >
        <HeroBanner
          currentUser={currentUser}
          onOpenMove={handleOpenMove}
          onViewProfile={handleViewProfile}
        />

        <TrendingSection
          commitments={commitments}
          currentUser={currentUser}
          onVote={handleVote}
          onViewMore={() => setShowAllBets(!showAllBets)}
          isExpanded={showAllBets}
          onProfileClick={handleViewProfile}
          onGoLive={handleGoLive}
        />

        {!showAllBets && (
          <View className="mt-2">
            <Text
              className="text-xl font-black italic mb-4 px-2"
              style={{ color: COLORS.black, letterSpacing: -0.5 }}
            >
              LIVE NOW
            </Text>
            <View
              className="bg-white rounded-[24px] p-10 items-center justify-center border-2"
              style={{ borderColor: COLORS.systemGray5, borderStyle: 'dashed' }}
            >
              <Text className="text-sm font-semibold" style={{ color: COLORS.systemGray1 }}>
                Live sessions coming soon...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
