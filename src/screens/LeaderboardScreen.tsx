// ============================================
// CommitAI Mobile - Leaderboard Screen
// Rankings with multiple tabs
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  X,
  Trophy,
  Crown,
  Flame,
  MapPin,
  Zap,
  Share2,
} from 'lucide-react-native';

import { RootStackParamList, User, LeaderboardEntry, GymLeaderboardEntry } from '@/types';
import { COLORS } from '@/constants';
import { getCurrentUser, getLeaderboard } from '@/services/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;

type TabType = 'top_humans' | 'friends' | 'workouts_done' | 'top_gyms';

const TABS: { id: TabType; label: string }[] = [
  { id: 'top_humans', label: 'Top Humans' },
  { id: 'friends', label: 'Friends' },
  { id: 'workouts_done', label: 'Workouts Done' },
  { id: 'top_gyms', label: 'Top Gyms' },
];

const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('top_humans');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [gymEntries, setGymEntries] = useState<GymLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadLeaderboard();
    }
  }, [activeTab, currentUser]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const loadLeaderboard = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getLeaderboard(activeTab, currentUser.id);
      if (activeTab === 'top_gyms') {
        setGymEntries(data as GymLeaderboardEntry[]);
      } else {
        setEntries(data as LeaderboardEntry[]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleRowPress = (entry: LeaderboardEntry) => {
    Haptics.selectionAsync();
    if (entry.user.id === currentUser?.id) {
      handleShareRank();
    } else {
      navigation.navigate('PublicProfile', { userId: entry.user.id });
    }
  };

  const handleShareRank = async () => {
    const userEntry = entries.find((e) => e.user.id === currentUser?.id);
    if (!userEntry) return;

    try {
      await Share.share({
        message: `I'm ranked #${userEntry.rank} on CommitAI with ${userEntry.score} points! Can you beat me?`,
        title: 'My CommitAI Rank',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <View style={[styles.rankBadge, styles.rankGold]}>
          <Text style={styles.rankBadgeText}>1</Text>
        </View>
      );
    }
    if (rank === 2) {
      return (
        <View style={[styles.rankBadge, styles.rankSilver]}>
          <Text style={styles.rankBadgeText}>2</Text>
        </View>
      );
    }
    if (rank === 3) {
      return (
        <View style={[styles.rankBadge, styles.rankBronze]}>
          <Text style={styles.rankBadgeText}>3</Text>
        </View>
      );
    }
    return <Text style={styles.rankNumber}>#{rank}</Text>;
  };

  const renderUserEntry = ({ item: entry }: { item: LeaderboardEntry }) => {
    const isCurrentUser = entry.user.id === currentUser?.id;
    const avatarUrl =
      entry.user.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user.name}`;

    return (
      <Pressable
        style={[styles.entryRow, isCurrentUser && styles.entryRowHighlighted]}
        onPress={() => handleRowPress(entry)}
      >
        <View style={styles.rankContainer}>{renderRankBadge(entry.rank)}</View>

        <Image source={{ uri: avatarUrl }} style={styles.avatar} />

        <View style={styles.entryInfo}>
          <Text style={styles.entryName} numberOfLines={1}>
            {entry.user.name}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={styles.entrySubtitle} numberOfLines={1}>
            {activeTab === 'workouts_done'
              ? `${entry.user.stats.totalWorkouts} Workouts`
              : entry.recentHighlight || entry.user.gym?.name || 'Rookie'}
          </Text>
        </View>

        <View style={styles.entryScore}>
          <Text style={styles.scoreValue}>
            {activeTab === 'workouts_done'
              ? entry.user.stats.totalWorkouts
              : entry.score.toLocaleString()}
          </Text>
          <View style={styles.scoreLabel}>
            {activeTab === 'workouts_done' ? (
              <Text style={styles.scoreLabelText}>Done</Text>
            ) : (
              <>
                <Zap size={10} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
                <Text style={styles.scoreLabelText}>Pts</Text>
              </>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderGymEntry = ({ item: entry }: { item: GymLeaderboardEntry }) => (
    <Pressable style={styles.gymRow}>
      <View style={styles.rankContainer}>{renderRankBadge(entry.rank)}</View>

      <View style={styles.gymIcon}>
        <Text style={styles.gymEmoji}>{entry.rank === 1 ? '🏰' : '🏟️'}</Text>
      </View>

      <View style={styles.entryInfo}>
        <Text style={styles.entryName} numberOfLines={1}>
          {entry.gym.name}
        </Text>
        <View style={styles.gymLocation}>
          <MapPin size={10} color={COLORS.systemGray1} />
          <Text style={styles.entrySubtitle}>
            {entry.gym.location || 'Global'}
          </Text>
        </View>
      </View>

      <View style={styles.entryScore}>
        <Text style={styles.scoreValue}>{entry.totalScore.toLocaleString()}</Text>
        <Text style={styles.scoreLabelText}>Total Pts</Text>
      </View>
    </Pressable>
  );

  const userRankEntry = entries.find((e) => e.user.id === currentUser?.id);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>LEADERBOARD</Text>
          <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
            <X size={20} color={COLORS.systemGray1} />
          </Pressable>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => handleTabChange(tab.id)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.id && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styles.loadingText}>Loading Ranks...</Text>
        </View>
      ) : activeTab === 'top_gyms' ? (
        <FlatList
          data={gymEntries}
          keyExtractor={(item) => item.gym.id}
          renderItem={renderGymEntry}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.user.id}
          renderItem={renderUserEntry}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Current User Footer */}
      {userRankEntry && activeTab !== 'top_gyms' && (
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerRank}>#{userRankEntry.rank}</Text>
              <Text style={styles.footerLabel}>Your Rank</Text>
            </View>
            <Pressable style={styles.shareButton} onPress={handleShareRank}>
              <Share2 size={18} color={COLORS.black} />
              <Text style={styles.shareButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default LeaderboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tabs
  tabsContainer: {
    gap: 8,
    paddingRight: 20,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.systemGray5,
  },
  tabActive: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: COLORS.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 12,
  },

  // Entry Row
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  entryRowHighlighted: {
    borderWidth: 2,
    borderColor: COLORS.acidGreen,
    backgroundColor: 'rgba(255,238,50,0.08)',
  },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Rank
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankGold: {
    backgroundColor: '#FBBF24',
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  rankSilver: {
    backgroundColor: '#D1D5DB',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  rankBronze: {
    backgroundColor: '#FDBA74',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.systemGray1,
  },

  // Avatar
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.systemGray6,
    marginRight: 12,
  },

  // Entry Info
  entryInfo: {
    flex: 1,
    marginRight: 12,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 2,
  },
  entrySubtitle: {
    fontSize: 12,
    color: COLORS.systemGray1,
  },

  // Gym
  gymIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gymEmoji: {
    fontSize: 24,
  },
  gymLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Score
  entryScore: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.black,
  },
  scoreLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  scoreLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.systemGray5,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerRank: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
  },
  footerLabel: {
    fontSize: 14,
    color: COLORS.systemGray1,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.acidGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
});
