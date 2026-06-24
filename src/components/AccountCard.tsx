import React, { useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { formatCurrency } from '../utils/currency';
import { hapticLight } from '../utils/haptics';
import type { Account } from '../types';

interface AccountCardProps {
  account: Account;
  onPress: (account: Account) => void;
  hideBalance?: boolean;
}

export const AccountCard = React.memo(function AccountCard({
  account,
  onPress,
  hideBalance = false,
}: AccountCardProps) {
  const handlePress = useCallback(async () => {
    await hapticLight();
    onPress(account);
  }, [account, onPress]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: account.color }]}
      onPress={handlePress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${account.name} account, balance ${hideBalance ? 'hidden' : formatCurrency(account.balance, account.currency)}`}
    >
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons
            name={account.icon as keyof typeof Ionicons.glyphMap}
            size={20}
            color="#fff"
          />
        </View>
        {account.isDefault && (
          <View style={styles.defaultBadge}>
            <ThemedText style={styles.defaultLabel}>Default</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.name}>{account.name}</ThemedText>
      <ThemedText style={styles.balance}>
        {hideBalance ? '••••••' : formatCurrency(account.balance, account.currency)}
      </ThemedText>
      <ThemedText style={styles.type}>{account.type}</ThemedText>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  name: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 4 },
  balance: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  type: { color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'capitalize' },
});
