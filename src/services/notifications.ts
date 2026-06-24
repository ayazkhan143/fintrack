import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('recurring', {
      name: 'Recurring Transactions',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function scheduleBudgetAlert(
  categoryName: string,
  usedPercent: number,
  budgetId: string
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: `budget-${budgetId}`,
    content: {
      title: '⚠️ Budget Alert',
      body: `Your ${categoryName} budget is ${Math.round(usedPercent * 100)}% used.`,
      data: { type: 'budget', budgetId },
      categoryIdentifier: 'budget-alerts',
    },
    trigger: null,
  });
}

export async function scheduleRecurringReminder(
  note: string,
  dueDate: number,
  recurringId: string
): Promise<void> {
  const trigger = new Date(dueDate);
  trigger.setHours(9, 0, 0, 0);

  if (trigger.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: `recurring-${recurringId}`,
    content: {
      title: '💳 Recurring Transaction Due',
      body: `Reminder: "${note}" is due today.`,
      data: { type: 'recurring', recurringId },
      categoryIdentifier: 'recurring',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
