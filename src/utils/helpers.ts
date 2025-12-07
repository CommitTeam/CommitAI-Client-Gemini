// ============================================
// CommitAI Mobile - General Utilities
// ============================================

import { Dimensions, Platform } from 'react-native';

// ---------- Device Info ----------

export const SCREEN = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// ---------- Formatting ----------

/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format coins with K/M suffix
 */
export const formatCoins = (coins: number): string => {
  if (coins >= 1000000) {
    return `${(coins / 1000000).toFixed(1)}M`;
  }
  if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}K`;
  }
  return coins.toString();
};

/**
 * Format time in mm:ss
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format relative time (e.g., "2h ago", "just now")
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

/**
 * Format date for display
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// ---------- Validation ----------

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate username (alphanumeric, 3-20 chars)
 */
export const isValidUsername = (username: string): boolean => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

// ---------- Random Helpers ----------

/**
 * Get random item from array
 */
export const getRandomItem = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Generate random ID
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Shuffle array
 */
export const shuffleArray = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ---------- Async Helpers ----------

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  waitMs: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitMs);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limitMs: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
};

// ---------- Color Helpers ----------

/**
 * Adjust color opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Assumes hex color
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

/**
 * Get rarity color
 */
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'rare': return '#3B82F6';
    case 'epic': return '#8B5CF6';
    case 'legendary': return '#F59E0B';
    default: return '#9CA3AF';
  }
};

// ---------- Workout Helpers ----------

/**
 * Parse workout target from string
 */
export const parseWorkoutTarget = (target: string): number => {
  const num = parseInt(target.replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
};

/**
 * Parse duration string to seconds
 */
export const parseDurationToSeconds = (duration: string): number => {
  const lower = duration.toLowerCase();
  
  if (lower.includes('hour')) {
    const hours = parseInt(duration, 10) || 1;
    return hours * 3600;
  }
  if (lower.includes('min')) {
    const mins = parseInt(duration, 10) || 1;
    return mins * 60;
  }
  if (lower.includes('sec')) {
    return parseInt(duration, 10) || 30;
  }
  
  // Default: assume minutes
  const mins = parseInt(duration, 10) || 1;
  return mins * 60;
};

/**
 * Calculate workout progress percentage
 */
export const calculateProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
};

// ---------- Export All ----------

export default {
  SCREEN,
  isIOS,
  isAndroid,
  formatNumber,
  formatCoins,
  formatTime,
  formatRelativeTime,
  formatDate,
  isValidEmail,
  isValidUsername,
  getRandomItem,
  generateId,
  shuffleArray,
  delay,
  debounce,
  throttle,
  withOpacity,
  getRarityColor,
  parseWorkoutTarget,
  parseDurationToSeconds,
  calculateProgress,
};
