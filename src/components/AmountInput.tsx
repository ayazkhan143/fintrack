import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../stores/useThemeStore';
import { COLORS, CURRENCIES } from '../constants';
import type { CurrencyCode } from '../types';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency: CurrencyCode;
  error?: string;
  onCurrencyPress?: () => void;
}

export function AmountInput({ value, onChange, currency, error, onCurrencyPress }: AmountInputProps) {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);
  const { symbol } = CURRENCIES[currency];

  const handleChange = useCallback((text: string) => {
    // Allow only valid decimal number input
    const clean = text.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChange(clean);
  }, [onChange]);

  return (
    <View>
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? COLORS.primary : error ? COLORS.danger : colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onCurrencyPress}
          disabled={!onCurrencyPress}
          style={styles.currencyBadge}
          accessibilityRole="button"
          accessibilityLabel={`Currency: ${currency}`}
        >
          <ThemedText style={[styles.currencySymbol, { color: COLORS.primary }]}>
            {symbol}
          </ThemedText>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.textSubtle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="Amount"
          maxLength={12}
        />
      </View>
      {error ? (
        <ThemedText variant="subtle" style={styles.error}>{error}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 4,
    height: 64,
  },
  currencyBadge: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  currencySymbol: { fontSize: 22, fontWeight: '700' },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  error: { color: COLORS.danger, marginTop: 6, marginLeft: 4 },
});
