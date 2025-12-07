// ============================================
// CommitAI Mobile - Profile Screen
// User profile with stats, settings, and mascot
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Zap,
  Flame,
  Trophy,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  Moon,
  HelpCircle,
  MessageSquare,
  Shield,
  Trash2,
} from 'lucide-react-native';

import { RootStackParamList, User } from '@/types';
import { COLORS } from '@/constants';
import { getCurrentUser, logout, deleteUser } from '@/services/backend';
import { BrutalistButton } from '@/components/ui';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (currentUser) {
              await deleteUser(currentUser.id);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            }
          },
        },
      ]
    );
  };

  const handleMarketplace = () => {
    Haptics.selectionAsync();
    navigation.navigate('Marketplace');
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUrl =
    currentUser.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{currentUser.level}</Text>
            </View>
          </View>
          <Text style={styles.userName}>{currentUser.name}</Text>
          {currentUser.gym && (
            <Text style={styles.gymName}>{currentUser.gym.name}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Zap size={24} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
            <Text style={styles.statValue}>{currentUser.coins}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <Flame size={24} color={COLORS.voteOrange} fill={COLORS.voteOrange} />
            <Text style={styles.statValue}>{currentUser.stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Trophy size={24} color={COLORS.punchBlue} />
            <Text style={styles.statValue}>{currentUser.stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
        </View>

        {/* Marketplace Button */}
        <Pressable style={styles.marketplaceCard} onPress={handleMarketplace}>
          <View style={styles.marketplaceContent}>
            <Text style={styles.marketplaceTitle}>🛍️ Marketplace</Text>
            <Text style={styles.marketplaceSubtitle}>
              Unlock skins, effects & rewards
            </Text>
          </View>
          <ChevronRight size={24} color={COLORS.systemGray1} />
        </Pressable>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Bell size={20} color={COLORS.black} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.systemGray4, true: COLORS.acidGreen }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Moon size={20} color={COLORS.black} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.systemGray4, true: COLORS.acidGreen }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <View style={styles.settingsCard}>
            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color={COLORS.black} />
                <Text style={styles.settingLabel}>Help & FAQ</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>

            <View style={styles.settingDivider} />

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MessageSquare size={20} color={COLORS.black} />
                <Text style={styles.settingLabel}>Send Feedback</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>

            <View style={styles.settingDivider} />

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Shield size={20} color={COLORS.black} />
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={COLORS.systemGray2} />
            </Pressable>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.dangerCard}>
            <Pressable style={styles.dangerRow} onPress={handleLogout}>
              <LogOut size={20} color={COLORS.voteRed} />
              <Text style={styles.dangerLabel}>Log Out</Text>
            </Pressable>

            <View style={styles.settingDivider} />

            <Pressable style={styles.dangerRow} onPress={handleDeleteAccount}>
              <Trash2 size={20} color={COLORS.voteRed} />
              <Text style={styles.dangerLabel}>Delete Account</Text>
            </Pressable>
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>CommitAI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.systemBg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 16, color: COLORS.systemGray1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  // Header
  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.systemGray6 },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.black,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.systemBg,
  },
  levelText: { fontSize: 14, fontWeight: '900', color: COLORS.acidGreen },
  userName: { fontSize: 28, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  gymName: { fontSize: 14, fontWeight: '600', color: COLORS.systemGray1 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '900', color: COLORS.black, marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.systemGray1, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Marketplace
  marketplaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  marketplaceContent: { flex: 1 },
  marketplaceTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 4 },
  marketplaceSubtitle: { fontSize: 13, color: COLORS.systemGray1 },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.systemGray1, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: '600', color: COLORS.black },
  settingDivider: { height: 1, backgroundColor: COLORS.systemGray5, marginLeft: 52 },

  // Danger
  dangerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.2)',
  },
  dangerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  dangerLabel: { fontSize: 16, fontWeight: '600', color: COLORS.voteRed },

  // Version
  version: { textAlign: 'center', fontSize: 12, color: COLORS.systemGray2, marginTop: 20 },
});
