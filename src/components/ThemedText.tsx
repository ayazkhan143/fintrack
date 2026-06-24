import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColors } from '../stores/useThemeStore';

interface ThemedTextProps extends TextProps {
  variant?: 'default' | 'muted' | 'subtle' | 'heading' | 'title' | 'label';
}

const styles = StyleSheet.create({
  default: { fontSize: 15, lineHeight: 22 },
  muted: { fontSize: 14, lineHeight: 20 },
  subtle: { fontSize: 12, lineHeight: 18 },
  heading: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  title: { fontSize: 28, fontWeight: '800', lineHeight: 36 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.3 },
});

export function ThemedText({ variant = 'default', style, ...props }: ThemedTextProps) {
  const colors = useThemeColors();
  const colorMap = {
    default: colors.text,
    muted: colors.textMuted,
    subtle: colors.textSubtle,
    heading: colors.text,
    title: colors.text,
    label: colors.textMuted,
  };
  return (
    <Text
      style={[styles[variant], { color: colorMap[variant] }, style]}
      {...props}
    />
  );
}
