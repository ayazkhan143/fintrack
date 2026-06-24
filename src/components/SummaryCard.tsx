import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../stores/useThemeStore';
import { formatCurrency } from '../utils/currency';
import { COLORS } from '../constants';
import type { CurrencyCode } from '../types';

interface SummaryCardProps {
  income: number;
  expense: number;
  currency: CurrencyCode;
  label?: string;
}

export function SummaryCard({ income, expense, currency, label }: SummaryCardProps) {
  const colors = useThemeColors();
  const net = income - expense;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {label ? (
        <ThemedText variant="label" style={styles.periodLabel}>{label}</ThemedText>
      ) : null}
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={[styles.dot, { backgroundColor: COLORS.success + '20' }]}>
            <Ionicons name="arrow-down" size={14} color={COLORS.success} />
          </View>
          <ThemedText variant="subtle" style={styles.itemLabel}>Income</ThemedText>
          <ThemedText style={[styles.itemValue, { color: COLORS.success }]}>
            {formatCurrency(income, currency)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.item}>
          <View style={[styles.dot, { backgroundColor: COLORS.danger + '20' }]}>
            <Ionicons name="arrow-up" size={14} color={COLORS.danger} />
          </View>
          <ThemedText variant="subtle" style={styles.itemLabel}>Expense</ThemedText>
          <ThemedText style={[styles.itemValue, { color: COLORS.danger }]}>
            {formatCurrency(expense, currency)}
          </ThemedText>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.item}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="swap-vertical" size={14} color={COLORS.primary} />
          </View>
          <ThemedText variant="subtle" style={styles.itemLabel}>Net</ThemedText>
          <ThemedText style={[styles.itemValue, { color: net >= 0 ? COLORS.success : COLORS.danger }]}>
            {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 8 },
  periodLabel: { marginBottom: 14, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { fontSize: 12 },
  itemValue: { fontWeight: '700', fontSize: 13 },
  divider: { width: 1, height: 50, marginHorizontal: 4 },
});
