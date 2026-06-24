import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { TransactionItem } from '../../src/components/TransactionItem';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useTransactions } from '../../src/hooks/useTransactions';
import { COLORS } from '../../src/constants';
import type { Transaction, TransactionType } from '../../src/types';

type FilterType = TransactionType | 'all';

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const queryFilters = useMemo(() => ({
    type: filter === 'all' ? undefined : filter,
    search: search.length >= 2 ? search : undefined,
    limit: 100,
  }), [filter, search]);

  const { data: transactions = [], isLoading } = useTransactions(queryFilters);

  const handlePress = useCallback((tx: Transaction) => {
    router.push({ pathname: '/modals/transaction-detail', params: { transactionId: tx.id } });
  }, []);

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.title}>Transactions</ThemedText>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={18} color={colors.textSubtle} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textSubtle}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search transactions"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={colors.textSubtle} />
          </TouchableOpacity>
        )}
      </View>

      <SegmentedControl
        options={TYPE_OPTIONS}
        value={filter}
        onChange={(v) => setFilter(v as FilterType)}
      />

      <FlashList
        data={transactions}
        keyExtractor={(t) => t.id}
        estimatedItemSize={72}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            currency={settings.currency}
            onPress={handlePress}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="receipt-outline"
              title="No transactions"
              description={search ? `No results for "${search}"` : 'Start adding transactions to see them here.'}
              actionLabel={search ? undefined : 'Add Transaction'}
              onAction={search ? undefined : () => router.push('/modals/add-transaction')}
            />
          )
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: {},
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  list: { paddingBottom: 32, paddingTop: 12 },
});
