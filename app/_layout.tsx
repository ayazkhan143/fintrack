import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeDatabase } from '../src/db/database';
import { seedCategories } from '../src/db/categories';
import { useSettingsStore } from '../src/stores/useSettingsStore';
import { useThemeStore, useThemeColors } from '../src/stores/useThemeStore';
import { requestNotificationPermissions } from '../src/services/notifications';
import { StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutInner() {
  const { load, settings } = useSettingsStore();
  const { setMode } = useThemeStore();
  const colors = useThemeColors();

  useEffect(() => {
    async function bootstrap() {
      try {
        await initializeDatabase();
        await seedCategories();
        await load();
        if (settings.notificationsEnabled) {
          await requestNotificationPermissions();
        }
      } catch (e) {
        console.error('Bootstrap error:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    bootstrap();
  }, [load, settings.notificationsEnabled]);

  useEffect(() => {
    setMode(settings.theme);
  }, [settings.theme, setMode]);

  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modals/add-transaction"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="modals/transaction-detail"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="modals/add-account"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="modals/add-budget"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutInner />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
