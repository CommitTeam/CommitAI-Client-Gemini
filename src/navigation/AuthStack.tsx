// ============================================
// CommitAI Mobile - Auth Stack Navigator
// Handles login and avatar selection flow
// ============================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthStackParamList } from './AuthStackParamList';
import { COLORS } from '@/constants';
import { LoginScreen, SignUpScreen, OTPVerificationScreen, AvatarSelectionScreen } from '@/screens';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: COLORS.systemBg },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AvatarSelection"
        component={AvatarSelectionScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
