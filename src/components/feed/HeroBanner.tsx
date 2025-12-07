// ============================================
// CommitAI Mobile - Hero Banner Component
// Auto-scrolling carousel with personalized slides
// ============================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {
  Bot,
  Share2,
  Crown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';

import { User } from '@/types';
import { COLORS, SCENIC_IMAGES, TIMING } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 480;

interface Slide {
  id: string;
  type: 'ai_greeting' | 'recommendation' | 'leaderboard';
  title: string;
  subtitle: string;
  badge: { text: string; color: string; bgColor: string };
  image: string;
  cta: string;
}

interface HeroBannerProps {
  currentUser: User | null;
  onOpenMove: () => void;
  onViewProfile: (userId: string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  currentUser,
  onOpenMove,
  onViewProfile,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const translateX = useSharedValue(0);
  const autoScrollTimer = useRef<NodeJS.Timeout | null>(null);

  // Generate slides based on user state
  useEffect(() => {
    if (!currentUser) return;

    const generatedSlides: Slide[] = [];

    // Slide 1: Personalized greeting
    let greetingTitle = 'Welcome Rookie 💥';
    let greetingSubtitle = 'Time to make your first move!';
    const lastActiveDiff = Date.now() - currentUser.lastActiveAt;
    const isInactive = lastActiveDiff > 3 * 24 * 60 * 60 * 1000;

    if (currentUser.stats.totalWorkouts === 0) {
      greetingTitle = `Welcome ${currentUser.name} 💥`;
      greetingSubtitle = 'Time to make your first move!';
    } else if (isInactive) {
      greetingTitle = 'Hey you! 👋';
      greetingSubtitle = "We missed your sweat. Let's get back on track.";
    } else if (currentUser.stats.currentStreak > 2) {
      greetingTitle = "You're on a streak! 🔥";
      greetingSubtitle = "Keep the fire alive! Don't break the chain now.";
    } else {
      const quotes = [
        { t: "You're on 🔥", s: "Right now, you're unstoppable." },
        { t: 'Every loss is a warm-up', s: 'Let\'s go again. Prove them wrong.' },
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      greetingTitle = q.t;
      greetingSubtitle = q.s;
    }

    generatedSlides.push({
      id: 'ai_prompter',
      type: 'ai_greeting',
      title: greetingTitle,
      subtitle: greetingSubtitle,
      badge: { text: 'DAILY BOOST', color: COLORS.acidGreen, bgColor: COLORS.black },
      image: SCENIC_IMAGES[1],
      cta: 'CHECK IN',
    });

    // Slide 2: Invite friend
    generatedSlides.push({
      id: 'invite_friend',
      type: 'recommendation',
      title: 'Know a Friend who boasts?',
      subtitle: 'Ask them to prove it.',
      badge: { text: 'CHALLENGE', color: COLORS.white, bgColor: COLORS.punchBlue },
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
      cta: 'INVITE',
    });

    // Slide 3: Leaderboard highlight
    generatedSlides.push({
      id: 'leaderboard_top',
      type: 'leaderboard',
      title: '@MightyMike is DOMINATING',
      subtitle: '9 wins in a row! Can you beat the king?',
      badge: { text: 'LEADERBOARD BEAST', color: COLORS.black, bgColor: '#F59E0B' },
      image: SCENIC_IMAGES[4],
      cta: 'WATCH LIVE',
    });

    setSlides(generatedSlides);
  }, [currentUser]);

  // Auto-scroll
  useEffect(() => {
    if (slides.length === 0) return;

    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        setActiveIndex((prev) => {
          const next = (prev + 1) % slides.length;
          translateX.value = withTiming(-next * SCREEN_WIDTH, { duration: 500 });
          return next;
        });
      }, TIMING.CAROUSEL_AUTO_SCROLL);
    };

    startAutoScroll();

    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    translateX.value = withTiming(-index * SCREEN_WIDTH, { duration: 300 });
    Haptics.selectionAsync();

    // Reset auto-scroll timer
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
    }
    autoScrollTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        translateX.value = withTiming(-next * SCREEN_WIDTH, { duration: 500 });
        return next;
      });
    }, TIMING.CAROUSEL_AUTO_SCROLL + 2000);
  }, [slides.length]);

  const handleNavPress = (direction: 'left' | 'right') => {
    const newIndex =
      direction === 'right'
        ? (activeIndex + 1) % slides.length
        : (activeIndex - 1 + slides.length) % slides.length;
    goToSlide(newIndex);
  };

  const handleSlideAction = async (slide: Slide) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (slide.type === 'ai_greeting') {
      onOpenMove();
    } else if (slide.type === 'recommendation') {
      try {
        await Share.share({
          message: 'Stop boasting. Start proving. I challenge you on CommitAI!',
          title: 'CommitAI Challenge',
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else if (slide.type === 'leaderboard') {
      onViewProfile('u_viper');
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const { velocityX, translationX } = event;
      const threshold = SCREEN_WIDTH / 4;

      if (translationX < -threshold || velocityX < -500) {
        runOnJS(handleNavPress)('right');
      } else if (translationX > threshold || velocityX > 500) {
        runOnJS(handleNavPress)('left');
      }
    });

  if (slides.length === 0) return null;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.slidesContainer, animatedStyle]}>
          {slides.map((slide, index) => (
            <View key={slide.id} style={styles.slide}>
              {/* Background Image */}
              <Image
                source={{ uri: slide.image }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />

              {/* Overlay gradients */}
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent']}
                style={styles.topGradient}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                style={styles.bottomGradient}
              />
              <LinearGradient
                colors={['transparent', COLORS.systemBg]}
                style={styles.fadeGradient}
              />

              {/* Content */}
              <View style={styles.slideContent}>
                {/* Badge */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: slide.badge.bgColor },
                  ]}
                >
                  {slide.type === 'ai_greeting' && (
                    <Bot size={12} color={slide.badge.color} />
                  )}
                  {slide.type === 'recommendation' && (
                    <Share2 size={12} color={slide.badge.color} />
                  )}
                  {slide.type === 'leaderboard' && (
                    <Crown size={12} color={slide.badge.color} />
                  )}
                  <Text style={[styles.badgeText, { color: slide.badge.color }]}>
                    {slide.badge.text}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>{slide.title}</Text>

                {/* Subtitle */}
                <Text style={styles.subtitle}>{slide.subtitle}</Text>

                {/* CTA Button */}
                <Pressable
                  style={styles.ctaButton}
                  onPress={() => handleSlideAction(slide)}
                >
                  <Text style={styles.ctaText}>{slide.cta}</Text>
                  <ArrowRight size={14} color={COLORS.black} strokeWidth={3} />
                </Pressable>
              </View>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>

      {/* Navigation Arrows */}
      <Pressable
        style={[styles.navButton, styles.navLeft]}
        onPress={() => handleNavPress('left')}
      >
        <ChevronLeft size={32} color="rgba(255,255,255,0.6)" />
      </Pressable>
      <Pressable
        style={[styles.navButton, styles.navRight]}
        onPress={() => handleNavPress('right')}
      >
        <ChevronRight size={32} color="rgba(255,255,255,0.6)" />
      </Pressable>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default HeroBanner;

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    width: SCREEN_WIDTH,
    marginLeft: -16, // Full bleed
    marginBottom: 20,
    backgroundColor: COLORS.systemBg,
  },
  slidesContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    height: '60%',
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  slideContent: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 8,
    lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
    lineHeight: 20,
    maxWidth: '85%',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    padding: 8,
  },
  navLeft: {
    left: 8,
  },
  navRight: {
    right: 8,
  },
  pagination: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    height: 20,
    backgroundColor: COLORS.acidGreen,
  },
});
