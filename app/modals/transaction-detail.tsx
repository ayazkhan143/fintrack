import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { Button } from '../../src/components/Button';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useTransactions, useDeleteTransaction } from '../../src/hooks/useTransactions';
import { useCategories } from '../../src/hooks/useCategories';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/currency';
import { formatDate, formatTime } from '../../src/utils/date';
import { COLORS } from '../../src/constants';
import { hapticError, hapticSuccess } from '../../src/utils/haptics';

export default function TransactionDetailModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const { mutateAsync: deleteTransaction, isPending: deleting } = useDeleteTransaction();
  const { data: transactions = [] } = useTransactions({ limit: 200 });
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();

  const transaction = transactions.find((t) => t.id === transactionId);
  const category = categories.find((c) => c.id === transaction?.categoryId);
  const account = accounts.find((a) => a.id === transaction?.accountId);
  const toAccount = accounts.find((a) => a.id === transaction?.toAccountId);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Transaction',
      'This will reverse the balance change. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!transaction) return;
            try {
              await deleteTransaction(transaction.id);
              await hapticSuccess();
              router.back();
            } catch {
              await hapticError();
            }
          },
        },
      ]
    );
  }, [transaction, deleteTransaction]);

  if (!transaction) {
    return (
      <ThemedView style={styles.fill}>
        <View style={styles.notFound}>
          <ThemedText variant="muted">Transaction not found.</ThemedText>
          <Button label="Close" onPress={() => router.back()} variant="ghost" />
        </View>
      </ThemedView>
    );
  }

  const amountColor =
    transaction.type === 'income' ? COLORS.success :
    transaction.type === 'transfer' ? COLORS.info : COLORS.danger;
  const prefix = transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '↔' : '-';

  return (
    <ThemedView style={styles.fill}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.titleRow}>
          <ThemedText variant="heading">Transaction Detail</ThemedText>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Hero amount */}
        <View style={styles.hero}>
          <View style={[styles.categoryIcon, { backgroundColor: (category?.color ?? COLORS.primary) + '20' }]}>
            <Ionicons
              name={(category?.icon ?? 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
              size={32}
              color={category?.color ?? COLORS.primary}
            />
          </View>
          <ThemedText style={[styles.heroAmount, { color: amountColor }]}>
            {prefix}{formatCurrency(transaction.amount, settings.currency)}
          </ThemedText>
          <ThemedText variant="muted">{category?.name ?? 'Unknown Category'}</ThemedText>
        </View>

        {/* Details */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <DetailRow label="Account" value={account?.name ?? '—'} />
          {toAccount && <DetailRow label="To Account" value={toAccount.name} />}
          <DetailRow label="Type" value={transaction.type} />
          <DetailRow label="Status" value={transaction.status} />
          <DetailRow label="Date" value={formatDate(transaction.date)} />
          <DetailRow label="Time" value={formatTime(transaction.date)} />
          {transaction.note ? <DetailRow label="Note" value={transaction.note} /> : null}
        </View>

        <Button
          label="Delete Transaction"
          onPress={handleDelete}
          variant="danger"
          loading={deleting}
          style={styles.deleteBtn}
          accessibilityLabel="Delete this transaction"
        />
      </ScrollView>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <ThemedText variant="muted">{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  scroll: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  hero: { alignItems: 'center', gap: 8, marginBottom: 24 },
  categoryIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heroAmount: { fontSize: 36, fontWeight: '800' },
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailValue: { fontWeight: '600', textTransform: 'capitalize' },
  deleteBtn: {},
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
});
