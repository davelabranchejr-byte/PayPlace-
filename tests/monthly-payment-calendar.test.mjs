import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarHtml, calendarWeeks, paymentCalendar } from '../src/monthly-payment-calendar.mjs';

test('monthly calendar combines saved sources, honors recurrence and suppresses duplicate or undone entries', () => {
  const month = new Date(2026, 1, 1, 12);
  const at = new Date(2026, 1, 6, 12).getTime();
  const events = paymentCalendar({
    bills: [{ id: 'power', name: 'Power', due: '2026-02-06', amount: '80' },
      { id: 'streaming', name: 'Streaming', dueDate: '2026-02-28', amount: '10' }],
    subscriptions: [{ billId: 'streaming', name: 'Streaming', renewalDate: '2026-01-31', frequency: 'Monthly', amount: 10 }],
    nextPaycheckDate: '2026-02-06', payFrequency: 'Biweekly',
    paymentHistory: [{ id: 'gone', kind: 'recorded', name: 'Gone', at }, { undoOf: 'gone' },
      { id: 'paid', kind: 'recorded', name: 'Power', at, after: { amount: '80' } }],
    micropayments: [{ name: 'Extra', at, amountCents: 500 }, { name: 'Undone', at, amountCents: 500, undoneAt: at }],
  }, month);
  assert.deepEqual(events.map(event => [event.date, event.kind, event.name]), [
    ['2026-02-06', 'due', 'Power'], ['2026-02-06', 'paid', 'Power'], ['2026-02-06', 'paid', 'Extra'],
    ['2026-02-06', 'pay', 'Payday'], ['2026-02-20', 'pay', 'Payday'], ['2026-02-28', 'subscription', 'Streaming'],
  ]);
  assert.equal(calendarWeeks(month).length, 4);
});

test('print respects orientation, escaped labels, hidden amounts and busy-day overflow', () => {
  const month = new Date(2026, 10, 1, 12);
  const events = ['First', 'Second', '<Third>'].map(name => ({ date: '2026-11-03', name, kind: 'due', amount: 123.45 }));
  const html = calendarHtml(month, events, true, {}, true);
  assert.match(html, /letter landscape/);
  assert.match(html, /More in list below/);
  assert.match(html, /&lt;Third&gt;/);
  assert.doesNotMatch(html, /123\.45/);
  assert.match(calendarHtml(month, events, false, {}, false), /letter portrait/);
  assert.match(calendarHtml(month, events, false, {}, false), /\$123\.45/);
});
