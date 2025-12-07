// ============================================
// CommitAI Mobile - Login Screen
// Full authentication UI with OTP verification
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Flame,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check,
} from 'lucide-react-native';

import { RootStackParamList } from '@/types';
import { COLORS } from '@/constants';
import { loginUser } from '@/services/backend';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Background blob animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(blob1Anim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(blob2Anim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleAuthSubmit = async () => {
    if (!username.trim()) return;
    if (isSignUp && !termsAccepted) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      if (isSignUp) {
        // Simulate sending OTP
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStep('otp');
      } else {
        // Direct login
        const user = await loginUser(username);
        if (user.avatar) {
          navigation.replace('Main');
        } else {
          navigation.replace('AvatarSelection', { username: user.name });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto advance to next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }

    Haptics.selectionAsync();
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    // Handle backspace
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.some((digit) => !digit)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      // Simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const user = await loginUser(username);
      navigation.replace('AvatarSelection', { username: user.name });
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    Haptics.selectionAsync();
  };

  const isSubmitDisabled = loading || (isSignUp && !termsAccepted) || !username.trim();
  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Background Blobs */}
      <Animated.View
        style={[
          styles.blob1,
          {
            opacity: blob1Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 0.25],
            }),
            transform: [
              {
                scale: blob1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          {
            opacity: blob2Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.2],
            }),
            transform: [
              {
                scale: blob2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.15],
                }),
              },
            ],
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Flame size={40} color={COLORS.acidGreen} fill={COLORS.acidGreen} />
              </View>
              <Text style={styles.title}>
                Commit<Text style={styles.titleAccent}>AI</Text>
              </Text>
              <Text style={styles.tagline}>You v/s Who?</Text>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {step === 'auth' ? (
                <>
                  {/* Tab Switcher */}
                  <View style={styles.tabContainer}>
                    <Pressable
                      style={[styles.tab, isSignUp && styles.tabActive]}
                      onPress={() => setIsSignUp(true)}
                    >
                      <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
                        Sign Up
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.tab, !isSignUp && styles.tabActive]}
                      onPress={() => setIsSignUp(false)}
                    >
                      <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>
                        Log In
                      </Text>
                    </Pressable>
                  </View>

                  {/* Username Input */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputContainer,
                        focusedInput === 'username' && styles.inputFocused,
                      ]}
                    >
                      <User
                        size={20}
                        color={focusedInput === 'username' ? COLORS.black : COLORS.systemGray1}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor={COLORS.systemGray1}
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocusedInput('username')}
                        onBlur={() => setFocusedInput(null)}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  {/* Email Input (Sign Up only) */}
                  {isSignUp && (
                    <View style={styles.inputWrapper}>
                      <View
                        style={[
                          styles.inputContainer,
                          focusedInput === 'email' && styles.inputFocused,
                        ]}
                      >
                        <Mail
                          size={20}
                          color={focusedInput === 'email' ? COLORS.black : COLORS.systemGray1}
                          style={styles.inputIcon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Email"
                          placeholderTextColor={COLORS.systemGray1}
                          value={email}
                          onChangeText={setEmail}
                          onFocus={() => setFocusedInput('email')}
                          onBlur={() => setFocusedInput(null)}
                          autoCapitalize="none"
                          autoCorrect={false}
                          keyboardType="email-address"
                        />
                      </View>
                    </View>
                  )}

                  {/* Password Input */}
                  <View style={styles.inputWrapper}>
                    <View
                      style={[
                        styles.inputContainer,
                        focusedInput === 'password' && styles.inputFocused,
                      ]}
                    >
                      <Lock
                        size={20}
                        color={focusedInput === 'password' ? COLORS.black : COLORS.systemGray1}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={COLORS.systemGray1}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  {/* Terms Checkbox (Sign Up only) */}
                  {isSignUp && (
                    <Pressable style={styles.termsContainer} onPress={toggleTerms}>
                      <View
                        style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
                      >
                        {termsAccepted && <Check size={14} color={COLORS.white} />}
                      </View>
                      <Text style={styles.termsText}>
                        I accept the{' '}
                        <Text style={styles.termsLink}>Terms & Conditions</Text> and
                        Privacy Policy
                      </Text>
                    </Pressable>
                  )}

                  {/* Submit Button */}
                  <Pressable
                    style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                    onPress={handleAuthSubmit}
                    disabled={isSubmitDisabled}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>
                          {isSignUp ? 'Start Journey' : 'Enter Arena'}
                        </Text>
                        <ArrowRight size={18} color={COLORS.white} />
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                /* OTP Verification Screen */
                <View style={styles.otpContainer}>
                  <Pressable
                    style={styles.backButton}
                    onPress={() => setStep('auth')}
                  >
                    <ArrowLeft size={20} color={COLORS.systemGray1} />
                  </Pressable>

                  <View style={styles.otpHeader}>
                    <View style={styles.otpIconContainer}>
                      <ShieldCheck size={32} color={COLORS.black} />
                    </View>
                    <Text style={styles.otpTitle}>Verify Email</Text>
                    <Text style={styles.otpSubtitle}>
                      We sent a 4-digit code to{'\n'}
                      <Text style={styles.otpEmail}>{email || 'your email'}</Text>
                    </Text>
                  </View>

                  {/* OTP Inputs */}
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

                  {/* Verify Button */}
                  <Pressable
                    style={[
                      styles.submitButton,
                      !isOtpComplete && styles.submitButtonDisabled,
                    ]}
                    onPress={handleOtpSubmit}
                    disabled={!isOtpComplete || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Verify Access</Text>
                        <ArrowRight size={18} color={COLORS.white} />
                      </>
                    )}
                  </Pressable>

                  <Pressable style={styles.resendButton}>
                    <Text style={styles.resendText}>Resend Code</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.systemBg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  // Background Blobs
  blob1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.acidGreen,
  },
  blob2: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: COLORS.punchBlue,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.black,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    transform: [{ rotate: '3deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    color: COLORS.black,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  titleAccent: {
    color: COLORS.safetyOrange,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.systemGray1,
    marginTop: 4,
    letterSpacing: 1,
  },

  // Card
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 40,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },

  // Tab Switcher
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.systemGray6,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.systemGray1,
  },
  tabTextActive: {
    color: COLORS.black,
  },

  // Input
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.systemGray6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.black,
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },

  // Terms
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

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.black,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },

  // OTP Screen
  otpContainer: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: -8,
    left: -8,
    padding: 8,
    zIndex: 10,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  otpIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.systemGray6,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 12,
    color: COLORS.systemGray1,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpEmail: {
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
