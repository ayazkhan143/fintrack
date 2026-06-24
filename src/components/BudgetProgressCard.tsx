import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../stores/useThemeStore';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/currency';
import { COLORS } from '../constants';
import type { Budget } from '../types';

interface BudgetProgressCardProps {
  budget: Budget;
}

export function BudgetProgressCard({ budget }: BudgetProgressCardProps) {
  const colors = useThemeColors();
  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.id === budget.categoryId);

  const ratio = budget.amount > 0 ? Math.min(budget.spent / budget.amount, 1) : 0;
  const percent = Math.round(ratio * 100);
  const remaining = budget.amount - budget.spent;
  const isOverBudget = budget.spent > budget.amount;
  const isNearLimit = ratio >= budget.alertAt && !isOverBudget;

  const barColor = isOverBudget
    ? COLORS.danger
    : isNearLimit
    ? COLORS.warning
    : COLORS.success;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: (category?.color ?? COLORS.primary) + '20' }]}>
          <Ionicons
            name={(category?.icon ?? 'wallet') as keyof typeof Ionicons.glyphMap}
            size={18}
            color={category?.color ?? COLORS.primary}
          />
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name}>{category?.name ?? 'Budget'}</ThemedText>
          <ThemedText variant="subtle" style={{ textTransform: 'capitalize' }}>{budget.period}</ThemedText>
        </View>
        <View style={styles.amounts}>
          <ThemedText style={[styles.spent, { color: barColor }]}>
            {formatCurrency(budget.spent, budget.currency)}
          </ThemedText>
          <ThemedText variant="subtle">
            of {formatCurrency(budget.amount, budget.currency)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.trackBg, { backgroundColor: colors.surfaceAlt }]}>
        <View style={[styles.trackFill, { width: `${percent}%`, backgroundColor: barColor }]} />
      </View>

      <View style={styles.footer}>
        <ThemedText variant="subtle">{percent}% used</ThemedText>
        <ThemedText
          variant="subtle"
          style={{ color: isOverBudget ? COLORS.danger : colors.textSubtle }}
        >
          {isOverBudget
            ? `${formatCurrency(Math.abs(remaining), budget.currency)} over`
            : `${formatCurrency(remaining, budget.currency)} left`}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  info: { flex: 1 },
  name: { fontWeight: '600', marginBottom: 2 },
  amounts: { alignItems: 'flex-end' },
  spent: { fontWeight: '700', fontSize: 15 },
  trackBg: { height: 8, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
  trackFill: { height: '100%', borderRadius: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
});
