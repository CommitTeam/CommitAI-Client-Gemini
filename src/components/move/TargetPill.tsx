import React from 'react';
import { Pressable, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants';

interface TargetPillProps {
  target: string;
  isSelected: boolean;
  onPress: (target: string) => void;
}

const TargetPill: React.FC<TargetPillProps> = ({ target, isSelected, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(target);
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
        {target}
      </Text>
    </Pressable>
  );
};

export default TargetPill;
