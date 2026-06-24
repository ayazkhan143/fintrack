import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { useThemeColors } from '../stores/useThemeStore';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={40} color={colors.textSubtle} />
      </View>
      <ThemedText variant="heading" style={styles.title}>{title}</ThemedText>
      {description ? (
        <ThemedText variant="muted" style={styles.desc}>{description}</ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="outline"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { textAlign: 'center', marginBottom: 8 },
  desc: { textAlign: 'center', lineHeight: 22 },
  action: { marginTop: 20 },
});
