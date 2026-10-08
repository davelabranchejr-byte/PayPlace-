import test from 'node:test';
import assert from 'node:assert/strict';
import { saveSubscription, updateSubscription, caseSummary, planSubscriptionReminders, SUBSCRIPTION_REMINDER_PREFIX } from '../src/subscription-detective.mjs';
import { mirrorBudget } from '../src/smart-mirror.mjs';
import { reconcileReminders, REMINDER_PREFIX } from '../src/bill-reminders.mjs';

const base = { balance: 1000, bills: [{ id: 'bill-1', name: 'Streaming', amount: 9.99, status: 'Upcoming' }], debts: [], buffer: 100 };
const draft = { id: 'case-1', name: 'Streaming', amount: '9.99', frequency: 'Monthly', renewalDate: '2026-10-31', status: 'Keep', billId: 'bill-1' };
test('saved cases survive serialization; linked bills never duplicate budget deductions', () => {
  const saved = saveSubscription(base, draft);
  assert.deepEqual(mirrorBudget(saved), mirrorBudget(base));
  assert.equal(saved.bills.length, 1);
  assert.equal(JSON.parse(JSON.stringify(saved)).subscriptions[0].amount, 9.99);
  const edited = saveSubscription(saved, { ...draft, amount: '10.50' });
  assert.equal(edited.subscriptions.length, 1);
  assert.equal(edited.bills[0].amount, 9.99);
});
test('invalid prices, dates, trial dates, links and missing bill references are rejected', () => {
  for (const entry of [{ amount: '-1' }, { amount: '9.999' }, { amount: 'NaN' }, { amount: '0' }, { renewalDate: '2026-02-30' }, { renewalDate: '1999-01-01' }, { trialEnds: '2026-11-01' }, { frequency: 'Daily' }, { status: 'Paid' }, { manageUrl: 'javascript:alert(1)' }, { manageUrl: 'http://example.com' }, { manageUrl: 'https://user:pass@example.com' }, { billId: 'missing' }]) assert.throws(() => saveSubscription(base, { ...draft, ...entry }));
  assert.equal(saveSubscription(base, { ...draft, manageUrl: 'https://example.com/account' }).subscriptions[0].manageUrl, 'https://example.com/account');
});
test('yearly costs normalize in cents, cancelled cases leave totals, review and trials remain visible', () => {
  let saved = saveSubscription(base, draft);
  saved = saveSubscription(saved, { ...draft, id: 'case-2', amount: '120', frequency: 'Yearly', status: 'Review', trialEnds: '2026-10-12' });
  assert.equal(caseSummary(saved).annual, 239.88);
  assert.equal(caseSummary(saved).monthly, 19.99);
  assert.equal(caseSummary(saved).reviewCount, 1);
  assert.equal(caseSummary(saved, new Date(2026, 9, 13)).due[0].overdue, true);
  saved = updateSubscription(saved, { type: 'status', id: 'case-1', status: 'Cancelled' });
  assert.equal(caseSummary(saved).annual, 120);
  assert.equal(caseSummary(saved).avoidedAnnual, 119.88);
  assert.equal(caseSummary(saved).due.length, 1);
  saved = updateSubscription(saved, { type: 'status', id: 'case-1', status: 'Keep' });
  assert.equal(caseSummary(saved).avoidedAnnual, 0);
});
test('renewals keep month-end anchors, handle leap years and advance only by explicit action', () => {
  let saved = saveSubscription(base, { ...draft, renewalDate: '2027-01-31', trialEnds: '2027-01-31' });
  saved = updateSubscription(saved, { type: 'renew', id: 'case-1' });
  assert.equal(saved.subscriptions[0].renewalDate, '2027-02-28');
  assert.equal(saved.subscriptions[0].trialEnds, '');
  saved = updateSubscription(saved, { type: 'renew', id: 'case-1' });
  assert.equal(saved.subscriptions[0].renewalDate, '2027-03-31');
  saved = saveSubscription(base, { ...draft, frequency: 'Yearly', renewalDate: '2028-02-29' });
  for (let i = 0; i < 4; i++) saved = updateSubscription(saved, { type: 'renew', id: 'case-1' });
  assert.equal(saved.subscriptions[0].renewalDate, '2032-02-29');
  assert.deepEqual(mirrorBudget(saved), mirrorBudget(base));
});
test('case removal leaves its linked bill; canceled cases and disabled reminders stop scheduling', () => {
  const saved = saveSubscription(base, draft);
  assert.deepEqual(updateSubscription(saved, { type: 'remove', id: 'case-1' }).bills, base.bills);
  assert.equal(planSubscriptionReminders(saved.subscriptions, { enabled: false }).reminders.length, 0);
  assert.equal(planSubscriptionReminders([{ ...draft, status: 'Cancelled' }], { enabled: true }, new Date(2026, 9, 1)).reminders.length, 0);
});
test('trial and renewal reminders group dates, preserve privacy and cap upcoming notifications', () => {
  const now = new Date(2026, 9, 1, 12);
  const plan = planSubscriptionReminders([{ ...draft, trialEnds: '2026-10-31' }, { ...draft, id: 'case-2' }], { enabled: true }, now);
  assert.equal(plan.reminders.length, 2);
  assert.equal(plan.reminders[0].date.getHours(), 9);
  assert.equal(plan.reminders[0].date.getDate(), 28);
  assert.ok(!JSON.stringify(plan).includes('Streaming'));
  assert.ok(!JSON.stringify(plan).includes('9.99'));
  const many = Array.from({ length: 30 }, (_, i) => ({ ...draft, renewalDate: `2026-11-${String(i + 1).padStart(2, '0')}` }));
  assert.equal(planSubscriptionReminders(many, { enabled: true }, now).reminders.length, 12);
});
test('subscription reconciliation cancels only Clubhouse notifications and keeps bill reminders', async () => {
  const cancelled = [], dismissed = [];
  const old = `${SUBSCRIPTION_REMINDER_PREFIX}old`, bill = `${REMINDER_PREFIX}bill`;
  await reconcileReminders({ reminders: [] }, { scheduled: async () => [{ identifier: old }, { identifier: bill }], presented: async () => [{ identifier: old }, { identifier: bill }], cancel: async id => cancelled.push(id), dismiss: async id => dismissed.push(id) }, SUBSCRIPTION_REMINDER_PREFIX);
  assert.deepEqual(cancelled, [old]); assert.deepEqual(dismissed, [old]);
});
test('backups preserve subscription cases and reject unsafe links and duplicate case IDs', async () => {
  const { validateBackup } = await import('../src/security-crypto.mjs');
  const saved = saveSubscription(base, draft);
  const backup = { schema: 'payplace-manual-v1', finance: saved, profile: {} };
  assert.deepEqual(validateBackup(backup).finance.subscriptions, saved.subscriptions);
  assert.throws(() => validateBackup({ ...backup, finance: { ...saved, subscriptions: [{ ...saved.subscriptions[0], manageUrl: 'javascript:alert(1)' }] } }));
  assert.throws(() => validateBackup({ ...backup, finance: { ...saved, subscriptions: [saved.subscriptions[0], saved.subscriptions[0]] } }));
  assert.throws(() => validateBackup({ ...backup, finance: { ...saved, subscriptions: [{ ...saved.subscriptions[0], name: {} }] } }));
  assert.throws(() => validateBackup({ ...backup, finance: { ...saved, subscriptions: [{ ...saved.subscriptions[0], anchorDay: 'bad' }] } }));
  assert.doesNotThrow(() => validateBackup({ ...backup, finance: { ...saved, bills: [] } }));
});
