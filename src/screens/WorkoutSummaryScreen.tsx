// ============================================
// CommitAI Mobile - Workout Summary Screen
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Share, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { CheckCircle, XCircle, Zap, Flame, Clock, Share2, Home, RotateCcw } from 'lucide-react-native';

import { RootStackParamList, User } from '@/types';
import { COLORS } from '@/constants';
import { getCurrentUser, updateUser } from '@/services/backend';
import { TransactionStorage } from '@/services/storage';
import { generateRoast } from '@/services/geminiService';
import { BrutalistButton } from '@/components/ui';
import { generateId } from '@/utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkoutSummary'>;
type RouteType = RouteProp<RootStackParamList, 'WorkoutSummary'>;

const WorkoutSummaryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { exerciseType, reps, target, duration, success } = route.params;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roast, setRoast] = useState<string>('');
  const [pointsEarned, setPointsEarned] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    if (!user) return;
    setCurrentUser(user);

    const total = (success ? 100 : 50) + Math.floor(reps * 2) + (user.stats.currentStreak > 0 ? 25 : 0);
    setPointsEarned(total);

    const updatedUser: User = {
      ...user,
      coins: user.coins + total,
      stats: {
        ...user.stats,
        totalWorkouts: user.stats.totalWorkouts + 1,
        currentStreak: success ? user.stats.currentStreak + 1 : 0,
        longestStreak: Math.max(user.stats.longestStreak, success ? user.stats.currentStreak + 1 : user.stats.currentStreak),
      },
      lastActiveAt: Date.now(),
    };
    await updateUser(updatedUser);
    setCurrentUser(updatedUser);

    await TransactionStorage.add({
      id: generateId(),
      userId: user.id,
      type: 'workout',
      amount: total,
      description: `${exerciseType} workout (${reps} reps)`,
      timestamp: Date.now(),
    });

    try {
      const roastText = await generateRoast(`${reps} ${exerciseType}`, success ? 'completed' : 'failed', 0);
      setRoast(roastText);
    } catch {
      setRoast(success ? "Not bad, rookie." : "Try again when you're ready.");
    }

    Haptics.notificationAsync(success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `I just did ${reps} ${exerciseType} on CommitAI! ${success ? '💪' : ''}` });
    } catch {}
  };

  const handleGoHome = () => navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  
  const handleTryAgain = () => navigation.replace('LiveWorkout', {
    exerciseType,
    target: String(target),
    duration: `${Math.ceil(duration / 60)} min`,
  });

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={success ? ['#000', '#1a1a1a'] : ['#1a0a0a', '#000']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.content}>
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconCircle, success ? styles.iconSuccess : styles.iconFail]}>
            {success ? <CheckCircle size={64} color={COLORS.black} /> : <XCircle size={64} color={COLORS.white} />}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.title}>{success ? 'CRUSHED IT!' : 'NICE TRY'}</Text>
          <Text style={styles.subtitle}>{exerciseType}</Text>
        </Animated.View>

        <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
          <View style={styles.statCard}>
            <Flame size={20} color={COLORS.voteOrange} fill={COLORS.voteOrange} />
            <Text style={styles.statValue}>{reps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statCard}>
            <Clock size={20} color={COLORS.punchBlue} />
            <Text style={styles.statValue}>{formatDuration(duration)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={20} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
            <Text style={[styles.statValue, { color: COLORS.acidGreen }]}>+{pointsEarned}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{reps} / {target}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((reps / target) * 100, 100)}%`, backgroundColor: success ? COLORS.acidGreen : COLORS.voteOrange }]} />
          </View>
        </Animated.View>

        {roast ? (
          <Animated.View style={[styles.roastContainer, { opacity: fadeAnim }]}>
            <Text style={styles.roastLabel}>🤖 AI SAYS</Text>
            <Text style={styles.roastText}>"{roast}"</Text>
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <View style={styles.actionButtons}>
            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Share2 size={20} color={COLORS.white} />
            </Pressable>
            <BrutalistButton label="GO HOME" onPress={handleGoHome} icon={<Home size={18} color={COLORS.black} />} iconPosition="left" style={{ flex: 1 }} size="large" />
          </View>
          {!success && (
            <Pressable style={styles.retryButton} onPress={handleTryAgain}>
              <RotateCcw size={16} color={COLORS.acidGreen} />
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default WorkoutSummaryScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconContainer: { marginBottom: 24 },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' },
  iconSuccess: { backgroundColor: COLORS.acidGreen, shadowColor: COLORS.acidGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30 },
  iconFail: { backgroundColor: COLORS.voteRed },
  title: { fontSize: 36, fontWeight: '900', fontStyle: 'italic', color: COLORS.white, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 32 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: COLORS.white, marginVertical: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  progressContainer: { width: '100%', marginBottom: 24 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  progressValue: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  roastContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 20, marginBottom: 32, width: '100%' },
  roastLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 8 },
  roastText: { fontSize: 16, fontStyle: 'italic', color: COLORS.white, lineHeight: 24 },
  actionsContainer: { width: '100%' },
  actionButtons: { flexDirection: 'row', gap: 12 },
  shareButton: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  retryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 12 },
  retryText: { fontSize: 14, fontWeight: '700', color: COLORS.acidGreen },
});
