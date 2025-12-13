// ============================================
// CommitAI Mobile - Main App Entry Point
// ============================================

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, Text, ActivityIndicator, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';

import RootNavigator from '@/navigation/RootNavigator';
import { runMigrations } from '@/services/storage';
import { seedDatabase } from '@/services/backend';
import { COLORS, FONTS } from '@/constants';
import { store } from '@/store/store';

SplashScreen.preventAutoHideAsync();


export default function App() {

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
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
    fontFamily: FONTS.semibold,
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
    fontFamily: FONTS.extrabold,
    color: COLORS.black,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.voteRed,
    textAlign: 'center',
  },
});
