import * as Notifications from 'expo-notifications';
import { bankSessionStore } from './bank-session.native';
import { drainBillReminders } from './useBillReminders.native';
import { drainSubscriptionReminders } from './useSubscriptionReminders.native';
import { drainAnnieCare } from './useAnnieCare.native';
export async function clearDeviceRecords(storage) {
  await Promise.all([drainBillReminders(), drainSubscriptionReminders(), drainAnnieCare()]);
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
  await Notifications.clearLastNotificationResponseAsync();
  await bankSessionStore.clear();
  // One authenticated vault write removes finances, profile, undo history and preferences.
  // This also handles an unreadable vault after explicit confirmation in recovery mode.
  await storage.replaceAll({});
}
