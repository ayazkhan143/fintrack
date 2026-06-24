import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColors } from '../stores/useThemeStore';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatTime } from '../utils/date';
import { hapticLight } from '../utils/haptics';
import { COLORS } from '../constants';
import type { Transaction, CurrencyCode } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
  currency: CurrencyCode;
  onPress: (transaction: Transaction) => void;
}

export const TransactionItem = React.memo(function TransactionItem({
  transaction,
  currency,
  onPress,
}: TransactionItemProps) {
  const colors = useThemeColors();
  const { data: categories = [] } = useCategories();
  const category = categories.find((c) => c.id === transaction.categoryId);

  const handlePress = useCallback(async () => {
    await hapticLight();
    onPress(transaction);
  }, [transaction, onPress]);

  const amountColor =
    transaction.type === 'income'
      ? COLORS.success
      : transaction.type === 'transfer'
      ? COLORS.info
      : COLORS.danger;

  const prefix = transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '↔' : '-';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.note || category?.name ?? 'Transaction'}, ${prefix}${formatCurrency(transaction.amount, currency)}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: (category?.color ?? COLORS.primary) + '20' }]}>
        <Ionicons
          name={(category?.icon ?? 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
          size={20}
          color={category?.color ?? COLORS.primary}
        />
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name} numberOfLines={1}>
          {transaction.note || category?.name ?? 'Transaction'}
        </ThemedText>
        <ThemedText variant="subtle">
          {formatDate(transaction.date)} · {formatTime(transaction.date)}
        </ThemedText>
      </View>
      <View style={styles.right}>
        <ThemedText style={[styles.amount, { color: amountColor }]}>
          {prefix}{formatCurrency(transaction.amount, currency)}
        </ThemedText>
        {transaction.status === 'pending' && (
          <ThemedText variant="subtle" style={styles.pending}>pending</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontWeight: '500', marginBottom: 3 },
  right: { alignItems: 'flex-end' },
  amount: { fontWeight: '700', fontSize: 15 },
  pending: { marginTop: 2, color: COLORS.warning },
});
