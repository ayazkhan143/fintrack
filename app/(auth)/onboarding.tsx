import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '../../src/components/ThemedView';
import { ThemedText } from '../../src/components/ThemedText';
import { Button } from '../../src/components/Button';
import { useThemeColors } from '../../src/stores/useThemeStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { isBiometricAvailable } from '../../src/services/biometric';
import { COLORS } from '../../src/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardSlide {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  description: string;
}

const SLIDES: OnboardSlide[] = [
  {
    icon: 'wallet',
    color: COLORS.primary,
    title: 'Track Every Rupee',
    description: 'Log income, expenses, and transfers across all your accounts in seconds.',
  },
  {
    icon: 'pie-chart',
    color: COLORS.success,
    title: 'Smart Budgets',
    description: 'Set monthly budgets per category and get alerted before you overspend.',
  },
  {
    icon: 'trending-up',
    color: COLORS.warning,
    title: 'Powerful Analytics',
    description: 'Interactive charts and insights to understand exactly where your money goes.',
  },
  {
    icon: 'lock-closed',
    color: COLORS.info,
    title: 'Secure by Default',
    description: 'Your data stays on your device. Protected with biometric authentication.',
  },
];

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const { update } = useSettingsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = async () => {
    if (isLast) {
      const biometricAvailable = await isBiometricAvailable();
      if (biometricAvailable) {
        await update('biometricEnabled', true);
      }
      await update('onboardingCompleted', true);
      router.replace('/(tabs)');
    } else {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  };

  return (
    <ThemedView style={styles.fill}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon} size={64} color={item.color} />
            </View>
            <ThemedText variant="title" style={styles.slideTitle}>{item.title}</ThemedText>
            <ThemedText variant="muted" style={styles.slideDesc}>{item.description}</ThemedText>
          </View>
        )}
      />

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === currentIndex ? COLORS.primary : colors.surfaceAlt,
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button
          label={isLast ? 'Get Started' : 'Next'}
          onPress={handleNext}
          size="lg"
          style={styles.btn}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 20 },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideTitle: { textAlign: 'center' },
  slideDesc: { textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 24, paddingBottom: 16, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  btn: { width: '100%' },
});
