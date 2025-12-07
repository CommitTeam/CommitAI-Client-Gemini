// ============================================
// CommitAI Mobile - Glass Card Component
// Frosted glass effect card
// ============================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/constants';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'light' | 'dark';
  noPadding?: boolean;
  borderRadius?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 80,
  variant = 'light',
  noPadding = false,
  borderRadius = 32,
}) => {
  const isLight = variant === 'light';

  return (
    <View
      style={[
        styles.container,
        { borderRadius },
        isLight ? styles.containerLight : styles.containerDark,
        style,
      ]}
    >
      {/* Blur background */}
      <BlurView
        intensity={intensity}
        tint={isLight ? 'light' : 'dark'}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      
      {/* Gradient overlay for glass effect */}
      <LinearGradient
        colors={
          isLight
            ? ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']
            : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius }]}
      />
      
      {/* Content */}
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  containerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  content: {
    padding: 20,
  },
  noPadding: {
    padding: 0,
  },
});

export default GlassCard;
