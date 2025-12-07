// ============================================
// CommitAI Mobile - Commitment Card Component
// Card showing a user's workout commitment
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Zap, Flame, Snowflake } from 'lucide-react-native';

import { Commitment, User } from '@/types';
import { COLORS } from '@/constants';
import { GlassCard } from '@/components/ui';

interface CommitmentCardProps {
  commitment: Commitment;
  currentUser: User | null;
  onVote: (id: string, type: 'back' | 'callout') => void;
  onProfileClick?: (userId: string) => void;
  onGoLive?: (commitment: Commitment) => void;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  commitment,
  currentUser,
  onVote,
  onProfileClick,
  onGoLive,
}) => {
  const isOwn = currentUser && currentUser.id === commitment.user.id;
  const avatarUrl =
    commitment.user.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${commitment.user.name}`;

  const handleVote = (type: 'back' | 'callout') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onVote(commitment.id, type);
  };

  const handleGoLive = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onGoLive?.(commitment);
  };

  const handleProfileClick = () => {
    Haptics.selectionAsync();
    onProfileClick?.(commitment.user.id);
  };

  return (
    <View style={styles.container}>
      {/* User Header */}
      <View style={styles.header}>
        <Pressable style={styles.userInfo} onPress={handleProfileClick}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{commitment.user.name}</Text>
            <Text style={styles.userLevel}>LVL {commitment.user.level}</Text>
          </View>
        </Pressable>

        <View style={styles.streakBadge}>
          <Zap size={10} color={COLORS.voteOrange} fill={COLORS.voteOrange} />
          <Text style={styles.streakText}>
            {commitment.user.stats.currentStreak}
          </Text>
        </View>
      </View>

      {/* Workout Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {commitment.workoutTitle}
        </Text>
      </View>

      {/* Actions */}
      {isOwn ? (
        <Pressable style={styles.goLiveButton} onPress={handleGoLive}>
          <Zap size={16} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
          <Text style={styles.goLiveText}>GO LIVE NOW</Text>
        </Pressable>
      ) : (
        <View style={styles.voteButtons}>
          {/* NO Button (Callout) */}
          <Pressable
            style={[
              styles.voteButton,
              commitment.currentUserVote === 'callout' && styles.voteButtonCalloutActive,
              commitment.currentUserVote &&
                commitment.currentUserVote !== 'callout' &&
                styles.voteButtonDisabled,
            ]}
            onPress={() => handleVote('callout')}
            disabled={!!commitment.currentUserVote}
          >
            <Snowflake
              size={16}
              color={
                commitment.currentUserVote === 'callout'
                  ? COLORS.white
                  : COLORS.systemGray1
              }
              fill={
                commitment.currentUserVote === 'callout'
                  ? COLORS.white
                  : COLORS.systemGray2
              }
            />
            <Text
              style={[
                styles.voteButtonText,
                commitment.currentUserVote === 'callout' &&
                  styles.voteButtonTextActive,
              ]}
            >
              NO
            </Text>
          </Pressable>

          {/* YO Button (Back) */}
          <Pressable
            style={[
              styles.voteButton,
              commitment.currentUserVote === 'back' && styles.voteButtonBackActive,
              commitment.currentUserVote &&
                commitment.currentUserVote !== 'back' &&
                styles.voteButtonDisabled,
            ]}
            onPress={() => handleVote('back')}
            disabled={!!commitment.currentUserVote}
          >
            <Flame
              size={16}
              color={
                commitment.currentUserVote === 'back'
                  ? COLORS.black
                  : COLORS.systemGray1
              }
              fill={
                commitment.currentUserVote === 'back'
                  ? COLORS.black
                  : COLORS.systemGray2
              }
            />
            <Text
              style={[
                styles.voteButtonText,
                commitment.currentUserVote === 'back' &&
                  styles.voteButtonTextBackActive,
              ]}
            >
              YO
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default CommitmentCard;

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 32,
    padding: 20,
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.systemGray6,
  },
  userName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.black,
  },
  userLevel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.systemGray6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.systemGray1,
  },

  // Title
  titleContainer: {
    flex: 1,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.black,
    lineHeight: 22,
    letterSpacing: -0.5,
  },

  // Go Live Button
  goLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  goLiveText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Vote Buttons
  voteButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.systemGray6,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  voteButtonCalloutActive: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voteButtonBackActive: {
    backgroundColor: COLORS.acidGreen,
    shadowColor: COLORS.acidGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  voteButtonDisabled: {
    opacity: 0.3,
  },
  voteButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  voteButtonTextActive: {
    color: COLORS.white,
  },
  voteButtonTextBackActive: {
    color: COLORS.black,
  },
});
