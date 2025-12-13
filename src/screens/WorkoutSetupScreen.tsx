import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Play } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { FeedStackParamList } from '@/navigation/FeedStackParamList';
import { COLORS } from '@/constants';

type WorkoutSetupScreenRouteProp = RouteProp<FeedStackParamList, 'WorkoutSetup'>;
type WorkoutSetupScreenNavigationProp = NativeStackNavigationProp<FeedStackParamList, 'WorkoutSetup'>;

const WorkoutSetupScreen: React.FC = () => {
  const navigation = useNavigation<WorkoutSetupScreenNavigationProp>();
  const route = useRoute<WorkoutSetupScreenRouteProp>();
  const { exerciseType, target, duration, level } = route.params;

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleStartWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    navigation.navigate('WorkoutTransition', {
      exerciseType,
      target,
      duration,
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.systemBg }} edges={['top']}>
      <View className="flex-1 px-5">
        <View className="flex-row items-center justify-between py-4">
          <Pressable onPress={handleClose} className="w-10 h-10 items-center justify-center">
            <X size={28} color={COLORS.black} />
          </Pressable>
          <Text className="text-lg font-bold text-black">Workout Setup</Text>
          <View className="w-10" />
        </View>

        <View className="mt-8 mb-6">
          <Text className="text-[36px] font-black text-black mb-2">
            {target} {exerciseType}
          </Text>
          <Text className="text-xl font-semibold" style={{ color: COLORS.systemGray1 }}>
            in {duration}
          </Text>
          <View className="mt-4 flex-row items-center">
            <View
              className="px-4 py-2 rounded-full"
              style={{ backgroundColor: COLORS.acidGreen }}
            >
              <Text className="text-sm font-bold text-black uppercase">
                {level}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View
          className="rounded-3xl p-5 mb-6"
          style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.systemGray5 }}
        >
          <Text className="text-lg font-bold text-black mb-3">How it works</Text>
          <View className="gap-2">
            <Text className="text-base" style={{ color: COLORS.systemGray1 }}>
              • Position your device so you're fully visible
            </Text>
            <Text className="text-base" style={{ color: COLORS.systemGray1 }}>
              • Start when you're ready
            </Text>
            <Text className="text-base" style={{ color: COLORS.systemGray1 }}>
              • AI will count your reps automatically
            </Text>
            <Text className="text-base" style={{ color: COLORS.systemGray1 }}>
              • Complete your target before time runs out
            </Text>
          </View>
        </View>

        <View className="flex-1" />

        {/* Start Button */}
        <Pressable
          className="rounded-3xl overflow-hidden mb-6"
          style={{
            shadowColor: COLORS.acidGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
          onPress={handleStartWorkout}
        >
          <LinearGradient
            colors={[COLORS.acidGreen, '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View className="flex-row items-center justify-center py-6 gap-2.5">
            <Play size={24} color={COLORS.black} fill={COLORS.black} />
            <Text className="text-xl font-black tracking-widest text-black">
              START WORKOUT
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutSetupScreen;
