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
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useCreateRecurring } from '../../src/hooks/useRecurring';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useCategoriesByType } from '../../src/hooks/useCategories';
import { hapticSuccess, hapticError } from '../../src/utils/haptics';
import { COLORS } from '../../src/constants';
import type { TransactionType, RecurringTransaction } from '../../src/types';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

const schema = z.object({
  amount: z.string().min(1).refine((v) => parseFloat(v) > 0, 'Must be greater than 0'),
});

type FormValues = z.infer<typeof schema>;

type Frequency = RecurringTransaction['frequency'];

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

const FREQUENCY_OPTIONS: { label: string; value: Frequency }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

function getNextDueDate(frequency: Frequency): number {
  const now = new Date();
  switch (frequency) {
    case 'daily': return addDays(now, 1).getTime();
    case 'weekly': return addWeeks(now, 1).getTime();
    case 'biweekly': return addWeeks(now, 2).getTime();
    case 'monthly': return addMonths(now, 1).getTime();
    case 'yearly': return addYears(now, 1).getTime();
  }
}

export default function AddRecurringModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { mutateAsync: createRecurring } = useCreateRecurring();

  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategoriesByType(type);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '' },
  });

  const activeAccountId = selectedAccountId ?? accounts[0]?.id ?? null;
  const activeCategoryId = selectedCategoryId ?? (categories.find((c) => c.isSystem)?.id ?? categories[0]?.id ?? null);

  const onSubmit = async (values: FormValues) => {
    if (!activeAccountId || !activeCategoryId) { await hapticError(); return; }
    try {
      await createRecurring({
        accountId: activeAccountId,
        categoryId: activeCategoryId,
        type,
        amount: parseFloat(values.amount),
        currency: settings.currency,
        note: '',
        frequency,
        nextDueDate: getNextDueDate(frequency),
        isActive: true,
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
          <ThemedText variant="heading">Add Recurring</ThemedText>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <SegmentedControl
          options={TYPE_OPTIONS}
          value={type}
          onChange={(v) => { setType(v as TransactionType); setSelectedCategoryId(null); }}
        />

        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Amount</ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange } }) => (
              <AmountInput value={value} onChange={onChange} currency={settings.currency} error={errors.amount?.message} />
            )}
          />
        </View>

        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Frequency</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FREQUENCY_OPTIONS.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[styles.chip, { backgroundColor: frequency === f.value ? COLORS.primary : colors.surfaceAlt }]}
                onPress={() => setFrequency(f.value)}
                accessibilityRole="radio"
                accessibilityLabel={f.label}
                accessibilityState={{ checked: frequency === f.value }}
              >
                <ThemedText style={{ color: frequency === f.value ? '#fff' : colors.textMuted, fontWeight: '600', fontSize: 13 }}>
                  {f.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Account</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[styles.chip, { backgroundColor: activeAccountId === acc.id ? acc.color : colors.surfaceAlt, borderColor: acc.color, borderWidth: 1.5 }]}
                onPress={() => setSelectedAccountId(acc.id)}
                accessibilityRole="button"
                accessibilityLabel={acc.name}
                accessibilityState={{ selected: activeAccountId === acc.id }}
              >
                <ThemedText style={{ color: activeAccountId === acc.id ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
                  {acc.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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

        <Button label="Save Recurring" onPress={handleSubmit(onSubmit)} loading={isSubmitting} size="lg" style={styles.saveBtn} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  scroll: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  field: { marginTop: 20 },
  label: { marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { width: 72, alignItems: 'center', padding: 10, borderRadius: 14 },
  saveBtn: { marginTop: 24 },
});
