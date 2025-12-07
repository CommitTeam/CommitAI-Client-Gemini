// Profile API - Used by ProfileScreen, PublicProfileScreen, AvatarSelectionScreen
import { User } from '@/types';
import { UserStorage } from '@/services/storage';
import { delay } from '../common/utils';

export const updateUserAvatar = async (
  userId: string,
  avatarUrl: string
): Promise<User | null> => {
  await delay(200);

  const users = (await UserStorage.loadAll()) || [];
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return null;

  users[index].avatar = avatarUrl;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(users[index]);

  return users[index];
};

export const updateUser = async (user: User): Promise<User> => {
  const users = (await UserStorage.loadAll()) || [];
  const index = users.findIndex((u) => u.id === user.id);

  if (index !== -1) {
    users[index] = user;
    await UserStorage.saveAll(users);
  }

  await UserStorage.saveCurrent(user);
  return user;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const users = (await UserStorage.loadAll()) || [];
  const filtered = users.filter((u) => u.id !== userId);
  await UserStorage.saveAll(filtered);
  await UserStorage.clearCurrent();
  return true;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const users = (await UserStorage.loadAll()) || [];
  return users.find((u) => u.id === userId) || null;
};

export const sendFeedback = async (
  userId: string,
  message: string
): Promise<boolean> => {
  await delay(500);
  console.log(`[FEEDBACK] User ${userId}: ${message}`);
  return true;
};
