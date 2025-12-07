// ============================================
// CommitAI Mobile - Storage Service
// AsyncStorage wrapper for persistent data
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';

// ---------- Generic Storage Operations ----------

/**
 * Save data to AsyncStorage
 */
export const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Load data from AsyncStorage
 */
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 */
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Clear all app data
 */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Get all keys in storage
 */
export const getAllKeys = async (): Promise<string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

// ---------- Typed Storage Helpers ----------

import { User, Commitment, Vote, CoinTransaction, ActivityLog } from '@/types';

/**
 * User Storage
 */
export const UserStorage = {
  saveAll: async (users: User[]) => saveData(STORAGE_KEYS.USERS, users),
  loadAll: async () => loadData<User[]>(STORAGE_KEYS.USERS),
  
  saveCurrent: async (user: User) => saveData(STORAGE_KEYS.CURRENT_USER, user),
  loadCurrent: async () => loadData<User>(STORAGE_KEYS.CURRENT_USER),
  clearCurrent: async () => removeData(STORAGE_KEYS.CURRENT_USER),
};

/**
 * Commitment Storage
 */
export const CommitmentStorage = {
  saveAll: async (commitments: Commitment[]) => 
    saveData(STORAGE_KEYS.COMMITMENTS, commitments),
  loadAll: async () => loadData<Commitment[]>(STORAGE_KEYS.COMMITMENTS),
};

/**
 * Vote Storage
 */
export const VoteStorage = {
  saveAll: async (votes: Vote[]) => saveData(STORAGE_KEYS.VOTES, votes),
  loadAll: async () => loadData<Vote[]>(STORAGE_KEYS.VOTES),
};

/**
 * Transaction Storage
 */
export const TransactionStorage = {
  saveAll: async (transactions: CoinTransaction[]) => 
    saveData(STORAGE_KEYS.TRANSACTIONS, transactions),
  loadAll: async () => loadData<CoinTransaction[]>(STORAGE_KEYS.TRANSACTIONS),
};

/**
 * Activity Log Storage
 */
export const LogStorage = {
  saveAll: async (logs: ActivityLog[]) => saveData(STORAGE_KEYS.LOGS, logs),
  loadAll: async () => loadData<ActivityLog[]>(STORAGE_KEYS.LOGS),
};

/**
 * Onboarding Status
 */
export const OnboardingStorage = {
  setComplete: async () => saveData(STORAGE_KEYS.ONBOARDING_COMPLETE, true),
  isComplete: async () => {
    const result = await loadData<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return result === true;
  },
  reset: async () => removeData(STORAGE_KEYS.ONBOARDING_COMPLETE),
};

// ---------- Migration Helper ----------

/**
 * Check and run any necessary data migrations
 */
export const runMigrations = async (): Promise<void> => {
  // Version check and migrations can be added here
  // For now, just ensure basic structure exists
  const users = await UserStorage.loadAll();
  if (users === null) {
    await UserStorage.saveAll([]);
  }

  const commitments = await CommitmentStorage.loadAll();
  if (commitments === null) {
    await CommitmentStorage.saveAll([]);
  }

  const votes = await VoteStorage.loadAll();
  if (votes === null) {
    await VoteStorage.saveAll([]);
  }

  const logs = await LogStorage.loadAll();
  if (logs === null) {
    await LogStorage.saveAll([]);
  }
};

export default {
  saveData,
  loadData,
  removeData,
  clearAllData,
  getAllKeys,
  UserStorage,
  CommitmentStorage,
  VoteStorage,
  TransactionStorage,
  LogStorage,
  OnboardingStorage,
  runMigrations,
};
