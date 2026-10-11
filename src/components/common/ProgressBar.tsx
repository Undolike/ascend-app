import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 a 100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = COLORS.primary,
  trackColor = COLORS.surface,
  height = 8,
  style,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: trackColor,
          height,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
