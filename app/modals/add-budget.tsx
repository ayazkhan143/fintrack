import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { Button } from '../../src/components/Button';
import { AmountInput } from '../../src/components/AmountInput';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useCreateBudget } from '../../src/hooks/useBudgets';
import { useCategoriesByType } from '../../src/hooks/useCategories';
import { getBudgetPeriodRange } from '../../src/utils/date';
import { hapticSuccess, hapticError } from '../../src/utils/haptics';
import { COLORS } from '../../src/constants';
import type { BudgetPeriod } from '../../src/types';

const schema = z.object({
  amount: z.string().min(1).refine((v) => parseFloat(v) > 0, 'Must be greater than 0'),
});

type FormValues = z.infer<typeof schema>;

const PERIODS: { label: string; value: BudgetPeriod }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function AddBudgetModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { mutateAsync: createBudget } = useCreateBudget();
  const { data: categories = [] } = useCategoriesByType('expense');

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  const onSubmit = async (values: FormValues) => {
    if (!activeCategoryId) { await hapticError(); return; }
    try {
      const { start, end } = getBudgetPeriodRange(period);
      await createBudget({
        categoryId: activeCategoryId,
        amount: parseFloat(values.amount),
        spent: 0,
        period,
        startDate: start,
        endDate: end,
        currency: settings.currency,
        alertAt: 0.8,
      });
      await hapticSuccess();
      router.back();
    } catch {
      await hapticError();
    }
  };

  return (
    <ThemedView style={styles.fill}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.titleRow}>
          <ThemedText variant="heading">Create Budget</ThemedText>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Budget Amount</ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange } }) => (
              <AmountInput value={value} onChange={onChange} currency={settings.currency} error={errors.amount?.message} />
            )}
          />
        </View>

        {/* Period */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Period</ThemedText>
          <View style={styles.periods}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.periodBtn,
                  { backgroundColor: period === p.value ? COLORS.primary : colors.surfaceAlt },
                ]}
                onPress={() => setPeriod(p.value)}
                accessibilityRole="radio"
                accessibilityLabel={p.label}
                accessibilityState={{ checked: period === p.value }}
              >
                <ThemedText style={{ color: period === p.value ? '#fff' : colors.textMuted, fontWeight: '600' }}>
                  {p.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category picker */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Category</ThemedText>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  { backgroundColor: activeCategoryId === cat.id ? cat.color + '20' : colors.surfaceAlt },
                  activeCategoryId === cat.id && { borderColor: cat.color, borderWidth: 1.5 },
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
                accessibilityState={{ selected: activeCategoryId === cat.id }}
              >
                <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={20} color={cat.color} />
                <ThemedText variant="subtle" style={{ fontSize: 11, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>
                  {cat.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button label="Create Budget" onPress={handleSubmit(onSubmit)} loading={isSubmitting} size="lg" style={styles.saveBtn} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  scroll: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  field: { marginTop: 20 },
  label: { marginBottom: 8 },
  periods: { flexDirection: 'row', gap: 10 },
  periodBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { width: 72, alignItems: 'center', padding: 10, borderRadius: 14 },
  saveBtn: { marginTop: 28 },
});
