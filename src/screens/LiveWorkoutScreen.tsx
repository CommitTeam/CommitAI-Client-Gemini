// ============================================
// CommitAI Mobile - Live Workout Screen
// Camera-based rep counting with pose detection
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  Camera,
  X,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { BrutalistButton } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveWorkout'>;
type RouteType = RouteProp<RootStackParamList, 'LiveWorkout'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type WorkoutStatus = 'setup' | 'countdown' | 'active' | 'finished';

const LiveWorkoutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { exerciseType, target, duration } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>('setup');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Get Ready');

  // Parse targets
  const targetReps = parseInt(target) || 20;
  const targetSeconds = duration.includes('min')
    ? parseInt(duration) * 60
    : parseInt(duration) || 120;

  // Animations
  const repScale = useSharedValue(1);
  const countdownScale = useSharedValue(1);

  // Rep counting simulation (in production, use TensorFlow.js or similar)
  const repCounterRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (workoutStatus === 'active') {
      // Simulate rep detection every 2-4 seconds
      repCounterRef.current = setInterval(() => {
        const shouldCount = Math.random() > 0.3; // 70% chance to count a rep
        if (shouldCount) {
          setReps((prev) => {
            const newReps = prev + 1;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            // Animate rep counter
            repScale.value = withSequence(
              withSpring(1.3, { damping: 5 }),
              withSpring(1, { damping: 10 })
            );

            // Update feedback
            const feedbacks = [
              'Great form!',
              'Keep going!',
              'You got this!',
              'Nice pace!',
              'Stay strong!',
              'Almost there!',
            ];
            setFeedback(feedbacks[Math.floor(Math.random() * feedbacks.length)]);

            return newReps;
          });
        }
      }, 2000 + Math.random() * 2000);

      return () => {
        if (repCounterRef.current) clearInterval(repCounterRef.current);
      };
    }
  }, [workoutStatus]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (workoutStatus === 'countdown') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setWorkoutStatus('active');
            setTimeLeft(targetSeconds);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          countdownScale.value = withSequence(
            withTiming(1.5, { duration: 100 }),
            withTiming(1, { duration: 400 })
          );
          return prev - 1;
        });
      }, 1000);
    } else if (workoutStatus === 'active') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setWorkoutStatus('finished');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [workoutStatus, targetSeconds]);

  // Auto-complete if target reached
  useEffect(() => {
    if (workoutStatus === 'active' && reps >= targetReps) {
      setWorkoutStatus('finished');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [reps, workoutStatus, targetReps]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setWorkoutStatus('countdown');
    setCountdown(3);
  };

  const handleClose = () => {
    if (workoutStatus === 'active') {
      Alert.alert(
        'End Workout?',
        'Your progress will be lost.',
        [
          { text: 'Keep Going', style: 'cancel' },
          {
            text: 'End',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace('WorkoutSummary', {
      exerciseType,
      reps,
      target: targetReps,
      duration: targetSeconds - timeLeft,
      success: reps >= targetReps,
    });
  };

  const handleRetry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setWorkoutStatus('setup');
    setReps(0);
    setTimeLeft(0);
    setFeedback('Get Ready');
  };

  const toggleCamera = () => {
    setFacing((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  // Animated styles
  const repAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: repScale.value }],
  }));

  const countdownAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countdownScale.value }],
  }));

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={64} color={COLORS.white} style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDesc}>
            We use your camera to count reps. Your video is processed locally
            and never sent to a server.
          </Text>
          <BrutalistButton
            label="Grant Access"
            onPress={requestPermission}
            style={{ marginTop: 24 }}
          />
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const success = reps >= targetReps;

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {/* Dark overlay for finished state */}
      {workoutStatus === 'finished' && (
        <View style={styles.darkOverlay} />
      )}

      {/* Close Button */}
      <SafeAreaView style={styles.closeButtonContainer} edges={['top']}>
        <Pressable style={styles.closeButton} onPress={handleClose}>
          <X size={24} color={COLORS.white} />
        </Pressable>
        {workoutStatus !== 'finished' && (
          <Pressable style={styles.flipButton} onPress={toggleCamera}>
            <RotateCcw size={20} color={COLORS.white} />
          </Pressable>
        )}
      </SafeAreaView>

      {/* Countdown Overlay */}
      {workoutStatus === 'countdown' && (
        <View style={styles.countdownOverlay}>
          <Animated.Text style={[styles.countdownText, countdownAnimatedStyle]}>
            {countdown}
          </Animated.Text>
        </View>
      )}

      {/* Active HUD */}
      {workoutStatus === 'active' && (
        <>
          {/* Top HUD */}
          <SafeAreaView style={styles.hudTop} edges={['top']}>
            <View style={styles.hudCard}>
              <Text style={styles.hudLabel}>REPS</Text>
              <Animated.Text style={[styles.hudValueLarge, repAnimatedStyle]}>
                {reps}
              </Animated.Text>
              <Text style={styles.hudTarget}>/ {targetReps}</Text>
            </View>

            <View style={styles.hudCard}>
              <Text style={styles.hudLabel}>TIME</Text>
              <Text
                style={[
                  styles.hudValueTime,
                  timeLeft < 10 && styles.hudValueDanger,
                ]}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>
          </SafeAreaView>

          {/* Bottom Feedback */}
          <View style={styles.feedbackContainer}>
            <View style={styles.feedbackPill}>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          </View>
        </>
      )}

      {/* Setup UI */}
      {workoutStatus === 'setup' && (
        <View style={styles.setupContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.setupContent}>
            <Text style={styles.setupTitle}>Live {exerciseType}</Text>
            <Text style={styles.setupInstructions}>
              1. Position your device to capture your full body{'\n'}
              2. Stand back so you're fully visible{'\n'}
              3. Wait for the countdown
            </Text>

            <View style={styles.targetInfo}>
              <Text style={styles.targetLabel}>TARGET</Text>
              <Text style={styles.targetValue}>
                {targetReps} reps in {duration}
              </Text>
            </View>

            <BrutalistButton
              label="START NOW"
              onPress={handleStart}
              icon={<Play size={20} color={COLORS.black} fill={COLORS.black} />}
              fullWidth
              size="large"
            />
            <Pressable style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Finished UI */}
      {workoutStatus === 'finished' && (
        <View style={styles.finishedContainer}>
          <View style={[styles.resultIcon, success && styles.resultIconSuccess]}>
            {success ? (
              <CheckCircle size={64} color={COLORS.black} />
            ) : (
              <AlertTriangle size={64} color={COLORS.black} />
            )}
          </View>

          <Text style={styles.finishedTitle}>
            {success ? 'CRUSHED IT!' : 'FINISHED'}
          </Text>
          <Text style={styles.finishedSubtitle}>
            {success
              ? `You completed ${reps} reps. Beast mode activated.`
              : `You did ${reps} reps. Good effort, but you can do better.`}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>REPS</Text>
              <Text style={styles.statValue}>{reps}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>
                {formatTime(targetSeconds - timeLeft)}
              </Text>
            </View>
          </View>

          <View style={styles.finishedActions}>
            <BrutalistButton
              label="Save & Continue"
              onPress={handleComplete}
              fullWidth
              size="large"
            />
            <Pressable style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
            <Pressable style={styles.discardButton} onPress={() => navigation.goBack()}>
              <Text style={styles.discardText}>Discard</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default LiveWorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },

  // Close button
  closeButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 100,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Permission
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionIcon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
  },
  permissionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionText: {
    color: COLORS.white,
    fontSize: 16,
  },

  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    fontSize: 150,
    fontWeight: '900',
    color: COLORS.acidGreen,
  },

  // HUD
  hudTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
  },
  hudCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hudLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  hudValueLarge: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.acidGreen,
    lineHeight: 52,
  },
  hudTarget: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  hudValueTime: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: COLORS.white,
  },
  hudValueDanger: {
    color: '#EF4444',
  },

  // Feedback
  feedbackContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  feedbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Setup
  setupContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 80,
  },
  setupContent: {
    padding: 24,
    paddingBottom: 40,
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 16,
  },
  setupInstructions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 24,
    marginBottom: 24,
  },
  targetInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  targetValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },

  // Finished
  finishedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.acidGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.acidGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  resultIconSuccess: {
    backgroundColor: COLORS.acidGreen,
  },
  finishedTitle: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.white,
    marginBottom: 8,
  },
  finishedSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
  },
  finishedActions: {
    width: '100%',
    maxWidth: 320,
  },
  retryButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.acidGreen,
  },
  discardButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  discardText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
});
