// ============================================
// CommitAI Mobile - Trending Section Component
// Horizontal carousel or expanded grid of commitments
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Flame, ArrowRight, ArrowLeft } from 'lucide-react-native';

import { Commitment, User } from '@/types';
import { COLORS } from '@/constants';
import CommitmentCard from './CommitmentCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;

interface TrendingSectionProps {
  commitments: Commitment[];
  currentUser: User | null;
  onVote: (id: string, type: 'back' | 'callout') => void;
  onViewMore: () => void;
  isExpanded: boolean;
  onProfileClick?: (userId: string) => void;
  onGoLive?: (commitment: Commitment) => void;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
  commitments,
  currentUser,
  onVote,
  onViewMore,
  isExpanded,
  onProfileClick,
  onGoLive,
}) => {
  const handleViewMorePress = () => {
    Haptics.selectionAsync();
    onViewMore();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No Active Sparks</Text>
    </View>
  );

  const renderCommitmentCard = ({ item }: { item: Commitment }) => (
    <View style={isExpanded ? styles.expandedCard : styles.carouselCard}>
      <CommitmentCard
        commitment={item}
        currentUser={currentUser}
        onVote={onVote}
        onProfileClick={onProfileClick}
        onGoLive={onGoLive}
      />
    </View>
  );

  return (
    <View style={[styles.container, isExpanded && styles.containerExpanded]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>TRENDING</Text>
          <View style={styles.flameBadge}>
            <Flame size={16} color="#F97316" fill="#F97316" />
          </View>
        </View>

        <Pressable style={styles.viewMoreButton} onPress={handleViewMorePress}>
          {isExpanded ? (
            <>
              <ArrowLeft size={14} color={COLORS.systemGray1} />
              <Text style={styles.viewMoreText}>Back</Text>
            </>
          ) : (
            <>
              <Text style={styles.viewMoreText}>View All</Text>
              <ArrowRight size={14} color={COLORS.systemGray1} />
            </>
          )}
        </Pressable>
      </View>

      {/* Content */}
      {commitments.length === 0 ? (
        renderEmptyState()
      ) : isExpanded ? (
        // Expanded Grid View
        <FlatList
          data={commitments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommitmentCard}
          contentContainerStyle={styles.expandedList}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        // Horizontal Carousel View
        <FlatList
          data={commitments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommitmentCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselList}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          snapToAlignment="start"
        />
      )}
    </View>
  );
};

export default TrendingSection;

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  containerExpanded: {
    minHeight: '80%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  flameBadge: {
    backgroundColor: '#FED7AA',
    padding: 4,
    borderRadius: 12,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Empty State
  emptyContainer: {
    height: 160,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: COLORS.systemGray3,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.systemGray6,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Carousel
  carouselList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  carouselCard: {
    width: CARD_WIDTH,
    marginRight: 16,
  },

  // Expanded
  expandedList: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    gap: 16,
  },
  expandedCard: {
    width: '100%',
  },
});
