import React from 'react';
import { View, Text } from 'react-native';
import { WorkoutType } from '@/types';
import { COLORS } from '@/constants';

interface SummaryCardProps {
  target: string;
  exerciseType: WorkoutType;
  time: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ target, exerciseType, time }) => {
  return (
    <View
      className="rounded-3xl p-6 mb-6"
      style={{ backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.systemGray5 }}
    >
      <Text className="text-sm font-semibold mb-2" style={{ color: COLORS.systemGray1 }}>
        YOUR CHALLENGE
      </Text>
      <Text className="text-2xl font-black text-black">
        {target} {exerciseType} in {time}
      </Text>
    </View>
  );
};

export default SummaryCard;
