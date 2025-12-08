// ============================================
// CommitAI Mobile - Avatar Selection Screen
// Pick your avatar identity
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
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
import { saveAccessToken, saveRefreshToken } from '@/store/secureStore';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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
  const dispatch = useDispatch()
  const route = useRoute<RouteType>();
  const { username } = route.params;
  const {accessToken, refreshToken} = useSelector((state: RootState) => state.auth)

  const [selectedSeed, setSelectedSeed] = useState<string>(AVATAR_SEEDS[0]);
  const [loading, setLoading] = useState(false);

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
      await updateUserAvatar(`u_${username.toLowerCase()}`, avatarUrl);
      console.log('accessToken:', accessToken);
      console.log('refreshToken:', refreshToken);
      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);

    } catch (error) {
      console.error('Avatar update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-systemBg">
      <Animated.View
        className="flex-1 px-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* Header */}
        <View className="items-center pt-6 pb-8">
          <Text className="text-[28px] font-bold text-black mb-2">Pick an Avatar</Text>
          <Text className="text-sm text-systemGray1">How the world (and AI) sees you.</Text>
        </View>

        {/* Avatar Grid */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row flex-wrap justify-between gap-4">
            {AVATAR_SEEDS.map((seed, index) => {
              const isSelected = selectedSeed === seed;
              return (
                <Animated.View
                  key={seed}
                  style={[
                    {
                      width: AVATAR_SIZE,
                      aspectRatio: 1,
                      transform: [{ scale: scaleAnims[index] }],
                      zIndex: isSelected ? 10 : 1,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => handleSelect(seed, index)}
                    className={`w-full h-full overflow-hidden bg-white shadow-md ${
                      isSelected
                        ? 'opacity-100 border-4 border-acidGreen shadow-acidGreen shadow-lg'
                        : 'opacity-70'
                    }`}
                    style={{
                      borderRadius: AVATAR_SIZE / 2,
                      shadowColor: isSelected ? COLORS.acidGreen : '#000',
                      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                      shadowOpacity: isSelected ? 0.4 : 0.1,
                      shadowRadius: isSelected ? 12 : 8,
                      elevation: isSelected ? 8 : 3,
                    }}
                  >
                    <Image
                      source={{ uri: getAvatarUrl(seed) }}
                      className="w-full h-full"
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
        <View
          className="flex-row items-center bg-white/85 rounded-[32px] p-4 mb-6 gap-3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View className="w-14 h-14 rounded-full overflow-hidden bg-systemGray6">
            <Image
              source={{ uri: getAvatarUrl(selectedSeed) }}
              className="w-full h-full"
              contentFit="cover"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-semibold text-systemGray1 uppercase tracking-widest mb-0.5">
              Ready to go
            </Text>
            <Text className="text-lg font-bold text-black">{username}</Text>
          </View>
          <Pressable
            className={`bg-acidGreen px-6 py-3.5 rounded-[20px] ${loading ? 'opacity-70' : ''}`}
            style={{
              shadowColor: COLORS.acidGreen,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.black} size="small" />
            ) : (
              <Text className="text-xs font-extrabold text-black tracking-wider">LET'S GO</Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default AvatarSelectionScreen;
