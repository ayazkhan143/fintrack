import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const AUTH_TIMESTAMP_KEY = 'fintrack_last_auth';
const AUTH_GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export async function isBiometricAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  if (!compatible) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access FinTrack',
    fallbackLabel: 'Use Passcode',
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  if (result.success) {
    await SecureStore.setItemAsync(AUTH_TIMESTAMP_KEY, String(Date.now()));
  }
  return result.success;
}

export async function isWithinGracePeriod(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(AUTH_TIMESTAMP_KEY);
  if (!stored) return false;
  const lastAuth = parseInt(stored, 10);
  return Date.now() - lastAuth < AUTH_GRACE_PERIOD_MS;
}

export async function clearAuthTimestamp(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TIMESTAMP_KEY);
}
