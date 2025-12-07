// ============================================
// CommitAI Mobile - Move Screen
// Workout type and target selector
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Dumbbell,
  Footprints,
  Flame,
  Timer,
  Zap,
  Play,
} from 'lucide-react-native';

import { RootStackParamList, User, WorkoutType } from '@/types';
import { COLORS, WORKOUT_TYPES, WORKOUT_TARGETS, WORKOUT_TIMES } from '@/constants';
import { getCurrentUser, createCommitment } from '@/services/backend';
import { BrutalistButton } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const EXERCISE_ICONS: Record<string, React.ReactNode> = {
  'Pushups': <Dumbbell size={24} color={COLORS.black} />,
  'Squats': <Dumbbell size={24} color={COLORS.black} />,
  'Jumping Jacks': <Zap size={24} color={COLORS.black} />,
  'Steps': <Footprints size={24} color={COLORS.black} />,
  'Distance Walk': <Footprints size={24} color={COLORS.black} />,
  'Calories': <Flame size={24} color={COLORS.black} />,
};

const MoveScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedType, setSelectedType] = useState<WorkoutType>('Pushups');
  const [selectedTarget, setSelectedTarget] = useState<string>('20');
  const [selectedTime, setSelectedTime] = useState<string>('20 mins');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Reset target when type changes
    const targets = WORKOUT_TARGETS[selectedType];
    if (targets && targets.length > 0) {
      setSelectedTarget(targets[0]);
    }
  }, [selectedType]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleTypeSelect = (type: WorkoutType) => {
    Haptics.selectionAsync();
    setSelectedType(type);
  };

  const handleTargetSelect = (target: string) => {
    Haptics.selectionAsync();
    setSelectedTarget(target);
  };

  const handleTimeSelect = (time: string) => {
    Haptics.selectionAsync();
    setSelectedTime(time);
  };

  const handleGoLive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Check if it's a trackable exercise (camera-based)
    const isTrackable = ['Pushups', 'Squats', 'Jumping Jacks'].includes(selectedType);
    
    if (isTrackable) {
      navigation.navigate('LiveWorkout', {
        exerciseType: selectedType,
        target: selectedTarget,
        duration: selectedTime,
      });
    } else {
      // For Steps, Distance, Calories - create a commitment
      handleCommit();
    }
  };

  const handleCommit = async () => {
    if (!currentUser) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    await createCommitment(
      currentUser,
      `${selectedTarget} ${selectedType} in ${selectedTime}`,
      Date.now() + parseDuration(selectedTime)
    );
    
    // Navigate back to home
    navigation.goBack();
  };

  const parseDuration = (duration: string): number => {
    if (duration.includes('hour')) {
      return parseInt(duration) * 3600000;
    }
    return parseInt(duration) * 60000;
  };

  const targets = WORKOUT_TARGETS[selectedType] || [];
  const isTrackable = ['Pushups', 'Squats', 'Jumping Jacks'].includes(selectedType);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Start a Move</Text>
          <Text style={styles.subtitle}>Choose your challenge</Text>
        </View>

        {/* Exercise Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXERCISE</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeCard,
                  selectedType === type && styles.typeCardSelected,
                ]}
                onPress={() => handleTypeSelect(type as WorkoutType)}
              >
                <View style={styles.typeIcon}>
                  {EXERCISE_ICONS[type]}
                </View>
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type && styles.typeLabelSelected,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Target Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TARGET</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.targetScroll}
          >
            {targets.map((target) => (
              <Pressable
                key={target}
                style={[
                  styles.targetPill,
                  selectedTarget === target && styles.targetPillSelected,
                ]}
                onPress={() => handleTargetSelect(target)}
              >
                <Text
                  style={[
                    styles.targetText,
                    selectedTarget === target && styles.targetTextSelected,
                  ]}
                >
                  {target}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TIME LIMIT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.targetScroll}
          >
            {WORKOUT_TIMES.map((time) => (
              <Pressable
                key={time}
                style={[
                  styles.timePill,
                  selectedTime === time && styles.timePillSelected,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Timer
                  size={14}
                  color={selectedTime === time ? COLORS.black : COLORS.systemGray1}
                />
                <Text
                  style={[
                    styles.timeText,
                    selectedTime === time && styles.timeTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>YOUR CHALLENGE</Text>
          <Text style={styles.summaryTitle}>
            {selectedTarget} {selectedType}
          </Text>
          <Text style={styles.summaryTime}>in {selectedTime}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isTrackable ? (
            <Pressable style={styles.goLiveButton} onPress={handleGoLive}>
              <LinearGradient
                colors={[COLORS.acidGreen, '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Play size={20} color={COLORS.black} fill={COLORS.black} />
              <Text style={styles.goLiveText}>GO LIVE</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.commitButton} onPress={handleCommit}>
              <Flame size={20} color={COLORS.white} fill={COLORS.white} />
              <Text style={styles.commitText}>COMMIT</Text>
            </Pressable>
          )}

          <Text style={styles.hint}>
            {isTrackable
              ? 'Camera will track your reps in real-time'
              : 'Your commitment will be visible to others'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoveScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.systemBg },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  // Header
  header: { paddingTop: 20, paddingBottom: 24 },
  title: { fontSize: 32, fontWeight: '900', color: COLORS.black, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.systemGray1 },

  // Sections
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },

  // Type Grid
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeCard: {
    width: (width - 52) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: COLORS.acidGreen,
    backgroundColor: 'rgba(255, 238, 50, 0.1)',
  },
  typeIcon: { marginBottom: 8 },
  typeLabel: { fontSize: 11, fontWeight: '700', color: COLORS.systemGray1, textAlign: 'center' },
  typeLabelSelected: { color: COLORS.black },

  // Target Pills
  targetScroll: { paddingRight: 20, gap: 10 },
  targetPill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  targetPillSelected: {
    borderColor: COLORS.acidGreen,
    backgroundColor: COLORS.acidGreen,
  },
  targetText: { fontSize: 16, fontWeight: '800', color: COLORS.systemGray1 },
  targetTextSelected: { color: COLORS.black },

  // Time Pills
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timePillSelected: {
    borderColor: COLORS.black,
    backgroundColor: COLORS.systemGray6,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: COLORS.systemGray1 },
  timeTextSelected: { color: COLORS.black },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: COLORS.systemGray1, letterSpacing: 1, marginBottom: 8 },
  summaryTitle: { fontSize: 28, fontWeight: '900', color: COLORS.black, marginBottom: 4 },
  summaryTime: { fontSize: 16, fontWeight: '600', color: COLORS.systemGray1 },

  // Actions
  actions: { alignItems: 'center' },
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 10,
    overflow: 'hidden',
    shadowColor: COLORS.acidGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  goLiveText: { fontSize: 16, fontWeight: '900', color: COLORS.black, letterSpacing: 2 },
  commitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: COLORS.black,
    paddingVertical: 18,
    borderRadius: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  commitText: { fontSize: 16, fontWeight: '900', color: COLORS.white, letterSpacing: 2 },
  hint: { marginTop: 16, fontSize: 12, color: COLORS.systemGray1, textAlign: 'center' },
});
