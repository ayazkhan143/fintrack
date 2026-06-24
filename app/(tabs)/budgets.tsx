import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { BudgetProgressCard } from '../../src/components/BudgetProgressCard';
import { EmptyState } from '../../src/components/EmptyState';
import { useActiveBudgets } from '../../src/hooks/useBudgets';
import { COLORS } from '../../src/constants';
import type { Budget } from '../../src/types';

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const { data: budgets = [], isLoading } = useActiveBudgets();

  const renderBudget = useCallback(({ item }: { item: Budget }) => (
    <BudgetProgressCard budget={item} />
  ), []);

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText variant="title">Budgets</ThemedText>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/modals/add-budget')}
          accessibilityRole="button"
          accessibilityLabel="Add budget"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlashList
        data={budgets}
        keyExtractor={(b) => b.id}
        estimatedItemSize={120}
        renderItem={renderBudget}
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="pie-chart-outline"
              title="No budgets set"
              description="Create budgets to monitor your spending by category."
              actionLabel="Create Budget"
              onAction={() => router.push('/modals/add-budget')}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingBottom: 32, paddingTop: 4 },
});
