export const REMINDER_PREFIX = 'payplace-bill-v1-';
export const REMINDER_CONTENT = Object.freeze({
  title: 'A little note from Annie',
  body: 'There’s a little planning to do. Come visit PayPlace when you have a moment. — Annie',
  data: { kind: 'payplace-bill-reminder' },
  sound: false,
});
export function reminderSettings(value) {
  return { enabled: value?.enabled === true, hour: value?.hour === 18 ? 18 : 9, daysBefore: value?.daysBefore === 3 ? 3 : 1 };
}
export function billDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const [year, month, day] = value.trim().split('-').map(Number);
  if (year < 2000 || year > 2100) return null;
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
export function planBillReminders(bills, options, now = new Date()) {
  const settings = reminderSettings(options);
  const dates = new Map();
  let needsDate = 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (const bill of bills || []) {
    if (bill.paid === true || String(bill.status).toLowerCase() === 'paid') continue;
    const due = billDate(bill.dueDate || bill.due);
    if (!due) { needsDate++; continue; }
    if (due < today) continue;
    // Both dates are planned up front. Reopening after the first notification
    // cannot accidentally create an unplanned follow-up notification.
    for (const daysBefore of [settings.daysBefore, 0]) {
      const date = new Date(due);
      date.setDate(date.getDate() - daysBefore);
      date.setHours(settings.hour, 0, 0, 0);
      if (date <= now || !settings.enabled) continue;
      const timestamp = date.getTime();
      dates.set(timestamp, { identifier: `${REMINDER_PREFIX}${timestamp}`, date, content: REMINDER_CONTENT });
    }
  }
  return { reminders: [...dates.values()].sort((a, b) => a.date - b.date).slice(0, 48), needsDate };
}

// Adapter injection keeps reconciliation testable without a simulator.
export async function reconcileReminders(plan, api) {
  const scheduled = await api.scheduled();
  const wanted = new Set(plan.reminders.map(item => item.identifier));
  const existing = new Set(scheduled.map(item => item.identifier));
  for (const item of scheduled) if (item.identifier.startsWith(REMINDER_PREFIX) && !wanted.has(item.identifier)) await api.cancel(item.identifier);
  for (const item of await api.presented()) {
    if (item.identifier.startsWith(REMINDER_PREFIX) && !wanted.has(item.identifier)) await api.dismiss(item.identifier);
  }
  for (const item of plan.reminders) if (!existing.has(item.identifier)) await api.schedule(item);
  return plan.reminders.length;
}
