import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { AccountCard } from '../../src/components/AccountCard';
import { TransactionItem } from '../../src/components/TransactionItem';
import { SummaryCard } from '../../src/components/SummaryCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useAccounts, useTotalBalance } from '../../src/hooks/useAccounts';
import { useTransactions, usePeriodTotals } from '../../src/hooks/useTransactions';
import { formatCurrency } from '../../src/utils/currency';
import { getMonthRange } from '../../src/utils/date';
import { COLORS } from '../../src/constants';
import type { Account, Transaction } from '../../src/types';

const { start, end } = getMonthRange();

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings, update } = useSettingsStore();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: totalBalance = 0 } = useTotalBalance();
  const { data: recentTransactions = [] } = useTransactions({ limit: 10 });
  const { data: monthTotals } = usePeriodTotals(start, end);

  const handleAccountPress = useCallback((account: Account) => {
    router.push({ pathname: '/modals/transaction-detail', params: { accountId: account.id } });
  }, []);

  const handleTransactionPress = useCallback((tx: Transaction) => {
    router.push({ pathname: '/modals/transaction-detail', params: { transactionId: tx.id } });
  }, []);

  const toggleHideBalance = useCallback(() => {
    update('hideBalance', !settings.hideBalance);
  }, [settings.hideBalance, update]);

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="muted">Total Balance</ThemedText>
            <TouchableOpacity
              onPress={toggleHideBalance}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={settings.hideBalance ? 'Show balance' : 'Hide balance'}
            >
              <ThemedText variant="title" style={styles.balance}>
                {settings.hideBalance ? '••••••' : formatCurrency(totalBalance, settings.currency)}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surface }]}
              onPress={toggleHideBalance}
              accessibilityRole="button"
              accessibilityLabel={settings.hideBalance ? 'Show balance' : 'Hide balance'}
            >
              <Ionicons
                name={settings.hideBalance ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.surface }]}
              onPress={() => router.push('/modals/add-account')}
              accessibilityRole="button"
              accessibilityLabel="Add account"
            >
              <Ionicons name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Accounts carousel */}
        {accountsLoading ? null : accounts.length === 0 ? (
          <View style={styles.emptyAccounts}>
            <EmptyState
              icon="wallet-outline"
              title="No accounts yet"
              description="Add your first account to start tracking"
              actionLabel="Add Account"
              onAction={() => router.push('/modals/add-account')}
            />
          </View>
        ) : (
          <FlatList
            data={accounts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(a) => a.id}
            contentContainerStyle={styles.accountsList}
            renderItem={({ item }) => (
              <AccountCard
                account={item}
                onPress={handleAccountPress}
                hideBalance={settings.hideBalance}
              />
            )}
          />
        )}

        {/* Monthly summary */}
        {monthTotals ? (
          <SummaryCard
            income={monthTotals.income}
            expense={monthTotals.expense}
            currency={settings.currency}
            label="This Month"
          />
        ) : null}

        {/* Recent transactions */}
        <View style={styles.sectionHeader}>
          <ThemedText variant="heading" style={styles.sectionTitle}>Recent</ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/transactions')}
            accessibilityRole="button"
            accessibilityLabel="See all transactions"
          >
            <ThemedText style={{ color: COLORS.primary, fontWeight: '600' }}>See all</ThemedText>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No transactions yet"
            description="Add your first transaction to get started"
            actionLabel="Add Transaction"
            onAction={() => router.push('/modals/add-transaction')}
          />
        ) : (
          recentTransactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              currency={settings.currency}
              onPress={handleTransactionPress}
            />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  balance: { marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountsList: { paddingHorizontal: 16, paddingBottom: 8 },
  emptyAccounts: { height: 200 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 18 },
});
