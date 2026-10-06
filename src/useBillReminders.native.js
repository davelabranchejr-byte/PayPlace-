import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { planBillReminders, reconcileReminders } from './bill-reminders.mjs';

const CHANNEL = 'annie-private-reminders';
let queue = Promise.resolve();
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }) });
function allowed(permission) { return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL; }
async function channel() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Annie’s quiet reminders', importance: Notifications.AndroidImportance.LOW,
    sound: null, enableVibrate: false, enableLights: false, showBadge: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
  });
}
export async function requestBillReminderPermission() {
  await channel();
  let permission = await Notifications.getPermissionsAsync();
  if (!allowed(permission) && permission.canAskAgain) permission = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: false } });
  return allowed(permission);
}
async function sync(bills, settings) {
  await channel();
  const permitted = allowed(await Notifications.getPermissionsAsync());
  const plan = planBillReminders(bills, { ...settings, enabled: settings?.enabled === true && permitted });
  const count = await reconcileReminders(plan, {
    scheduled: Notifications.getAllScheduledNotificationsAsync,
    presented: async () => (await Notifications.getPresentedNotificationsAsync()).map(item => item.request),
    cancel: Notifications.cancelScheduledNotificationAsync,
    dismiss: Notifications.dismissNotificationAsync,
    schedule: item => Notifications.scheduleNotificationAsync({ identifier: item.identifier, content: item.content, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: CHANNEL } }),
  });
  return { count, needsDate: plan.needsDate, permissionBlocked: settings?.enabled === true && !permitted, error: false };
}
export default function useBillReminders(bills, settings, ready, onOpenBills) {
  const [status, setStatus] = useState({ count: 0, needsDate: 0, permissionBlocked: false, error: false });
  const latest = useRef(); latest.current = { bills, settings, ready, onOpenBills };
  useEffect(() => {
    let active = true;
    function refresh() {
      const current = latest.current;
      if (!current.ready) return;
      const operation = queue.catch(() => {}).then(() => sync(current.bills, current.settings));
      queue = operation;
      operation.then(value => { if (active) setStatus(value); }, () => { if (active) setStatus(value => ({ ...value, error: true })); });
    }
    refresh();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    const timer = setInterval(() => { if (AppState.currentState === 'active') refresh(); }, 60000);
    return () => { active = false; sub.remove(); clearInterval(timer); };
  }, [bills, settings, ready]);
  useEffect(() => {
    let active = true;
    const open = response => {
      if (active && response?.notification.request.content.data?.kind === 'payplace-bill-reminder') {
        latest.current.onOpenBills();
        Notifications.clearLastNotificationResponseAsync().catch(() => {});
      }
    };
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    return () => { active = false; sub.remove(); };
  }, []);
  return { ...status, supported: true };
}
