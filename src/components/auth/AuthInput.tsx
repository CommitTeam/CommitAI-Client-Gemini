import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { COLORS } from '@/constants';

interface AuthInputProps extends TextInputProps {
  icon: LucideIcon;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  icon: Icon,
  isFocused,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  return (
    <View style={styles.inputWrapper}>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <Icon
          size={20}
          color={isFocused ? COLORS.black : COLORS.systemGray1}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.systemGray1}
          onFocus={onFocus}
          onBlur={onBlur}
          {...textInputProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
