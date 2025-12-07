// Common utilities used across API modules
import { LogStorage } from '@/services/storage';

export const generateId = (prefix: string = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const logActivity = async (
  userId: string,
  actionType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> => {
  const logs = (await LogStorage.loadAll()) || [];
  const newLog = {
    id: generateId('log'),
    userId,
    actionType,
    metadata,
    timestamp: Date.now(),
  };
  logs.push(newLog);
  await LogStorage.saveAll(logs);
};

export const getTimeSpent = async (userId: string): Promise<number> => {
  const logs = (await LogStorage.loadAll()) || [];
  const userLogs = logs.filter((l: any) => l.userId === userId);
  return userLogs.length * 5; // Mock: 5 mins per action
};
