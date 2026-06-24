import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { EmptyState } from '../../src/components/EmptyState';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useRecurring, useToggleRecurring, useDeleteRecurring } from '../../src/hooks/useRecurring';
import { useCategories } from '../../src/hooks/useCategories';
import { useAccounts } from '../../src/hooks/useAccounts';
import { formatCurrency } from '../../src/utils/currency';
import { formatDate } from '../../src/utils/date';
import { COLORS } from '../../src/constants';
import type { RecurringTransaction } from '../../src/types';

export default function RecurringScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { data: items = [], isLoading } = useRecurring();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { mutateAsync: toggleRecurring } = useToggleRecurring();
  const { mutateAsync: deleteRecurring } = useDeleteRecurring();

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Recurring?', 'This will stop future scheduled transactions.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecurring(id) },
    ]);
  }, [deleteRecurring]);

  const renderItem = useCallback(({ item }: { item: RecurringTransaction }) => {
    const category = categories.find((c) => c.id === item.categoryId);
    const account = accounts.find((a) => a.id === item.accountId);
    const amountColor = item.type === 'income' ? COLORS.success : COLORS.danger;
    const prefix = item.type === 'income' ? '+' : '-';

    return (
      <View style={[styles.item, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconWrap, { backgroundColor: (category?.color ?? COLORS.primary) + '20' }]}>
          <Ionicons
            name={(category?.icon ?? 'repeat') as keyof typeof Ionicons.glyphMap}
            size={20}
            color={category?.color ?? COLORS.primary}
          />
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name} numberOfLines={1}>
            {category?.name ?? 'Recurring'}
          </ThemedText>
          <ThemedText variant="subtle">{account?.name ?? '—'} · {item.frequency}</ThemedText>
          <ThemedText variant="subtle">Next: {formatDate(item.nextDueDate)}</ThemedText>
        </View>
        <View style={styles.right}>
          <ThemedText style={[styles.amount, { color: amountColor }]}>
            {prefix}{formatCurrency(item.amount, settings.currency)}
          </ThemedText>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => toggleRecurring({ id: item.id, isActive: !item.isActive })}
              style={styles.actionBtn}
              accessibilityLabel={item.isActive ? 'Pause recurring' : 'Resume recurring'}
            >
              <Ionicons
                name={item.isActive ? 'pause-circle-outline' : 'play-circle-outline'}
                size={22}
                color={item.isActive ? COLORS.warning : COLORS.success}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              style={styles.actionBtn}
              accessibilityLabel="Delete recurring transaction"
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }, [categories, accounts, settings.currency, toggleRecurring, handleDelete, colors]);

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="heading" style={styles.title}>Recurring</ThemedText>
        <TouchableOpacity
          onPress={() => router.push('/modals/add-recurring')}
          style={styles.addBtn}
          accessibilityLabel="Add recurring transaction"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlashList
        data={items}
        keyExtractor={(i) => i.id}
        estimatedItemSize={90}
        renderItem={renderItem}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="repeat-outline"
              title="No recurring transactions"
              description="Set up recurring income or expenses to track them automatically."
              actionLabel="Add Recurring"
              onAction={() => router.push('/modals/add-recurring')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {},
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: 32, paddingTop: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: { flex: 1, gap: 2 },
  name: { fontWeight: '600' },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontWeight: '700', fontSize: 15 },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 4 },
});
