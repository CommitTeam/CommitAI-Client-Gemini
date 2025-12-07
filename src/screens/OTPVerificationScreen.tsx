import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { AuthLayout, AuthButton } from '@/components/auth';
import { loginUser } from '@/services/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OTPVerificationRouteProp>();
  const { email, username } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }

    Haptics.selectionAsync();
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.some((digit) => !digit)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const user = await loginUser(username);
      navigation.replace('AvatarSelection', { username: user.name });
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // TODO: Implement resend OTP logic
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={COLORS.systemGray1} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={32} color={COLORS.black} />
          </View>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We sent a 4-digit code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        <View style={styles.otpInputs}>
          {otp.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => (otpRefs.current[idx] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(idx, value)}
              onKeyPress={({ nativeEvent }) =>
                handleOtpKeyPress(idx, nativeEvent.key)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <AuthButton
          title="Verify Access"
          onPress={handleOtpSubmit}
          disabled={!isOtpComplete || loading}
          loading={loading}
        />

        <Pressable style={styles.resendButton} onPress={handleResendCode}>
          <Text style={styles.resendText}>Resend Code</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
};

export default OTPVerificationScreen;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: -8,
    left: -8,
    padding: 8,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.systemGray6,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.systemGray1,
    textAlign: 'center',
    lineHeight: 18,
  },
  email: {
    fontWeight: '700',
    color: COLORS.black,
  },
  otpInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.systemGray6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    color: COLORS.black,
  },
  otpInputFilled: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.acidGreen,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.systemGray1,
  },
});
