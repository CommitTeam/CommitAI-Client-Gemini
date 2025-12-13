import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Footprints, Flame, Zap, Play } from 'lucide-react-native';

import { User, WorkoutType } from '@/types';
import { COLORS, WORKOUT_TYPES, WORKOUT_TARGETS } from '@/constants';
import { getCurrentUser, createCommitment } from '@/services/backend';
import { FeedStackParamList, MainTabParamList } from '@/navigation/FeedStackParamList';
import { ExerciseCard, TargetPill, TimePill, SummaryCard } from '@/components/move';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Move'>,
  NativeStackNavigationProp<FeedStackParamList>
>;

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
  const [selectedLevel, setSelectedLevel] = useState<string>('easy');

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Reset target and time when type changes
    const targets = WORKOUT_TARGETS[selectedType];
    if (targets && targets.length > 0) {
      setSelectedTarget(targets[0]);
    }

    const isTrackable = ['Pushups', 'Squats', 'Jumping Jacks'].includes(selectedType);
    if (isTrackable) {
      setSelectedTime('1 min');
    } else if (selectedType === 'Calories') {
      setSelectedTime('20 mins');
    } else {
      setSelectedTime('1 hour');
    }
  }, [selectedType]);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleGoLive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    navigation.navigate('WorkoutSetup', {
      exerciseType: selectedType,
      target: selectedTarget,
      duration: selectedTime,
      level: selectedLevel,
    });
  };

  const handleCommit = async () => {
    if (!currentUser) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await createCommitment(
      currentUser,
      `${selectedTarget} ${selectedType} in ${selectedTime}`,
      Date.now() + parseDuration(selectedTime)
    );

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

  const times =
    isTrackable
      ? ['1 min', '2 mins', '3 mins']
      : selectedType === 'Calories'
      ? ['20 mins', '30 mins', '1 hour']
      : ['1 hour', '12 hours', '24 hours'];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.systemBg }} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-4 pb-6">
          <Text className="text-[32px] font-black text-black mb-1">
            Start a Move
          </Text>
          <Text className="text-base" style={{ color: COLORS.systemGray1 }}>
            Choose your challenge
          </Text>
        </View>

        {/* Exercise Type Selection */}
        <View className="mb-7">
          <Text
            className="text-xs font-bold tracking-wider mb-3 uppercase"
            style={{ color: COLORS.systemGray1 }}
          >
            EXERCISE
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {WORKOUT_TYPES.map((type) => (
              <View key={type} className="w-[30%]">
                <ExerciseCard
                  type={type as WorkoutType}
                  icon={EXERCISE_ICONS[type]}
                  isSelected={selectedType === type}
                  onPress={() => setSelectedType(type as WorkoutType)}
                />
              </View>
            ))}
          </View>
        </View>

        <View className="mb-3">
          <Text
            className="text-xs font-bold tracking-wider mb-3 uppercase"
            style={{ color: COLORS.systemGray1 }}
          >
            TARGET
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 20 }}
          >
            {targets.map((target) => (
              <TargetPill
                key={target}
                target={target}
                isSelected={selectedTarget === target}
                onPress={setSelectedTarget}
              />
            ))}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View className="mb-3">
          <Text
            className="text-xs font-bold tracking-wider mb-3 uppercase"
            style={{ color: COLORS.systemGray1 }}
          >
            TIME LIMIT
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 15, paddingRight: 20, paddingVertical: 10, paddingLeft:10 }}
          >
            {times.map((time) => (
              <TimePill
                key={time}
                time={time}
                isSelected={selectedTime === time}
                onPress={setSelectedTime}
              />
            ))}
          </ScrollView>
        </View>

        <SummaryCard
          target={selectedTarget}
          exerciseType={selectedType}
          time={selectedTime}
        />

        <View>
          <View className="flex-row items-center gap-3">
            {isTrackable && (
              <Pressable
                className="flex-1 rounded-3xl overflow-hidden"
                style={{
                  shadowColor: COLORS.acidGreen,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                }}
                onPress={handleGoLive}
              >
                <LinearGradient
                  colors={[COLORS.acidGreen, '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <View className="flex-row items-center justify-center py-6 gap-2.5">
                  <Play size={20} color={COLORS.black} fill={COLORS.black} />
                  <Text className="text-base font-black tracking-widest text-black">
                    GO LIVE
                  </Text>
                </View>
              </Pressable>
            )}

            {/* COMMIT Button - Always show */}
            <Pressable
              className={`${isTrackable ? 'flex-1' : 'w-full'} bg-black rounded-3xl`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={handleCommit}
            >
              <View className="flex-row items-center justify-center py-6 gap-2.5">
                <Flame size={20} color={COLORS.white} fill={COLORS.white} />
                <Text className="text-base font-black tracking-widest text-white">
                  COMMIT
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Hint Text */}
          <Text className="mt-2 text-xs text-center" style={{ color: COLORS.systemGray1 }}>
            {isTrackable
              ? 'Go live to track reps with camera, or commit for later'
              : 'Your commitment will be visible to others'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoveScreen;
