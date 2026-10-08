import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { reconcileReminders } from './bill-reminders.mjs';
import { planSubscriptionReminders, SUBSCRIPTION_REMINDER_PREFIX } from './subscription-detective.mjs';

let queue = Promise.resolve();
export default function useSubscriptionReminders(cases, settings, ready, onOpen) {
  const [status, setStatus] = useState({ supported: true, count: 0, permissionBlocked: false, error: false });
  const latest = useRef(); latest.current = { cases, settings, ready, onOpen };
  useEffect(() => {
    let active = true;
    function refresh() {
      const current = latest.current;
      if (!current.ready) return;
      const operation = queue.catch(() => {}).then(async () => {
        const permission = await Notifications.getPermissionsAsync();
        const allowed = permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
        if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('subscription-detective', { name: 'Detective Clubhouse reminders', importance: Notifications.AndroidImportance.LOW, sound: null, enableVibrate: false, showBadge: false, lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE });
        const plan = planSubscriptionReminders(current.cases, { enabled: current.settings?.enabled === true && allowed });
        const count = await reconcileReminders(plan, {
          scheduled: Notifications.getAllScheduledNotificationsAsync,
          presented: async () => (await Notifications.getPresentedNotificationsAsync()).map(item => item.request),
          cancel: Notifications.cancelScheduledNotificationAsync, dismiss: Notifications.dismissNotificationAsync,
          schedule: item => Notifications.scheduleNotificationAsync({ identifier: item.identifier, content: item.content, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date, channelId: 'subscription-detective' } }),
        }, SUBSCRIPTION_REMINDER_PREFIX);
        return { supported: true, count, permissionBlocked: current.settings?.enabled === true && !allowed, error: false };
      });
      queue = operation;
      operation.then(value => { if (active) setStatus(value); }, () => { if (active) setStatus(value => ({ ...value, error: true })); });
    }
    refresh();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { active = false; sub.remove(); };
  }, [cases, settings, ready]);
  useEffect(() => {
    let active = true;
    function open(response) {
      if (active && latest.current.ready && response?.notification.request.content.data?.kind === 'payplace-subscription-reminder') {
        latest.current.onOpen(); Notifications.clearLastNotificationResponseAsync().catch(() => {});
      }
    }
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    if (ready) Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});
    return () => { active = false; sub.remove(); };
  }, [ready]);
  return status;
}
