import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TextInput, TouchableOpacity,
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
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useCreateAccount } from '../../src/hooks/useAccounts';
import { hapticSuccess, hapticError } from '../../src/utils/haptics';
import { COLORS } from '../../src/constants';
import type { AccountType } from '../../src/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  balance: z.string().refine((v) => !isNaN(parseFloat(v)) || v === '', 'Invalid balance'),
});

type FormValues = z.infer<typeof schema>;

const ACCOUNT_TYPES: { label: string; value: AccountType; icon: string }[] = [
  { label: 'Checking', value: 'checking', icon: 'card' },
  { label: 'Savings', value: 'savings', icon: 'save' },
  { label: 'Credit', value: 'credit', icon: 'card-outline' },
  { label: 'Cash', value: 'cash', icon: 'cash' },
  { label: 'Investment', value: 'investment', icon: 'trending-up' },
];

const ACCOUNT_ICONS = ['wallet', 'card', 'cash', 'save', 'business', 'briefcase', 'trending-up', 'home'];

export default function AddAccountModal() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings } = useSettingsStore();
  const { mutateAsync: createAccount } = useCreateAccount();

  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [selectedColor, setSelectedColor] = useState(COLORS.accountColors[0]);
  const [selectedIcon, setSelectedIcon] = useState('wallet');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', balance: '0' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createAccount({
        name: values.name,
        type: accountType,
        balance: parseFloat(values.balance) || 0,
        currency: settings.currency,
        color: selectedColor,
        icon: selectedIcon,
        isDefault: false,
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
          <ThemedText variant="heading">Add Account</ThemedText>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <Ionicons name="close" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Account Name</ThemedText>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.name ? COLORS.danger : colors.border }]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g. Main Checking"
                placeholderTextColor={colors.textSubtle}
                accessibilityLabel="Account name"
              />
            )}
          />
          {errors.name ? <ThemedText variant="subtle" style={{ color: COLORS.danger, marginTop: 4 }}>{errors.name.message}</ThemedText> : null}
        </View>

        {/* Account type */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Account Type</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ACCOUNT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typeChip,
                  { backgroundColor: accountType === t.value ? COLORS.primary : colors.surfaceAlt },
                ]}
                onPress={() => setAccountType(t.value)}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: accountType === t.value }}
              >
                <Ionicons name={t.icon as keyof typeof Ionicons.glyphMap} size={16} color={accountType === t.value ? '#fff' : colors.textMuted} />
                <ThemedText style={{ fontSize: 13, fontWeight: '600', color: accountType === t.value ? '#fff' : colors.textMuted, marginLeft: 6 }}>
                  {t.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Starting balance */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Starting Balance</ThemedText>
          <Controller
            control={control}
            name="balance"
            render={({ field: { value, onChange } }) => (
              <AmountInput value={value} onChange={onChange} currency={settings.currency} error={errors.balance?.message} />
            )}
          />
        </View>

        {/* Color picker */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Color</ThemedText>
          <View style={styles.colorRow}>
            {COLORS.accountColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotActive]}
                onPress={() => setSelectedColor(color)}
                accessibilityRole="radio"
                accessibilityLabel={`Color ${color}`}
                accessibilityState={{ checked: selectedColor === color }}
              >
                {selectedColor === color && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Icon picker */}
        <View style={styles.field}>
          <ThemedText variant="label" style={styles.label}>Icon</ThemedText>
          <View style={styles.iconRow}>
            {ACCOUNT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconOption, { backgroundColor: selectedIcon === icon ? selectedColor : colors.surfaceAlt }]}
                onPress={() => setSelectedIcon(icon)}
                accessibilityRole="radio"
                accessibilityLabel={`Icon ${icon}`}
                accessibilityState={{ checked: selectedIcon === icon }}
              >
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={selectedIcon === icon ? '#fff' : colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button label="Create Account" onPress={handleSubmit(onSubmit)} loading={isSubmitting} size="lg" style={styles.saveBtn} />
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
  textInput: { borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1.5 },
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  iconRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  iconOption: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { marginTop: 28 },
});
