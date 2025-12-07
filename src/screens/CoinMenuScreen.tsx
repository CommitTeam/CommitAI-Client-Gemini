// ============================================
// CommitAI Mobile - Coin Menu Screen
// Points balance and transaction history
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  X,
  Zap,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Vote,
  Gift,
  ShoppingBag,
  Award,
} from 'lucide-react-native';

import { RootStackParamList, User, Transaction } from '@/types';
import { COLORS } from '@/constants';
import { getCurrentUser } from '@/services/backend';
import { TransactionStorage } from '@/services/storage';
import { formatRelativeTime, formatCoins } from '@/utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CoinMenu'>;

const CoinMenuScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);

    const allTransactions = await TransactionStorage.getAll();
    // Filter to current user's transactions and sort by date
    const userTransactions = allTransactions
      .filter((t) => t.userId === user?.id)
      .sort((a, b) => b.timestamp - a.timestamp);
    setTransactions(userTransactions);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'workout':
        return <Dumbbell size={18} color={COLORS.acidGreen} />;
      case 'vote_placed':
        return <Vote size={18} color={COLORS.voteRed} />;
      case 'vote_won':
        return <Award size={18} color={COLORS.acidGreen} />;
      case 'purchase':
        return <ShoppingBag size={18} color={COLORS.punchBlue} />;
      case 'reward':
        return <Gift size={18} color={COLORS.voteOrange} />;
      default:
        return <Zap size={18} color={COLORS.systemGray1} />;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPositive = item.amount > 0;

    return (
      <View style={styles.transactionRow}>
        <View style={styles.transactionIcon}>
          {getTransactionIcon(item.type)}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{item.description}</Text>
          <Text style={styles.transactionTime}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              isPositive ? styles.amountPositive : styles.amountNegative,
            ]}
          >
            {isPositive ? '+' : ''}{item.amount}
          </Text>
          <Zap
            size={12}
            color={isPositive ? COLORS.acidGreen : COLORS.voteRed}
            fill={isPositive ? COLORS.acidGreen : COLORS.voteRed}
          />
        </View>
      </View>
    );
  };

  // Calculate stats
  const totalEarned = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>POINTS</Text>
        <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
          <X size={20} color={COLORS.systemGray1} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[COLORS.black, '#1c1c1e']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.balanceGlow} />
          
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {formatCoins(currentUser?.coins || 0)}
            </Text>
            <Zap size={36} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <TrendingUp size={14} color={COLORS.acidGreen} />
              </View>
              <View>
                <Text style={styles.statValue}>{formatCoins(totalEarned)}</Text>
                <Text style={styles.statLabel}>Earned</Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <TrendingDown size={14} color={COLORS.voteRed} />
              </View>
              <View>
                <Text style={styles.statValue}>{formatCoins(totalSpent)}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Earn More Card */}
        <Pressable
          style={styles.earnCard}
          onPress={() => {
            Haptics.selectionAsync();
            navigation.goBack();
          }}
        >
          <View style={styles.earnIcon}>
            <Dumbbell size={24} color={COLORS.black} />
          </View>
          <View style={styles.earnContent}>
            <Text style={styles.earnTitle}>Earn More Points</Text>
            <Text style={styles.earnSubtitle}>
              Complete workouts, win bets, maintain streaks
            </Text>
          </View>
        </Pressable>

        {/* Transaction History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>HISTORY</Text>
          
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Zap size={48} color={COLORS.systemGray3} />
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>
                Start working out to earn points!
              </Text>
            </View>
          ) : (
            <View style={styles.transactionList}>
              {transactions.map((transaction) => (
                <View key={transaction.id}>
                  {renderTransaction({ item: transaction })}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CoinMenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  balanceGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: COLORS.acidGreen,
    borderRadius: 100,
    opacity: 0.15,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
  },

  // Earn Card
  earnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.acidGreen,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  earnIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earnContent: {
    flex: 1,
  },
  earnTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 2,
  },
  earnSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },

  // History
  historySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  transactionList: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.systemGray6,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: COLORS.systemGray1,
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  amountPositive: {
    color: COLORS.acidGreen,
  },
  amountNegative: {
    color: COLORS.voteRed,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: COLORS.white,
    borderRadius: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.systemGray1,
  },
});
