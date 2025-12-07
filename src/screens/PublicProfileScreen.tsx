// ============================================
// CommitAI Mobile - Public Profile Screen
// View other users' profiles
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  X,
  Zap,
  Flame,
  Trophy,
  Target,
  Calendar,
  MapPin,
} from 'lucide-react-native';

import { RootStackParamList, User } from '@/types';
import { COLORS } from '@/constants';
import { getUserById } from '@/services/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PublicProfile'>;
type RouteType = RouteProp<RootStackParamList, 'PublicProfile'>;

const PublicProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { userId } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFlex = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // In a real app, this would send a notification to the user
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.black} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl =
    user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
  
  const winRate = user.stats.totalWorkouts > 0
    ? Math.round((user.stats.totalWorkouts - Math.floor(user.stats.totalWorkouts * 0.3)) / user.stats.totalWorkouts * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <X size={20} color={COLORS.systemGray1} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{user.level}</Text>
            </View>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          
          <View style={styles.badges}>
            {user.gym && (
              <View style={styles.badge}>
                <MapPin size={12} color={COLORS.systemGray1} />
                <Text style={styles.badgeText}>{user.gym.name}</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Calendar size={12} color={COLORS.systemGray1} />
              <Text style={styles.badgeText}>
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Zap size={24} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
            <Text style={styles.statValue}>{user.coins.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={24} color={COLORS.voteOrange} fill={COLORS.voteOrange} />
            <Text style={styles.statValue}>{user.stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color={COLORS.punchBlue} />
            <Text style={styles.statValue}>{user.stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color="#10B981" />
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
          <View style={styles.achievementsGrid}>
            {user.stats.totalWorkouts >= 10 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>🔥</Text>
                <Text style={styles.achievementName}>Fire Starter</Text>
              </View>
            )}
            {user.stats.currentStreak >= 7 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>⚡</Text>
                <Text style={styles.achievementName}>Week Warrior</Text>
              </View>
            )}
            {user.stats.longestStreak >= 30 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>👑</Text>
                <Text style={styles.achievementName}>Month Master</Text>
              </View>
            )}
            {user.coins >= 1000 && (
              <View style={styles.achievementBadge}>
                <Text style={styles.achievementEmoji}>💰</Text>
                <Text style={styles.achievementName}>Point Hoarder</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.flexButton} onPress={handleSendFlex}>
            <Text style={styles.flexEmoji}>💪</Text>
            <Text style={styles.flexText}>Send Flex</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublicProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.systemGray1,
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.black,
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Profile Header
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.systemGray6,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.systemBg,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.acidGreen,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.systemGray1,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Achievements
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
  },

  // Actions
  actions: {
    marginTop: 8,
  },
  flexButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.systemGray5,
  },
  flexEmoji: {
    fontSize: 20,
  },
  flexText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
});
