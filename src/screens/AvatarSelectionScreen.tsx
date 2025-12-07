// ============================================
// CommitAI Mobile - Avatar Selection Screen
// Pick your avatar identity
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { updateUserAvatar } from '@/services/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AvatarSelection'>;
type RouteType = RouteProp<RootStackParamList, 'AvatarSelection'>;

const { width } = Dimensions.get('window');
const AVATAR_SIZE = (width - 80) / 3;

// Avatar seeds for DiceBear API
const AVATAR_SEEDS = [
  'Bubbles', 'Cookie', 'Sunny', 'Sparkle', 
  'Jelly', 'Noodle', 'Giggles', 'Waffles', 
  'Peanut', 'Bean', 'Pops', 'Doodle'
];

const getAvatarUrl = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc&mouth=smile,twinkle,tongue&eyes=happy,hearts,wink,surprised&eyebrows=default,raisedExcited,upDown&accessoriesProbability=0`;

const AvatarSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { username } = route.params;

  const [selectedSeed, setSelectedSeed] = useState<string>(AVATAR_SEEDS[0]);
  const [loading, setLoading] = useState(false);

  // Animations
  const scaleAnims = useRef(AVATAR_SEEDS.map(() => new Animated.Value(1))).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelect = (seed: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate previous selection down
    const prevIndex = AVATAR_SEEDS.indexOf(selectedSeed);
    if (prevIndex !== -1) {
      Animated.spring(scaleAnims[prevIndex], {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
    
    // Animate new selection up
    Animated.spring(scaleAnims[index], {
      toValue: 1.15,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();

    setSelectedSeed(seed);
  };

  const handleConfirm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      const avatarUrl = getAvatarUrl(selectedSeed);
      // In a real app, we'd get the user ID from context/state
      // For now, we'll use the username to find the user
      await updateUserAvatar(`u_${username.toLowerCase()}`, avatarUrl);
      navigation.replace('Main');
    } catch (error) {
      console.error('Avatar update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pick an Avatar</Text>
          <Text style={styles.subtitle}>How the world (and AI) sees you.</Text>
        </View>

        {/* Avatar Grid */}
        <ScrollView
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {AVATAR_SEEDS.map((seed, index) => {
              const isSelected = selectedSeed === seed;
              return (
                <Animated.View
                  key={seed}
                  style={[
                    styles.avatarWrapper,
                    {
                      transform: [{ scale: scaleAnims[index] }],
                      zIndex: isSelected ? 10 : 1,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => handleSelect(seed, index)}
                    style={[
                      styles.avatarButton,
                      isSelected && styles.avatarButtonSelected,
                    ]}
                  >
                    <Image
                      source={{ uri: getAvatarUrl(seed) }}
                      style={styles.avatarImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <View style={styles.selectedPreview}>
            <Image
              source={{ uri: getAvatarUrl(selectedSeed) }}
              style={styles.previewImage}
              contentFit="cover"
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.readyLabel}>Ready to go</Text>
            <Text style={styles.usernameText}>{username}</Text>
          </View>
          <Pressable
            style={[styles.confirmButton, loading && styles.confirmButtonLoading]}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.black} size="small" />
            ) : (
              <Text style={styles.confirmButtonText}>LET'S GO</Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AvatarSelectionScreen;

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.systemGray1,
  },

  // Grid
  gridContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    aspectRatio: 1,
  },
  avatarButton: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    opacity: 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarButtonSelected: {
    opacity: 1,
    borderWidth: 4,
    borderColor: COLORS.acidGreen,
    shadowColor: COLORS.acidGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Bottom Card
  bottomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 32,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    gap: 12,
  },
  selectedPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: COLORS.systemGray6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  readyLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  confirmButton: {
    backgroundColor: COLORS.acidGreen,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: COLORS.acidGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonLoading: {
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 1,
  },
});
