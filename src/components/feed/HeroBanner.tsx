import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Dimensions, Pressable, Share } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import * as Haptics from "expo-haptics";
import {
  Bot,
  Share2,
  Crown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

import { User } from "@/types";
import { COLORS, SCENIC_IMAGES, TIMING } from "@/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_HEIGHT = 380;

interface Slide {
  id: string;
  type: "ai_greeting" | "recommendation" | "leaderboard";
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
  const carouselRef = useRef<ICarouselInstance | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const generatedSlides: Slide[] = [];

    let greetingTitle = "Welcome Rookie 💥";
    let greetingSubtitle = "Time to make your first move!";
    const lastActiveDiff = Date.now() - currentUser.lastActiveAt;
    const isInactive = lastActiveDiff > 3 * 24 * 60 * 60 * 1000;

    if (currentUser.stats.totalWorkouts === 0) {
      greetingTitle = `Welcome ${currentUser.name} 💥`;
      greetingSubtitle = "Time to make your first move!";
    } else if (isInactive) {
      greetingTitle = "Hey you! 👋";
      greetingSubtitle = "We missed your sweat. Let's get back on track.";
    } else if (currentUser.stats.currentStreak > 2) {
      greetingTitle = "You're on a streak! 🔥";
      greetingSubtitle = "Keep the fire alive! Don't break the chain now.";
    } else {
      const quotes = [
        { t: "You're on 🔥", s: "Right now, you're unstoppable." },
        { t: "Every loss is a warm-up", s: "Let's go again. Prove them wrong." },
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      greetingTitle = q.t;
      greetingSubtitle = q.s;
    }

    generatedSlides.push({
      id: "ai_prompter",
      type: "ai_greeting",
      title: greetingTitle,
      subtitle: greetingSubtitle,
      badge: { text: "DAILY BOOST", color: COLORS.acidGreen, bgColor: COLORS.black },
      image: SCENIC_IMAGES[1],
      cta: "CHECK IN",
    });

    generatedSlides.push({
      id: "invite_friend",
      type: "recommendation",
      title: "Know a Friend who boasts?",
      subtitle: "Ask them to prove it.",
      badge: { text: "CHALLENGE", color: COLORS.white, bgColor: COLORS.punchBlue },
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
      cta: "INVITE",
    });

    generatedSlides.push({
      id: "leaderboard_top",
      type: "leaderboard",
      title: "@MightyMike is DOMINATING",
      subtitle: "9 wins in a row! Can you beat the king?",
      badge: { text: "LEADERBOARD BEAST", color: COLORS.black, bgColor: "#F59E0B" },
      image: SCENIC_IMAGES[4],
      cta: "WATCH LIVE",
    });

    setSlides(generatedSlides);
    setActiveIndex(0);

    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo({ index: 0, animated: false });
    });
  }, [currentUser]);

  const handleSlideAction = useCallback(
    async (slide: Slide) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (slide.type === "ai_greeting") {
        onOpenMove();
      } else if (slide.type === "recommendation") {
        try {
          await Share.share({
            message: "Stop boasting. Start proving. I challenge you on CommitAI!",
            title: "CommitAI Challenge",
          });
        } catch (error) {
          console.error("Share error:", error);
        }
      } else if (slide.type === "leaderboard") {
        onViewProfile("u_viper");
      }
    },
    [onOpenMove, onViewProfile]
  );

  const handleNavPress = useCallback(
    (direction: "left" | "right") => {
      if (!slides.length) return;

      const next =
        direction === "right"
          ? (activeIndex + 1) % slides.length
          : (activeIndex - 1 + slides.length) % slides.length;

      Haptics.selectionAsync();
      carouselRef.current?.scrollTo({ index: next, animated: true });
      setActiveIndex(next);
    },
    [activeIndex, slides.length]
  );

  const renderSlide = useCallback(
    ({ item: slide }: { item: Slide; index: number }) => {
      const Icon =
        slide.type === "ai_greeting" ? Bot : slide.type === "recommendation" ? Share2 : Crown;

      return (
        <View className="relative w-full" style={{ width: SCREEN_WIDTH, height: BANNER_HEIGHT }}>
          <Image
            source={{ uri: slide.image }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            contentFit="cover"
          />

          {/* overlays */}
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 100 }}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.65)", "rgba(0,0,0,0.9)"]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" }}
          />
          <LinearGradient
            colors={["transparent", COLORS.systemBg]}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}
          />

          {/* content */}
          <View className="absolute left-6 right-6" style={{ bottom: 48 }}>
            <View
              className="flex-row items-center self-start rounded-full px-3 py-1.5 mb-2"
              style={{ backgroundColor: slide.badge.bgColor }}
            >
              <Icon size={12} color={slide.badge.color} />
              <Text
                className="ml-1 text-[10px] font-black uppercase"
                style={{ color: slide.badge.color, letterSpacing: 1 }}
              >
                {slide.badge.text}
              </Text>
            </View>

            <Text
              className="text-white font-black text-[28px] leading-[32px] mb-1"
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}
            >
              {slide.title}
            </Text>

            <Text className="text-white/85 text-[13px] leading-[18px] mb-4" style={{ maxWidth: "85%" }}>
              {slide.subtitle}
            </Text>

            <Pressable
              className="flex-row items-center self-start bg-white rounded-full px-5 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={() => handleSlideAction(slide)}
            >
              <Text className="text-black text-[12px] font-black uppercase mr-2" style={{ letterSpacing: 1 }}>
                {slide.cta}
              </Text>
              <ArrowRight size={14} color={COLORS.black} strokeWidth={3} />
            </Pressable>
          </View>
        </View>
      );
    },
    [handleSlideAction]
  );

  if (slides.length === 0) return null;

  return (
    <View
      className="relative mb-5"
      style={{
        height: BANNER_HEIGHT,
        width: SCREEN_WIDTH,
        marginLeft: -16, // full bleed
        backgroundColor: COLORS.systemBg,
      }}
    >
      <Carousel
        ref={carouselRef}
        width={SCREEN_WIDTH}
        height={BANNER_HEIGHT}
        data={slides}
        renderItem={renderSlide}
        loop
        autoPlay
        autoPlayInterval={TIMING.CAROUSEL_AUTO_SCROLL}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveIndex(index)}
        pagingEnabled
      />

      {/* nav arrows */}
      <Pressable className="absolute left-2 top-1/2 -mt-5 p-2" onPress={() => handleNavPress("left")}>
        <ChevronLeft size={32} color="rgba(255,255,255,0.6)" />
      </Pressable>
      <Pressable className="absolute right-2 top-1/2 -mt-5 p-2" onPress={() => handleNavPress("right")}>
        <ChevronRight size={32} color="rgba(255,255,255,0.6)" />
      </Pressable>

      {/* pagination */}
      <View className="absolute right-6 flex-col gap-1.5" style={{ bottom: 70 }}>
        {slides.map((_, index) => (
          <View
            key={index}
            className="w-[6px] rounded-full bg-white/30"
            style={{
              height: activeIndex === index ? 20 : 6,
              backgroundColor: activeIndex === index ? COLORS.acidGreen : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default HeroBanner;
