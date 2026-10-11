import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'violet' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.card;
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.card;
      case 'violet':
        return COLORS.secondary;
      case 'danger':
        return COLORS.danger;
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textDisabled;
    switch (variant) {
      case 'primary':
        return COLORS.primaryText;
      case 'secondary':
        return COLORS.text;
      case 'violet':
        return '#FFFFFF';
      case 'danger':
        return '#FFFFFF';
      case 'ghost':
        return COLORS.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md };
      case 'lg':
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl };
      case 'md':
      default:
        return { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: variant === 'secondary' ? COLORS.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          ...getPadding(),
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.primaryText : COLORS.text}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                marginLeft: icon ? SPACING.sm : 0,
                fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
