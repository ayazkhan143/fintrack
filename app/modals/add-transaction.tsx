import React, { useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch,
} from 'react-native';
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
import { useCreateTransaction } from '../../src/hooks/useTransactions';
import { useAccounts } from '../../src/hooks/useAccounts';
import { useCategoriesByType } from '../../src/hooks/useCategories';
import { generateId } from '../../src/utils/id';
import { formatDate } from '../../src/utils/date';
import { hapticSuccess, hapticError } from '../../src/utils/haptics';
import { COLORS } from '../../src/constants';
import type { TransactionType } from '../../src/types';

const schema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((v) => parseFloat(v) > 0, 'Must be greater than 0'),
  note: z.string().max(200, 'Note too long'),
  isPending: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
];

export default function AddTransactionModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { mutateAsync: createTransaction } = useCreateTransaction();

  const [type, setType] = useState<TransactionType>('expense');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [date, setDate] = useState(Date.now());

  const { data: accounts = [] } = useAccounts();
  const { data: categories = [] } = useCategoriesByType(type === 'transfer' ? 'transfer' : type);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', note: '', isPending: false },
  });

  const activeAccountId = selectedAccountId ?? accounts[0]?.id ?? null;
  const activeCategoryId = selectedCategoryId ?? (categories.find((c) => c.isSystem)?.id ?? categories[0]?.id ?? null);

  const onSubmit = useCallback(async (values: FormValues) => {
    if (!activeAccountId) { await hapticError(); return; }
    if (!activeCategoryId) { await hapticError(); return; }

    try {
      await createTransaction({
        accountId: activeAccountId,
        categoryId: activeCategoryId,
        toAccountId: type === 'transfer' ? (toAccountId ?? null) : null,
        type,
        amount: parseFloat(values.amount),
        currency: settings.currency,
        note: values.note,
        date,
        status: values.isPending ? 'pending' : 'completed',
        receiptUri: null,
        tags: [],
      });
      await hapticSuccess();
      router.back();
    } catch {
      await hapticError();
    }
  }, [activeAccountId, activeCategoryId, type, toAccountId, date, settings.currency, createTransaction]);

  return (
    <ThemedView style={styles.fill}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.titleRow}>
          <ThemedText variant="heading">Add Transaction</ThemedText>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={(v) => { setType(v as TransactionType); setSelectedCategoryId(null); }} />

        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Amount</ThemedText>
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange } }) => (
              <AmountInput
                value={value}
                onChange={onChange}
                currency={settings.currency}
                error={errors.amount?.message}
              />
            )}
          />
        </View>

        {/* Account picker */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Account</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {accounts.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                style={[
                  styles.chip,
                  {
                    backgroundColor: activeAccountId === acc.id ? acc.color : colors.surfaceAlt,
                    borderColor: acc.color,
                  },
                ]}
                onPress={() => setSelectedAccountId(acc.id)}
                accessibilityRole="button"
                accessibilityLabel={acc.name}
                accessibilityState={{ selected: activeAccountId === acc.id }}
              >
                <ThemedText style={{ color: activeAccountId === acc.id ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
                  {acc.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* To account (transfer only) */}
        {type === 'transfer' && (
          <View style={styles.field}>
            <ThemedText variant="label" style={styles.label}>To Account</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
              {accounts.filter((a) => a.id !== activeAccountId).map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: toAccountId === acc.id ? acc.color : colors.surfaceAlt,
                      borderColor: acc.color,
                    },
                  ]}
                  onPress={() => setToAccountId(acc.id)}
                  accessibilityRole="button"
                  accessibilityLabel={acc.name}
                >
                  <ThemedText style={{ color: toAccountId === acc.id ? '#fff' : colors.text, fontSize: 13, fontWeight: '600' }}>
                    {acc.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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

        {/* Date */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Date</ThemedText>
          <View style={[styles.dateRow, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <ThemedText style={styles.dateText}>{formatDate(date)}</ThemedText>
            <TouchableOpacity
              onPress={() => setDate(Date.now())}
              accessibilityLabel="Reset to today"
            >
              <ThemedText style={{ color: COLORS.primary, fontSize: 13 }}>Today</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Note</ThemedText>
          <Controller
            control={control}
            name="note"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.noteInput, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.note ? COLORS.danger : colors.border }]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Optional note..."
                placeholderTextColor={colors.textSubtle}
                multiline
                maxLength={200}
                accessibilityLabel="Transaction note"
              />
            )}
          />
          {errors.note ? <ThemedText variant="subtle" style={{ color: COLORS.danger, marginTop: 4 }}>{errors.note.message}</ThemedText> : null}
        </View>

        {/* Pending toggle */}
        <Controller
          control={control}
          name="isPending"
          render={({ field: { value, onChange } }) => (
            <View style={[styles.toggleRow, { backgroundColor: colors.surface }]}>
              <View>
                <ThemedText style={{ fontWeight: '500' }}>Mark as Pending</ThemedText>
                <ThemedText variant="subtle">Won't affect account balance</ThemedText>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: colors.border, true: COLORS.primary + '80' }}
                thumbColor={value ? COLORS.primary : colors.textSubtle}
                accessibilityLabel="Mark transaction as pending"
              />
            </View>
          )}
        />

        <Button
          label="Save Transaction"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          size="lg"
          style={styles.saveBtn}
        />
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
  chips: { flexGrow: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1.5 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: { width: 72, alignItems: 'center', padding: 10, borderRadius: 14 },
  dateRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 10 },
  dateText: { flex: 1 },
  noteInput: {
    borderRadius: 14, padding: 14, fontSize: 15,
    minHeight: 80, textAlignVertical: 'top', borderWidth: 1.5,
  },
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 20, padding: 16, borderRadius: 14,
  },
  saveBtn: { marginTop: 24 },
});
