import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { User, Mail, Lock, Check } from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { AuthLayout, AuthInput, AuthButton } from '@/components/auth';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !termsAccepted) {
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Join the fitness revolution</Text>

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

        <Pressable style={styles.termsContainer} onPress={toggleTerms}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
            {termsAccepted && <Check size={14} color={COLORS.white} />}
          </View>
          <Text style={styles.termsText}>
            I accept the <Text style={styles.termsLink}>Terms & Conditions</Text> and
            Privacy Policy
          </Text>
        </Pressable>

        <AuthButton
          title="Start Journey"
          onPress={handleSignUp}
          disabled={isSubmitDisabled}
          loading={loading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={handleNavigateToLogin}>
            <Text style={styles.footerLink}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </AuthLayout>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.black,
    marginBottom: 4,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: COLORS.systemGray1,
    marginBottom: 24,
    textAlign: 'center',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.systemGray6,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.systemGray3,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.systemGray1,
    lineHeight: 16,
  },
  termsLink: {
    fontWeight: '700',
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.systemGray1,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
});
