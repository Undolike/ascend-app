import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentBorder?: 'lime' | 'violet' | 'danger' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  accentBorder = 'none',
}) => {
  const getBorderColor = () => {
    switch (accentBorder) {
      case 'lime':
        return COLORS.primary;
      case 'violet':
        return COLORS.secondary;
      case 'danger':
        return COLORS.danger;
      default:
        return COLORS.border;
    }
  };

  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      borderColor: getBorderColor(),
      borderWidth: accentBorder !== 'none' ? 1.5 : 1,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={containerStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    overflow: 'hidden',
  },
});
