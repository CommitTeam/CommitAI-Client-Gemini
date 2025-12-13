import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants';

interface TransitionScreenProps {
  message: string;
}

const TransitionScreen: React.FC<TransitionScreenProps> = ({ message }) => {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.black }}>
      <LinearGradient
        colors={[COLORS.black, COLORS.systemGray1, COLORS.black]}
        className="flex-1 items-center justify-center"
      >
        <View className="items-center">
          <ActivityIndicator size="large" color={COLORS.acidGreen} />
          <Text className="text-2xl font-black text-white mt-6 text-center">
            Getting ready {message}...
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default TransitionScreen;
