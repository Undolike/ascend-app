import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'lime' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'lime',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'lime':
        return { bg: 'rgba(204, 255, 0, 0.15)', text: COLORS.primary, border: COLORS.primary };
      case 'violet':
        return { bg: 'rgba(139, 92, 246, 0.15)', text: '#A78BFA', border: '#8B5CF6' };
      case 'success':
        return { bg: COLORS.successBg, text: COLORS.success, border: COLORS.success };
      case 'warning':
        return { bg: COLORS.warningBg, text: COLORS.warning, border: COLORS.warning };
      case 'danger':
        return { bg: COLORS.dangerBg, text: COLORS.danger, border: COLORS.danger };
      case 'neutral':
      default:
        return { bg: COLORS.surface, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const { bg, text, border } = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? SPACING.xs + 2 : SPACING.sm + 2,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: text, fontSize: size === 'sm' ? 11 : 13 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
