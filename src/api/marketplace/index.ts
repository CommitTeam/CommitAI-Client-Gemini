// Marketplace API - Used by MarketplaceScreen
import { User, CoinTransaction } from '@/types';
import { UserStorage } from '@/services/storage';
import { STORE_CATALOG } from '@/constants';
import { generateId } from '../common/utils';

export const purchaseItem = async (
  userId: string,
  itemId: string
): Promise<{ success: boolean; message: string; updatedUser?: User }> => {
  const item = STORE_CATALOG.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, message: 'Item not found' };
  }

  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }

  const user = users[userIndex];

  if (user.inventory.includes(itemId)) {
    return { success: false, message: 'Already owned!' };
  }

  if (user.coins < item.price) {
    return { success: false, message: 'Not enough coins!' };
  }

  user.coins -= item.price;
  user.inventory.push(itemId);

  const tx: CoinTransaction = {
    id: generateId('tx'),
    type: 'STORE_PURCHASE',
    amount: -item.price,
    description: `Purchased ${item.name}`,
    timestamp: Date.now(),
  };
  user.coinHistory.push(tx);

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  return { success: true, message: 'Purchase successful!', updatedUser: user };
};

export const equipItem = async (
  userId: string,
  itemId: string
): Promise<User | null> => {
  const item = STORE_CATALOG.find((i) => i.id === itemId);
  if (!item) return null;

  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return null;

  const user = users[userIndex];

  if (!user.inventory.includes(itemId)) return null;

  if (item.type === 'skin') {
    user.equipped.skin = itemId;
  } else if (item.type === 'accessory') {
    user.equipped.accessory = itemId;
  } else if (item.type === 'effect') {
    user.equipped.effect = itemId;
  }

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  return user;
};
