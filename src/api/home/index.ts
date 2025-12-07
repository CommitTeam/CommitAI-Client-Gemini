// Home API - Used by HomeScreen for feed and commitments
import { User, Commitment } from '@/types';
import { CommitmentStorage, VoteStorage } from '@/services/storage';
import { delay, generateId, logActivity } from '../common/utils';

export const createCommitment = async (
  user: User,
  workoutTitle: string,
  deadline: number
): Promise<Commitment> => {
  const commitment: Commitment = {
    id: generateId('c'),
    user,
    workoutTitle,
    deadline,
    votes: [],
  };

  const commitments = (await CommitmentStorage.loadAll()) || [];
  commitments.unshift(commitment);
  await CommitmentStorage.saveAll(commitments);

  await logActivity(user.id, 'CREATE_COMMITMENT', { workoutTitle });

  return commitment;
};

export const getFeed = async (currentUserId: string): Promise<Commitment[]> => {
  await delay(100);

  const commitments = (await CommitmentStorage.loadAll()) || [];
  const globalVotes = (await VoteStorage.loadAll()) || [];

  return commitments.map((c) => {
    const userVote = globalVotes.find(
      (v: any) => v.userId === currentUserId && v.targetId === c.id
    );
    return {
      ...c,
      currentUserVote: userVote?.type,
    };
  });
};
