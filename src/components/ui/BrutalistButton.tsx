// ============================================
// CommitAI Mobile - Brutalist Button Component
// Liquid glass effect button
// ============================================

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { COLORS } from '@/constants';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface BrutalistButtonProps {
  label?: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  icon,
  iconPosition = 'right',
  size = 'medium',
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {/* Glare overlay for glass effect */}
      {variant !== 'ghost' && <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />}
      
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {(label || children) && (
            <Text
              style={[
                styles.text,
                variantStyles.text,
                sizeStyles.text,
                textStyle,
              ]}
            >
              {label || children}
            </Text>
          )}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </AnimatedPressable>
  );
};

// ============================================
// Variant Styles
// ============================================

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: COLORS.acidGreen,
          shadowColor: COLORS.acidGreen,
        } as ViewStyle,
        text: {
          color: COLORS.black,
        } as TextStyle,
        textColor: COLORS.black,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: COLORS.white,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.5)',
        } as ViewStyle,
        text: {
          color: COLORS.black,
        } as TextStyle,
        textColor: COLORS.black,
      };
    case 'danger':
      return {
        container: {
          backgroundColor: COLORS.voteRed,
          shadowColor: COLORS.voteRed,
        } as ViewStyle,
        text: {
          color: COLORS.white,
        } as TextStyle,
        textColor: COLORS.white,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
        } as ViewStyle,
        text: {
          color: COLORS.systemGray1,
        } as TextStyle,
        textColor: COLORS.systemGray1,
      };
    default:
      return {
        container: {} as ViewStyle,
        text: {} as TextStyle,
        textColor: COLORS.black,
      };
  }
};

// ============================================
// Size Styles
// ============================================

const getSizeStyles = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: 8,
          paddingHorizontal: 16,
          minHeight: 36,
        } as ViewStyle,
        text: {
          fontSize: 11,
          letterSpacing: 1,
        } as TextStyle,
      };
    case 'large':
      return {
        container: {
          paddingVertical: 18,
          paddingHorizontal: 28,
          minHeight: 56,
        } as ViewStyle,
        text: {
          fontSize: 15,
          letterSpacing: 2,
        } as TextStyle,
      };
    default: // medium
      return {
        container: {
          paddingVertical: 14,
          paddingHorizontal: 24,
          minHeight: 48,
        } as ViewStyle,
        text: {
          fontSize: 13,
          letterSpacing: 1.5,
        } as TextStyle,
      };
  }
};

// ============================================
// Base Styles
// ============================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    gap: 8,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BrutalistButton;
