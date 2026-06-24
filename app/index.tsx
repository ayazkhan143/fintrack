import { Redirect } from 'expo-router';
import { useSettingsStore } from '../src/stores/useSettingsStore';

export default function Index() {
  const { settings, isLoaded } = useSettingsStore();
  if (!isLoaded) return null;
  if (!settings.onboardingCompleted) return <Redirect href="/(auth)/onboarding" />;
  if (settings.biometricEnabled) return <Redirect href="/(auth)/lock" />;
  return <Redirect href="/(tabs)" />;
}
