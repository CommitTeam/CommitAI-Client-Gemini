// ============================================
// CommitAI Mobile - Constants & Configuration
// ============================================

import { Gym, StoreItem, WorkoutType } from '@/types';

// ---------- App Configuration ----------

export const APP_CONFIG = {
  name: 'CommitAI',
  version: '1.0.0',
  tagline: 'You v/s Who?',
};

// ---------- Colors (matches Tailwind config) ----------

export const COLORS = {
  // Brand
  acidGreen: '#FFEE32',
  hotPink: '#ff00ff',
  safetyOrange: '#ff5f00',
  punchBlue: '#0033ff',
  offWhite: '#f8f8f8',
  
  // Voting
  voteRed: '#b91c1c',
  voteOrange: '#FF6B00',
  voteIce: '#60A5FA',
  
  // System (iOS-inspired)
  systemGray1: '#8e8e93',
  systemGray2: '#aeaeb2',
  systemGray3: '#c7c7cc',
  systemGray4: '#d1d1d6',
  systemGray5: '#e5e5ea',
  systemGray6: '#f2f2f7',
  systemBg: '#f2f2f7',
  
  // Basic
  black: '#000000',
  white: '#ffffff',
  transparent: 'transparent',
} as const;

// ---------- Workout Configuration ----------

export const WORKOUT_TYPES: WorkoutType[] = [
  'Pushups',
  'Squats',
  'Jumping Jacks',
  'Steps',
  'Distance Walk',
  'Calories',
];

export const WORKOUT_TARGETS: Record<WorkoutType, string[]> = {
  'Pushups': ['10', '20', '30', '50', '100', '200'],
  'Squats': ['15', '30', '50', '100', '300'],
  'Jumping Jacks': ['50', '100', '200', '500'],
  'Steps': ['1000', '3000', '5000', '10000'],
  'Distance Walk': ['1km', '3km', '5km', '10km'],
  'Calories': ['100', '300', '500', '1000'],
};

export const WORKOUT_TIMES = ['10 mins', '20 mins', '30 mins', '1 hour', '2 hours'];

// ---------- Level System ----------

export const LEVEL_MILESTONES = [
  {
    level: 1,
    requirements: {
      Pushups: 0,
      Squats: 0,
      'Jumping Jacks': 0,
      Steps: 0,
      'Distance Walk': 0,
      Calories: 0,
    },
  },
  {
    level: 2,
    requirements: {
      Pushups: 100,
      Squats: 100,
      'Jumping Jacks': 200,
      Steps: 5000,
      'Distance Walk': 5,
      Calories: 500,
    },
  },
  // Add more levels as needed
];

// ---------- Mock Data ----------

export const MOCK_NAMES = [
  'Mike', 'Viper', 'Nova', 'Titan', 'Jinx', 'Rogue', 'Axel', 'Echo',
  'Blaze', 'Fury', 'Zen', 'Kilo', 'Jazz', 'Pixel', 'Ghost', 'Luna',
  'Rex', 'Tank', 'Neo', 'Cypher', 'Orbit',
];

export const MOCK_GYMS: Gym[] = [
  { id: 'gym_home', name: 'Home Gym / Garage', isPartner: false, memberCount: 1205 },
  { id: 'gym_golds', name: "Gold's Gym", location: 'Venice Beach, CA', isPartner: true, memberCount: 842 },
  { id: 'gym_pf', name: 'Planet Fitness', location: 'Global', isPartner: false, memberCount: 3200 },
  { id: 'gym_crossfit', name: 'CrossFit Central', location: 'Austin, TX', isPartner: true, memberCount: 156 },
  { id: 'gym_equinox', name: 'Equinox', location: 'New York, NY', isPartner: false, memberCount: 430 },
  { id: 'gym_la', name: 'LA Fitness', location: 'Los Angeles, CA', isPartner: false, memberCount: 950 },
  { id: 'gym_anytime', name: 'Anytime Fitness', location: 'Chicago, IL', isPartner: false, memberCount: 620 },
  { id: 'gym_metro', name: 'Metroflex', location: 'Arlington, TX', isPartner: true, memberCount: 210 },
];

export const SCENIC_IMAGES = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
  'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&q=80',
  'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  'https://images.unsplash.com/photo-1599552683573-9dc48255b7ef?w=800&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80',
];

// ---------- Store Catalog ----------

export const STORE_CATALOG: StoreItem[] = [
  // SKINS
  { id: 'skin_default', type: 'skin', name: 'Original Blob', description: 'The classic look.', price: 0, rarity: 'common', icon: '🟡', visualAsset: 'from-acid-green to-yellow-400' },
  { id: 'skin_fire', type: 'skin', name: 'Inferno', description: 'Hot to the touch.', price: 500, rarity: 'rare', icon: '🔥', visualAsset: 'from-orange-500 to-red-600' },
  { id: 'skin_ice', type: 'skin', name: 'Zero Kelvin', description: 'Stay frosty.', price: 500, rarity: 'rare', icon: '❄️', visualAsset: 'from-cyan-300 to-blue-500' },
  { id: 'skin_cyber', type: 'skin', name: 'Cyberpunk', description: 'Neon lights included.', price: 1200, rarity: 'epic', icon: '🤖', visualAsset: 'from-purple-500 to-pink-500' },
  { id: 'skin_shadow', type: 'skin', name: 'Shadow Ops', description: 'Stealth mode.', price: 2000, rarity: 'legendary', icon: '🥷', visualAsset: 'from-gray-800 to-black' },
  { id: 'skin_gold', type: 'skin', name: 'Golden God', description: 'Pure luxury.', price: 5000, rarity: 'legendary', icon: '🏆', visualAsset: 'from-yellow-200 via-yellow-400 to-yellow-600' },
  
  // ACCESSORIES
  { id: 'acc_shades', type: 'accessory', name: 'Cool Shades', description: 'Block out the haters.', price: 250, rarity: 'common', icon: '🕶️', visualAsset: 'sunglasses' },
  { id: 'acc_cap', type: 'accessory', name: 'Gym Cap', description: 'Bad hair day saver.', price: 300, rarity: 'common', icon: '🧢', visualAsset: 'cap' },
  { id: 'acc_crown', type: 'accessory', name: "King's Crown", description: 'For the royalty.', price: 5000, rarity: 'legendary', icon: '👑', visualAsset: 'crown' },
  
  // EFFECTS
  { id: 'fx_sparkle', type: 'effect', name: 'Sparkles', description: 'Shine bright.', price: 800, rarity: 'epic', icon: '✨', visualAsset: 'sparkle' },
  { id: 'fx_fire', type: 'effect', name: 'Flame Trail', description: 'Leave them in the dust.', price: 1500, rarity: 'legendary', icon: '☄️', visualAsset: 'fire_trail' },
  
  // GIFT CARDS
  { id: 'card_starbucks_50', type: 'gift_card', name: '$50 Starbucks', description: 'Fuel your caffeine addiction.', price: 10000, rarity: 'epic', icon: '☕', visualAsset: 'card_starbucks' },
  { id: 'card_amazon_50', type: 'gift_card', name: '$50 Amazon', description: 'Buy whatever you want.', price: 12000, rarity: 'epic', icon: '📦', visualAsset: 'card_amazon' },
];

// ---------- Storage Keys ----------

export const STORAGE_KEYS = {
  USERS: 'db_users',
  COMMITMENTS: 'db_commitments',
  VOTES: 'db_votes',
  TRANSACTIONS: 'db_transactions',
  LOGS: 'db_activity_logs',
  CURRENT_USER: 'current_user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

// ---------- API Configuration ----------

export const API_CONFIG = {
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_TTS_MODEL: 'gemini-2.5-flash-preview-tts',
} as const;

// ---------- Timing Configuration ----------

export const TIMING = {
  FEED_REFRESH_INTERVAL: 5000, // 5 seconds
  CAROUSEL_AUTO_SCROLL: 3000, // 3 seconds
  TOAST_DURATION: 3000, // 3 seconds
  DEBOUNCE_DELAY: 300, // 300ms
} as const;

// ---------- Vote Configuration ----------

export const VOTE_CONFIG = {
  COST: 50, // coins per vote
  WIN_REWARD: 60, // coins on correct vote
} as const;

// ---------- Animation Configuration ----------

export const ANIMATIONS = {
  SPRING: {
    damping: 15,
    stiffness: 150,
  },
  TIMING: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
} as const;
