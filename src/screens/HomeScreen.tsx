// ============================================
// CommitAI Mobile - Home Screen
// Main feed with hero banner, trending, and live sessions
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';

import { RootStackParamList, User, Commitment } from '@/types';
import { COLORS, TIMING } from '@/constants';
import {
  getCurrentUser,
  getFeed,
  placeVote,
  getLeaderboard,
} from '@/services/backend';
import { HeroBanner, TrendingSection } from '@/components/feed';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
        navigation.replace('Login');
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Floating Header Pills */}
      <View style={styles.headerPills}>
        <Pressable style={styles.rankPill} onPress={() => navigation.navigate('Leaderboard')}>
          <Text style={styles.rankNumber}>#{currentUserRank || '-'}</Text>
          <Text style={styles.rankLabel}>RANK</Text>
        </Pressable>

        <Pressable style={styles.coinPill} onPress={() => navigation.navigate('CoinMenu')}>
          <Text style={styles.coinAmount}>{currentUser.coins}</Text>
          <Zap size={14} color={COLORS.black} fill={COLORS.black} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
          <View style={styles.moreSection}>
            <Text style={styles.moreSectionTitle}>LIVE NOW</Text>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>Live sessions coming soon...</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.systemBg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: COLORS.systemGray1 },
  headerPills: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 40,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  rankNumber: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: COLORS.white },
  rankLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  coinAmount: { fontSize: 14, fontWeight: '700', color: COLORS.black },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  moreSection: { marginTop: 8 },
  moreSectionTitle: { fontSize: 20, fontWeight: '900', fontStyle: 'italic', color: COLORS.black, letterSpacing: -0.5, marginBottom: 16, paddingHorizontal: 8 },
  placeholderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.systemGray5,
    borderStyle: 'dashed',
  },
  placeholderText: { fontSize: 14, fontWeight: '600', color: COLORS.systemGray1 },
});
