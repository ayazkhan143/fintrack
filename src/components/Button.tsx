import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { COLORS } from '../constants';
import { hapticLight } from '../utils/haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const handlePress = async () => {
    await hapticLight();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'ghost' || variant === 'outline' ? COLORS.primary : '#fff'}
        />
      ) : (
        <ThemedText
          style={[
            styles.label,
            variant === 'ghost' && { color: COLORS.primary },
            variant === 'outline' && { color: COLORS.primary },
            variant === 'danger' && { color: '#fff' },
            variant === 'primary' && { color: '#fff' },
            size === 'sm' && { fontSize: 13 },
            size === 'lg' && { fontSize: 17 },
          ]}
        >
          {label}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: { backgroundColor: COLORS.primary },
  danger: { backgroundColor: COLORS.danger },
  ghost: { backgroundColor: 'transparent' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
  disabled: { opacity: 0.5 },
  label: { fontWeight: '600' },
});
