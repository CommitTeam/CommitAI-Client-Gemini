import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { User, Mail, Lock, Check } from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';
import { signUpUser } from '@/api/auth';
import { saveUsername } from '@/store/secureStore';
import { setAccessToken, setRefreshToken } from '@/store/authSlice';
import { useDispatch } from 'react-redux';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch()
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const hasWeakPasswordError = password.length > 0 && !strongPassword.test(password);

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !termsAccepted) {
      return;
    }

    if (hasWeakPasswordError) {
      Alert.alert('Password must include 8+ characters, uppercase, lowercase, and a number.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      const response = await signUpUser(email, username, password)
      dispatch(setAccessToken(response.accessToken));
      dispatch(setRefreshToken(response.refreshToken));
      await saveUsername(response.username);

      console.log ("Sign-Up Screen: Username", response.username);
      navigation.navigate('OTPVerification', { email, username });
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    Haptics.selectionAsync();
  };

  const handleNavigateToLogin = () => {
    Haptics.selectionAsync();
    navigation.navigate('Login');
  };

  const isSubmitDisabled =
    loading ||
    !termsAccepted ||
    !username.trim() ||
    !email.trim() ||
    !password.trim();

  return (
    <AuthLayout>
      <View>
        <Text className="text-2xl font-black text-black mb-1 text-center">
          Create Account
        </Text>
        <Text className="text-sm text-system-gray-1 mb-6 text-center">
          Join the fitness revolution
        </Text>

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
          icon={Mail}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          isFocused={focusedInput === 'email'}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
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

        <Pressable
          className="flex-row items-center bg-system-gray-6 p-3 rounded-xl mb-4"
          onPress={toggleTerms}
        >
          <View
            className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-3 ${
              termsAccepted
                ? 'bg-black border-black'
                : 'bg-white border-system-gray-3'
            }`}
          >
            {termsAccepted && <Check size={14} color={COLORS.white} />}
          </View>
          <Text className="flex-1 text-xs text-system-gray-1 leading-4">
            I accept the <Text className="font-bold text-black underline">Terms & Conditions</Text> and
            Privacy Policy
          </Text>
        </Pressable>

        <AuthButton
          title="Start Journey"
          onPress={handleSignUp}
          disabled={isSubmitDisabled}
          loading={loading}
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-sm text-system-gray-1">Already have an account? </Text>
          <Pressable onPress={handleNavigateToLogin}>
            <Text className="text-sm font-bold text-black underline">Log In</Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
};

export default SignUpScreen;
