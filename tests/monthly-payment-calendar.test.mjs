import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarHtml, calendarWeeks, illustratedCalendarWeeks, paymentCalendar } from '../src/monthly-payment-calendar.mjs';
import { saveGroomingAppointment, validateGroomingAppointments } from '../src/grooming-appointments.mjs';

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

test('date cells rotate illustrations per kind and print the art for every kind on a shared date', () => {
  const month = new Date(2026, 10, 1, 12);
  const events = Array.from({ length: 12 }, (_, index) => ({ date: `2026-11-${String(index + 1).padStart(2, '0')}`, kind: 'due', name: 'Bill' }));
  events.push({ date: '2026-11-03', kind: 'due', name: 'Another bill' }, { date: '2026-11-03', kind: 'grooming', name: 'Westley' });
  const days = illustratedCalendarWeeks(month, events).flat();
  const keys = days.flatMap(day => day.illustrations).filter(art => art.kind === 'due').map(art => art.key);
  assert.equal(new Set(keys).size, 12);
  assert.deepEqual(days.find(cell => cell.day === 3).illustrations.map(art => art.kind), ['due', 'grooming']);
  const html = calendarHtml(month, events, true, { 'grooming-10': 'em.png' }, true);
  assert.match(html, /<td><b>3<\/b><div class="day-art"><img src="em\.png" alt="Em">/);
});

test('Daddy marks bonus checks, Annie marks enabled reminders, and Em marks saved grooming dates', () => {
  const month = new Date(2026, 10, 1, 12);
  const groomingAppointments = saveGroomingAppointment([], { pet: ' Westley ', date: '2026-11-04', time: '09:30' }, 'spa');
  const finance = { groomingAppointments, bills: [{ id: 'power', name: 'Power', due: '2026-11-04' }],
    billReminders: { enabled: true }, extraPaychecks: [{ id: 'bonus', date: '2026-11-04', amount: 20 }] };
  const events = paymentCalendar(finance, month, month);
  assert.deepEqual(events.map(event => [event.date, event.kind]), [
    ['2026-11-03', 'reminder'], ['2026-11-04', 'due'], ['2026-11-04', 'bonus'], ['2026-11-04', 'reminder'], ['2026-11-04', 'grooming'],
  ]);
  assert.equal(events.at(-1).name, 'Westley · 09:30');
  const updated = saveGroomingAppointment(groomingAppointments, { ...groomingAppointments[0], date: '2026-12-03', time: '' });
  assert.equal(updated.length, 1);
  assert.equal(paymentCalendar({ groomingAppointments: updated }, month, month).length, 0);
  assert.throws(() => saveGroomingAppointment([], { pet: 'Westley', date: '2026-02-30', time: '' }, 'spa'));
  assert.throws(() => validateGroomingAppointments([...updated, ...updated]));
});
