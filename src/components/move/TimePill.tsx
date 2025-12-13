import React from 'react';
import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants';

interface TimePillProps {
  time: string;
  isSelected: boolean;
  onPress: (time: string) => void;
}

const TimePill: React.FC<TimePillProps> = ({ time, isSelected, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(time);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="px-6 py-3 rounded-full"
      style={{
        backgroundColor: isSelected ? COLORS.acidGreen : COLORS.white,
        borderWidth: isSelected ? 0 : 1,
        borderColor: COLORS.systemGray5,
      }}
    >
      <Text
        className="text-base font-bold"
        style={{ color: isSelected ? COLORS.black : COLORS.systemGray1 }}
      >
        {time}
      </Text>
    </Pressable>
  );
};

export default TimePill;
