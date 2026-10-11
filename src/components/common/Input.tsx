import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  secureTextEntry,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          Boolean(error) && styles.errorBorder,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.primary}
          style={[styles.input, style]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    minHeight: 50,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.danger,
  },
  leftIconContainer: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZE.base,
    paddingVertical: SPACING.sm,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
  helperText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
  },
});
