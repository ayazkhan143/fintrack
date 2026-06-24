import * as Haptics from 'expo-haptics';
import { HAPTICS_ENABLED } from '../constants';

export async function hapticLight(): Promise<void> {
  if (!HAPTICS_ENABLED) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function hapticMedium(): Promise<void> {
  if (!HAPTICS_ENABLED) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function hapticSuccess(): Promise<void> {
  if (!HAPTICS_ENABLED) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function hapticError(): Promise<void> {
  if (!HAPTICS_ENABLED) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}
