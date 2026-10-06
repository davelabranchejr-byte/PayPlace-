import test from 'node:test';
import assert from 'node:assert/strict';
import { billDate, planBillReminders, reminderSettings, REMINDER_CONTENT, REMINDER_PREFIX, reconcileReminders } from '../src/bill-reminders.mjs';
import { deleteEntry, restoreEntry, deletedItems, MAX_DELETED_ITEMS } from '../src/deleted-items.mjs';
import { validateBackup } from '../src/security-crypto.mjs';
const bill = (id, date, extra = {}) => ({ id, name: 'Private utility', amount: '142.38', dueDate: date, ...extra });
const now = new Date(2026, 9, 6, 8), options = { enabled: true, hour: 9, daysBefore: 1 };
test('full dates reject ambiguous labels and invalid leap days', () => {
  for (const date of ['2026-02-30', 'Jun 15', '2025-02-29']) assert.equal(billDate(date), null);
  assert.equal(billDate('2028-02-29').getDate(), 29);
});
test('reminders default off and payloads contain no bill information', () => {
  assert.equal(reminderSettings().enabled, false);
  assert.equal(planBillReminders([bill('private-id', '2026-10-10')], {}, now).reminders.length, 0);
  for (const value of ['Private utility', '142.38', 'private-id']) assert.equal(JSON.stringify(REMINDER_CONTENT).includes(value), false);
  assert.equal(REMINDER_CONTENT.sound, false);
});
test('one local reminder per day groups bills and excludes paid and overdue entries', () => {
  const p = planBillReminders([bill('1', '2026-10-10'), bill('2', '2026-10-10'), bill('3', '2026-10-11', { status: 'Paid' }), bill('4', '2026-10-12', { paid: true }), bill('5', '2026-10-05'), bill('6', 'Jun 15')], options, now);
  assert.equal(p.reminders.length, 2); assert.equal(p.needsDate, 1);
  assert.equal(p.reminders[0].date.getDate(), 9); assert.equal(p.reminders[0].date.getHours(), 9);
});
test('late entry falls back to due day without past reminders', () => {
  assert.equal(planBillReminders([bill('1', '2026-10-07')], options, new Date(2026, 9, 6, 10)).reminders[0].date.getDate(), 7);
  assert.equal(planBillReminders([bill('1', '2026-10-06')], options, new Date(2026, 9, 6, 10)).reminders.length, 0);
});
test('calendar scheduling keeps local hour across daylight-saving transition', () => {
  const p = planBillReminders([bill('1', '2026-11-02')], { ...options, daysBefore: 3, hour: 18 }, new Date(2026, 9, 20));
  assert.equal(p.reminders[0].date.getMonth(), 9); assert.equal(p.reminders[0].date.getDate(), 30); assert.equal(p.reminders[0].date.getHours(), 18);
});
test('schedule limit preserves nearest 48 days', () => {
  const bills = Array.from({ length: 70 }, (_, index) => { const d = new Date(2026, 9, 10 + index); return bill(String(index), [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')); });
  const p = planBillReminders(bills, options, now);
  assert.equal(p.reminders.length, 48); assert.equal(p.reminders[0].date.getDate(), 9);
  assert.ok(p.reminders.every((r, i, all) => !i || r.date > all[i - 1].date));
});
test('reconciliation cancels stale reminders, preserves other alerts, and avoids duplicates', async () => {
  const p = planBillReminders([bill('1', '2026-10-10'), bill('2', '2026-10-11')], options, now), old = REMINDER_PREFIX + 'old', calls = [];
  await reconcileReminders(p, {
    scheduled: async () => [{ identifier: old }, { identifier: 'another-feature' }, { identifier: p.reminders[0].identifier }], presented: async () => [{ identifier: old }, { identifier: 'another-feature' }],
    cancel: async id => calls.push(['cancel', id]), dismiss: async id => calls.push(['dismiss', id]), schedule: async item => calls.push(['schedule', item.identifier]),
  });
  assert.deepEqual(calls, [['cancel', old], ['dismiss', old], ...p.reminders.slice(1).map(item => ['schedule', item.identifier])]);
});
test('disabling reminders cancels only Annie notifications', async () => {
  const calls = [];
  await reconcileReminders({ reminders: [] }, { scheduled: async () => [{ identifier: REMINDER_PREFIX + '1' }, { identifier: 'other' }], presented: async () => [], cancel: async id => calls.push(id), dismiss: async () => {}, schedule: async () => assert.fail('should not schedule') });
  assert.deepEqual(calls, [REMINDER_PREFIX + '1']);
});
const finance = { balance: 1900, bills: [bill('1', '2026-10-10'), bill('2', '2026-10-11')], debts: [{ id: 'd1', name: 'Loan', balance: 600, apr: 5, minimum: 30 }] };
test('bill recovery survives saving and restores order without rolling back budget edits', () => {
  const removed = deleteEntry(finance, 'bills', '1', now.getTime()), stored = JSON.parse(JSON.stringify({ ...removed, balance: 1200 })), restored = restoreEntry(stored, stored.deletedItems[0].key);
  assert.deepEqual(restored.bills, finance.bills); assert.equal(restored.balance, 1200); assert.equal(restored.deletedItems.length, 0); assert.equal(finance.bills.length, 2);
});
test('debt recovery retains details and never overwrites an existing entry', () => {
  const removed = deleteEntry(finance, 'debts', 'd1', now.getTime()), key = removed.deletedItems[0].key;
  assert.deepEqual(restoreEntry(removed, key).debts, finance.debts);
  const collision = { ...removed, debts: [{ ...finance.debts[0], balance: 100 }] }; assert.equal(restoreEntry(collision, key), collision);
});
test('missing deletions are no-ops and recovery retains last 20 entries', () => {
  assert.equal(deleteEntry(finance, 'bills', 'missing'), finance); assert.equal(deleteEntry(finance, 'profile', '1'), finance);
  let current = { ...finance, bills: Array.from({ length: 25 }, (_, i) => bill(String(i), '2026-10-10')) };
  for (let i = 0; i < 25; i++) current = deleteEntry(current, 'bills', String(i), now.getTime() + i);
  assert.equal(deletedItems(current).length, MAX_DELETED_ITEMS); assert.equal(deletedItems(current)[0].item.id, '24'); assert.equal(deletedItems(current)[19].item.id, '5');
});
test('backups keep valid recovery history but reject invalid financial records', () => {
  const removed = deleteEntry(finance, 'debts', 'd1', now.getTime());
  const backup = { schema: 'payplace-manual-v1', finance: removed, profile: {} };
  assert.deepEqual(validateBackup(backup).finance.deletedItems, removed.deletedItems);
  assert.throws(() => validateBackup({ ...backup, finance: { ...removed, deletedItems: [{ ...removed.deletedItems[0], item: { id: 'bad', name: 'Bad loan', balance: 'not a number' } }] } }));
});
