// ============================================
// CommitAI Mobile - Main App Entry Point
// ============================================

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import RootNavigator from '@/navigation/RootNavigator';
import { runMigrations } from '@/services/storage';
import { seedDatabase } from '@/services/backend';
import { COLORS } from '@/constants';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Run database migrations
        await runMigrations();

        // Seed mock data if needed
        await seedDatabase();

        // Add any other initialization here
        // e.g., load fonts, check auth state, etc.

      } catch (e) {
        console.error('Initialization error:', e);
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.acidGreen} />
        <Text style={styles.loadingText}>Loading CommitAI...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.systemBg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.systemGray1,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.systemBg,
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.voteRed,
    textAlign: 'center',
  },
});
