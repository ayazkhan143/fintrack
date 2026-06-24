import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { Button } from '../../src/components/Button';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { authenticateWithBiometrics, isWithinGracePeriod } from '../../src/services/biometric';
import { COLORS } from '../../src/constants';
import { hapticSuccess, hapticError } from '../../src/utils/haptics';

export default function LockScreen() {
  const colors = useThemeColors();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authenticate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const inGrace = await isWithinGracePeriod();
      if (inGrace) {
        await hapticSuccess();
        router.replace('/(tabs)');
        return;
      }
      const success = await authenticateWithBiometrics();
      if (success) {
        await hapticSuccess();
        router.replace('/(tabs)');
      } else {
        await hapticError();
        setError('Authentication failed. Please try again.');
      }
    } catch {
      setError('Biometric authentication unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconWrap, { backgroundColor: COLORS.primary + '20' }]}>
            <Ionicons name="lock-closed" size={48} color={COLORS.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>FinTrack</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Authenticate to access your finances
          </ThemedText>
          {error ? (
            <ThemedText style={[styles.error, { color: COLORS.danger }]}>{error}</ThemedText>
          ) : null}
        </View>
        <Button
          label="Unlock with Biometrics"
          onPress={authenticate}
          loading={loading}
          size="lg"
          style={styles.button}
          accessibilityLabel="Unlock app with biometric authentication"
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
  error: { textAlign: 'center', marginTop: 8 },
  button: { width: '100%' },
});
