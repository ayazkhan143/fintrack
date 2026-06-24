import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'surfaceAlt';
}

export function ThemedView({ variant = 'background', style, ...props }: ThemedViewProps) {
  const colors = useThemeColors();
  const bg = variant === 'background' ? colors.bg : variant === 'surface' ? colors.surface : colors.surfaceAlt;
  return <View style={[{ backgroundColor: bg }, style]} {...props} />;
}
