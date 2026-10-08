import { dateKey, readDate } from './paycheck-calendar.mjs';
import { parseAmount } from './smart-mirror.mjs';

export const FREQUENCIES = Object.freeze({ Monthly: 12, Yearly: 1, Quarterly: 4, Weekly: 52 });
export const CASE_STATES = ['Keep', 'Review', 'Cancelled'];
export const SUBSCRIPTION_REMINDER_PREFIX = 'payplace-subscription-v1-';
export const subscriptionCases = finance => Array.isArray(finance.subscriptions) ? finance.subscriptions : [];

export function saveSubscription(finance, draft) {
  const name = String(draft.name || '').trim().slice(0, 80);
  const amount = parseAmount(draft.amount);
  if (!name) throw new Error('Give this subscription a name.');
  if (amount === null || amount <= 0) throw new Error('Enter the recurring price greater than zero, with up to two decimal places.');
  if (!Object.hasOwn(FREQUENCIES, draft.frequency)) throw new Error('Choose a billing frequency.');
  if (!CASE_STATES.includes(draft.status)) throw new Error('Choose Keep, Review, or Cancelled.');
  const renewal = readDate(draft.renewalDate);
  if (!renewal || renewal.getFullYear() < 2000 || renewal.getFullYear() > 2100) throw new Error('Enter a real renewal date in YYYY-MM-DD format (2000–2100).');
  const trialEnds = String(draft.trialEnds || '').trim();
  const trial = readDate(trialEnds);
  if (trialEnds && (!trial || trial > renewal || trial.getFullYear() < 2000)) throw new Error('Use a real trial-end date on or before the renewal date.');
  const manageUrl = String(draft.manageUrl || '').trim();
  if (manageUrl) {
    try { const url = new URL(manageUrl); if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) throw new Error(); }
    catch { throw new Error('Use a full https:// subscription settings link, or leave it blank.'); }
  }
  const cases = subscriptionCases(finance);
  const previous = cases.find(item => item.id === draft.id);
  const billId = draft.billId || '';
  if (billId && !(finance.bills || []).some(item => item.id === billId)) throw new Error('That bill is no longer available. Choose another bill or unlink it.');
  if (!draft.id || typeof draft.id !== 'string') throw new Error('Reopen the add-subscription form and try again.');
  const item = { id: draft.id, name, amount, frequency: draft.frequency, status: draft.status,
    renewalDate: dateKey(renewal), anchorDay: previous?.renewalDate === draft.renewalDate ? previous.anchorDay || renewal.getDate() : renewal.getDate(),
    trialEnds, manageUrl, billId };
  return { ...finance, subscriptions: previous ? cases.map(entry => entry.id === item.id ? item : entry) : [...cases, item] };
}

export function updateSubscription(finance, action) {
  if (action.type === 'save') return saveSubscription(finance, action.entry);
  const cases = subscriptionCases(finance);
  const item = cases.find(entry => entry.id === action.id);
  if (!item) throw new Error('This case is no longer available.');
  if (action.type === 'remove') return { ...finance, subscriptions: cases.filter(entry => entry.id !== item.id) };
  if (action.type === 'status' && CASE_STATES.includes(action.status)) return { ...finance, subscriptions: cases.map(entry => entry.id === item.id ? { ...entry, status: action.status } : entry) };
  if (action.type === 'renew') {
    const date = readDate(item.renewalDate);
    if (!date) throw new Error('Edit this case to add a valid renewal date.');
    let next;
    if (item.frequency === 'Weekly') { next = new Date(date); next.setDate(next.getDate() + 7); }
    else {
      const months = { Monthly: 1, Quarterly: 3, Yearly: 12 }[item.frequency];
      if (!months) throw new Error('Edit this case to choose its billing frequency.');
      const first = new Date(date.getFullYear(), date.getMonth() + months, 1, 12);
      next = new Date(first.getFullYear(), first.getMonth(), Math.min(item.anchorDay || date.getDate(), new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()), 12);
    }
    if (next.getFullYear() > 2100) throw new Error('Edit this case to choose a renewal date through 2100.');
    return { ...finance, subscriptions: cases.map(entry => entry.id === item.id ? { ...entry, renewalDate: dateKey(next), anchorDay: item.anchorDay || date.getDate(), trialEnds: '' } : entry) };
  }
  throw new Error('Choose a valid case action.');
}

export function caseSummary(finance, now = new Date()) {
  const cases = subscriptionCases(finance);
  const active = cases.filter(item => item.status !== 'Cancelled');
  const annualCents = items => items.reduce((sum, item) => sum + Math.round(Number(item.amount || 0) * 100) * (FREQUENCIES[item.frequency] || 0), 0);
  const annual = annualCents(active) / 100;
  const today = dateKey(now);
  return { active, annual, monthly: Math.round(annual * 100 / 12) / 100,
    avoidedAnnual: annualCents(cases.filter(item => item.status === 'Cancelled')) / 100,
    reviewCount: active.filter(item => item.status === 'Review').length,
    due: active.map(item => ({ ...item, eventDate: item.trialEnds || item.renewalDate, trial: Boolean(item.trialEnds) }))
      .filter(item => readDate(item.eventDate)).sort((a, b) => a.eventDate.localeCompare(b.eventDate)).map(item => ({ ...item, overdue: item.eventDate < today })) };
}

export function planSubscriptionReminders(cases, settings, now = new Date()) {
  const reminders = new Map();
  if (settings?.enabled !== true) return { reminders: [] };
  for (const item of cases || []) {
    if (item.status === 'Cancelled') continue;
    for (const key of new Set([item.trialEnds, item.renewalDate].filter(Boolean))) {
      const due = readDate(key);
      if (!due) continue;
      // Only dates explicitly entered by the user: no silent renewal projections.
      for (const daysBefore of [3, 0]) {
        const date = new Date(due); date.setDate(date.getDate() - daysBefore); date.setHours(9, 0, 0, 0);
        if (date <= now) continue;
        reminders.set(date.getTime(), { identifier: `${SUBSCRIPTION_REMINDER_PREFIX}${date.getTime()}`, date,
          content: { title: 'A little clue from PayPlace', body: 'Your Detective Clubhouse has a date to review. Come visit when you have a moment.', data: { kind: 'payplace-subscription-reminder' }, sound: false } });
      }
    }
  }
  // Combined with the existing 48 bill reminder days, stay below iOS's pending limit.
  return { reminders: [...reminders.values()].sort((a, b) => a.date - b.date).slice(0, 12) };
}
