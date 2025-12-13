import React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { WorkoutType } from '@/types';
import { COLORS } from '@/constants';

interface ExerciseCardProps {
  type: WorkoutType;
  icon: React.ReactNode;
  isSelected: boolean;
  onPress: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ type, icon, isSelected, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-2xl p-4 items-center justify-center aspect-square"
      style={{
        backgroundColor: isSelected ? COLORS.acidGreen : COLORS.white,
        borderWidth: isSelected ? 0 : 1,
        borderColor: COLORS.systemGray5,
      }}
    >
      <View className="mb-2">{icon}</View>
      <Text
        className="text-xs font-bold text-center"
        style={{ color: isSelected ? COLORS.black : COLORS.systemGray1 }}
      >
        {type}
      </Text>
    </Pressable>
  );
};

export default ExerciseCard;
