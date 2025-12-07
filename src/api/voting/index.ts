// Voting API - Used across HomeScreen, LiveWorkoutScreen for voting
import { CoinTransaction, VoteResponse } from '@/types';
import { UserStorage, CommitmentStorage, VoteStorage } from '@/services/storage';
import { VOTE_CONFIG } from '@/constants';
import { generateId, logActivity } from '../common/utils';

export const placeVote = async (
  userId: string,
  commitmentId: string,
  type: 'back' | 'callout'
): Promise<VoteResponse> => {
  const users = (await UserStorage.loadAll()) || [];
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }

  const user = users[userIndex];
  const globalVotes = (await VoteStorage.loadAll()) || [];

  const existingVote = globalVotes.find(
    (v: any) => v.userId === userId && v.targetId === commitmentId
  );

  if (existingVote) {
    return {
      success: false,
      message: "You already voted! Move on. Boost someone else's ego!",
    };
  }

  if (user.coins < VOTE_CONFIG.COST) {
    return { success: false, message: 'Low Points. Recharge required.' };
  }

  const isLive = commitmentId.startsWith('l_');

  if (!isLive) {
    const commitments = (await CommitmentStorage.loadAll()) || [];
    const commIndex = commitments.findIndex((c) => c.id === commitmentId);

    if (commIndex === -1) {
      return { success: false, message: 'Commitment not found' };
    }

    commitments[commIndex].votes.push({ userId, type });
    await CommitmentStorage.saveAll(commitments);
  }

  user.coins -= VOTE_CONFIG.COST;
  const tx: CoinTransaction = {
    id: generateId('tx'),
    type: 'BET_PLACED',
    amount: -VOTE_CONFIG.COST,
    description: `Vote (${type.toUpperCase()}) on ${isLive ? 'Live Session' : 'User'}`,
    timestamp: Date.now(),
  };
  user.coinHistory.push(tx);

  users[userIndex] = user;
  await UserStorage.saveAll(users);
  await UserStorage.saveCurrent(user);

  globalVotes.push({
    userId,
    targetId: commitmentId,
    type,
    timestamp: Date.now(),
  });
  await VoteStorage.saveAll(globalVotes);

  await logActivity(userId, 'PLACE_BET', { commitmentId, type, isLive });

  return { success: true, message: 'Vote Placed!', updatedUser: user };
};
