import React, { useCallback } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { isBiometricAvailable } from '../../src/services/biometric';
import { COLORS, CURRENCIES } from '../../src/constants';
import type { CurrencyCode, ThemeMode } from '../../src/types';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

function SettingRow({ icon, iconColor, label, value, right, onPress, accessibilityLabel }: SettingRowProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={onPress ? 0.6 : 1}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
        {value ? <ThemedText variant="muted" style={styles.rowValue}>{value}</ThemedText> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} /> : null)}
    </TouchableOpacity>
  );
}

const CURRENCY_OPTIONS: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'PKR', 'SAR', 'AED', 'CAD', 'AUD'];
const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { settings, update } = useSettingsStore();

  const handleCurrencyChange = useCallback(() => {
    const options = CURRENCY_OPTIONS.map((c) => ({ text: `${CURRENCIES[c].symbol} ${c}`, value: c }));
    Alert.alert(
      'Select Currency',
      undefined,
      [
        ...options.map((o) => ({
          text: o.text,
          onPress: () => update('currency', o.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [update]);

  const handleThemeChange = useCallback(() => {
    Alert.alert(
      'Select Theme',
      undefined,
      [
        ...THEME_OPTIONS.map((o) => ({
          text: o.label,
          onPress: () => update('theme', o.value),
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [update]);

  const handleBiometricToggle = useCallback(async (value: boolean) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert('Unavailable', 'Biometric authentication is not set up on this device.');
        return;
      }
    }
    await update('biometricEnabled', value);
  }, [update]);

  return (
    <ThemedView style={[styles.fill, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText variant="heading" style={styles.title}>Settings</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Appearance */}
        <ThemedText variant="label" style={styles.sectionLabel}>APPEARANCE</ThemedText>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="color-palette"
            iconColor={COLORS.primary}
            label="Theme"
            value={settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}
            onPress={handleThemeChange}
          />
          <SettingRow
            icon="cash"
            iconColor={COLORS.success}
            label="Currency"
            value={`${CURRENCIES[settings.currency].symbol} ${settings.currency}`}
            onPress={handleCurrencyChange}
          />
          <SettingRow
            icon="eye-off"
            iconColor={COLORS.info}
            label="Hide Balance by Default"
            right={
              <Switch
                value={settings.hideBalance}
                onValueChange={(v) => update('hideBalance', v)}
                trackColor={{ false: colors.border, true: COLORS.primary + '80' }}
                thumbColor={settings.hideBalance ? COLORS.primary : colors.textSubtle}
              />
            }
          />
        </View>

        {/* Security */}
        <ThemedText variant="label" style={styles.sectionLabel}>SECURITY</ThemedText>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="finger-print"
            iconColor={COLORS.warning}
            label="Biometric Lock"
            right={
              <Switch
                value={settings.biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: colors.border, true: COLORS.primary + '80' }}
                thumbColor={settings.biometricEnabled ? COLORS.primary : colors.textSubtle}
              />
            }
          />
        </View>

        {/* Notifications */}
        <ThemedText variant="label" style={styles.sectionLabel}>NOTIFICATIONS</ThemedText>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="notifications"
            iconColor={COLORS.danger}
            label="Notifications"
            right={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(v) => update('notificationsEnabled', v)}
                trackColor={{ false: colors.border, true: COLORS.primary + '80' }}
                thumbColor={settings.notificationsEnabled ? COLORS.primary : colors.textSubtle}
              />
            }
          />
          <SettingRow
            icon="warning"
            iconColor={COLORS.warning}
            label="Budget Alerts"
            right={
              <Switch
                value={settings.budgetAlerts}
                onValueChange={(v) => update('budgetAlerts', v)}
                trackColor={{ false: colors.border, true: COLORS.primary + '80' }}
                thumbColor={settings.budgetAlerts ? COLORS.primary : colors.textSubtle}
              />
            }
          />
        </View>

        {/* Tools */}
        <ThemedText variant="label" style={styles.sectionLabel}>TOOLS</ThemedText>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="repeat"
            iconColor={COLORS.primary}
            label="Recurring Transactions"
            onPress={() => router.push('/recurring')}
            accessibilityLabel="Manage recurring transactions"
          />
        </View>

        {/* About */}
        <ThemedText variant="label" style={styles.sectionLabel}>ABOUT</ThemedText>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow icon="information-circle" iconColor={COLORS.info} label="Version" value="1.0.0" />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  title: {},
  sectionLabel: { marginHorizontal: 20, marginTop: 24, marginBottom: 8 },
  section: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowContent: { flex: 1 },
  rowLabel: { fontWeight: '500' },
  rowValue: { fontSize: 13, marginTop: 1 },
});
