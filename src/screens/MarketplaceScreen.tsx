// ============================================
// CommitAI Mobile - Marketplace Screen
// Store for skins, accessories, and rewards
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Zap,
  Check,
  Lock,
  ShoppingBag,
} from 'lucide-react-native';

import { RootStackParamList, User, StoreItem } from '@/types';
import { COLORS, STORE_CATALOG } from '@/constants';
import { getCurrentUser, purchaseItem, equipItem } from '@/services/backend';
import { getRarityColor } from '@/utils/helpers';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Marketplace'>;

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 56) / 2;

type CategoryType = 'all' | 'skins' | 'accessories' | 'effects' | 'giftcards';

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'skins', label: 'Skins' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'effects', label: 'Effects' },
  { id: 'giftcards', label: 'Gift Cards' },
];

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const handleCategoryChange = (category: CategoryType) => {
    Haptics.selectionAsync();
    setActiveCategory(category);
  };

  const handleItemPress = (item: StoreItem) => {
    Haptics.selectionAsync();
    setSelectedItem(item);
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!currentUser) return;

    if (currentUser.coins < item.price) {
      Alert.alert('Not Enough Points', 'Keep working out to earn more points!');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const result = await purchaseItem(currentUser.id, item.id);
    if (result.success && result.updatedUser) {
      setCurrentUser(result.updatedUser);
      Alert.alert('Purchase Complete!', `You now own ${item.name}!`);
      setSelectedItem(null);
    }
  };

  const handleEquip = async (item: StoreItem) => {
    if (!currentUser) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const result = await equipItem(currentUser.id, item.id);
    if (result.success && result.updatedUser) {
      setCurrentUser(result.updatedUser);
      Alert.alert('Equipped!', `${item.name} is now active!`);
      setSelectedItem(null);
    }
  };

  const isOwned = (itemId: string) => {
    return currentUser?.inventory?.includes(itemId) ?? false;
  };

  const isEquipped = (itemId: string) => {
    if (!currentUser?.equipped) return false;
    return Object.values(currentUser.equipped).includes(itemId);
  };

  const filteredItems =
    activeCategory === 'all'
      ? STORE_CATALOG
      : STORE_CATALOG.filter((item) => item.category === activeCategory);

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return ['#FFD700', '#FFA500'];
      case 'epic':
        return ['#9333EA', '#7C3AED'];
      case 'rare':
        return ['#3B82F6', '#2563EB'];
      default:
        return [COLORS.systemGray5, COLORS.systemGray4];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <ShoppingBag size={24} color={COLORS.black} />
            <Text style={styles.title}>STORE</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.coinBalance}>
              <Text style={styles.coinAmount}>{currentUser?.coins || 0}</Text>
              <Zap size={16} color={COLORS.black} fill={COLORS.black} />
            </View>
            <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
              <X size={20} color={COLORS.systemGray1} />
            </Pressable>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryPill,
                activeCategory === cat.id && styles.categoryPillActive,
              ]}
              onPress={() => handleCategoryChange(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {filteredItems.map((item) => {
            const owned = isOwned(item.id);
            const equipped = isEquipped(item.id);

            return (
              <Pressable
                key={item.id}
                style={styles.itemCard}
                onPress={() => handleItemPress(item)}
              >
                <LinearGradient
                  colors={getRarityBg(item.rarity)}
                  style={styles.itemImageContainer}
                >
                  <Text style={styles.itemEmoji}>{item.preview}</Text>
                  
                  {owned && (
                    <View style={styles.ownedBadge}>
                      <Check size={12} color={COLORS.white} />
                    </View>
                  )}
                  
                  {equipped && (
                    <View style={styles.equippedBadge}>
                      <Text style={styles.equippedText}>ACTIVE</Text>
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.itemPrice}>
                    <Zap size={12} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
                    <Text style={styles.itemPriceText}>{item.price}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.rarityTag,
                    { backgroundColor: getRarityColor(item.rarity) },
                  ]}
                >
                  <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Item Detail Modal */}
      {selectedItem && (
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setSelectedItem(null)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <LinearGradient
              colors={getRarityBg(selectedItem.rarity)}
              style={styles.modalImageContainer}
            >
              <Text style={styles.modalEmoji}>{selectedItem.preview}</Text>
            </LinearGradient>

            <Text style={styles.modalName}>{selectedItem.name}</Text>
            <Text style={styles.modalDescription}>{selectedItem.description}</Text>

            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>RARITY</Text>
                <Text
                  style={[
                    styles.modalStatValue,
                    { color: getRarityColor(selectedItem.rarity) },
                  ]}
                >
                  {selectedItem.rarity.toUpperCase()}
                </Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatLabel}>PRICE</Text>
                <View style={styles.modalPrice}>
                  <Zap size={16} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
                  <Text style={styles.modalStatValue}>{selectedItem.price}</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              {isOwned(selectedItem.id) ? (
                <Pressable
                  style={[
                    styles.actionButton,
                    isEquipped(selectedItem.id) && styles.actionButtonDisabled,
                  ]}
                  onPress={() => handleEquip(selectedItem)}
                  disabled={isEquipped(selectedItem.id)}
                >
                  <Text style={styles.actionButtonText}>
                    {isEquipped(selectedItem.id) ? 'EQUIPPED' : 'EQUIP'}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[
                    styles.actionButton,
                    currentUser && currentUser.coins < selectedItem.price && styles.actionButtonDisabled,
                  ]}
                  onPress={() => handlePurchase(selectedItem)}
                  disabled={currentUser ? currentUser.coins < selectedItem.price : true}
                >
                  {currentUser && currentUser.coins < selectedItem.price ? (
                    <>
                      <Lock size={18} color={COLORS.white} />
                      <Text style={styles.actionButtonText}>NOT ENOUGH</Text>
                    </>
                  ) : (
                    <>
                      <Zap size={18} color={COLORS.black} fill={COLORS.black} />
                      <Text style={[styles.actionButtonText, { color: COLORS.black }]}>
                        BUY FOR {selectedItem.price}
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MarketplaceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.systemGray5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.systemGray6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  coinAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Categories
  categoriesContainer: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.systemGray6,
  },
  categoryPillActive: {
    backgroundColor: COLORS.black,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.systemGray1,
  },
  categoryTextActive: {
    color: COLORS.white,
  },

  // Grid
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  itemCard: {
    width: CARD_SIZE,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemEmoji: {
    fontSize: 64,
  },
  ownedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.acidGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equippedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  equippedText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.acidGreen,
    letterSpacing: 0.5,
  },
  itemInfo: {
    padding: 12,
    gap: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
  },
  rarityTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: {
    width: 48,
    height: 5,
    backgroundColor: COLORS.systemGray4,
    borderRadius: 3,
    marginBottom: 20,
  },
  modalImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 80,
  },
  modalName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.systemGray1,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 280,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.systemGray1,
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },
  modalPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalActions: {
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.acidGreen,
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  actionButtonDisabled: {
    backgroundColor: COLORS.systemGray3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 1,
  },
});
