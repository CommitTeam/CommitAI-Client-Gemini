import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { User, Lock } from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';
import { loginUser } from '@/api/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const response = await loginUser(username, password);
      if (response.user.avatar) {
        navigation.replace('Main');
      } else {
        navigation.replace('AvatarSelection', { username: response.user.name });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSignUp = () => {
    Haptics.selectionAsync();
    navigation.navigate('SignUp');
  };

  const isSubmitDisabled = loading || !username.trim() || !password.trim();

  return (
    <AuthLayout>
      <View>
        <Text className="text-2xl font-black text-black mb-1 text-center">Welcome Back</Text>
        <Text className="text-sm text-gray-500 mb-6 text-center">Log in to continue your journey</Text>

        <AuthInput
          icon={User}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          isFocused={focusedInput === 'username'}
          onFocus={() => setFocusedInput('username')}
          onBlur={() => setFocusedInput(null)}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <AuthInput
          icon={Lock}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isFocused={focusedInput === 'password'}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
          secureTextEntry
        />

        <AuthButton
          title="Enter Arena"
          onPress={handleLogin}
          disabled={isSubmitDisabled}
          loading={loading}
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-sm text-gray-500">Don't have an account? </Text>
          <Pressable onPress={handleNavigateToSignUp}>
            <Text className="text-sm font-bold text-black underline">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
};

export default LoginScreen;
