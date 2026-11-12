import { categoryState, mergeCategoryPurchases, merchantKey, purchaseCategory, categoryAction } from './merchant-categories.mjs';
import { normalizePremiumBeta } from './premium-beta.mjs';
import { normalizePremiumState, roundUpForPurchase } from './premium-resilience.mjs';
import { readDate, dateKey } from './paycheck-calendar.mjs';

const cents = amount => Math.round(Number(amount) * 100);
const CATEGORY_MAP = { GENERAL_MERCHANDISE: 'Shopping', FOOD_AND_DRINK: 'Dining', GROCERIES: 'Groceries', TRANSPORTATION: 'Transportation', MEDICAL: 'Health', ENTERTAINMENT: 'Entertainment', PERSONAL_CARE: 'Health', RENT_AND_UTILITIES: 'Household', INCOME: 'Income', TRANSFER_IN: 'Transfer', TRANSFER_OUT: 'Transfer', LOAN_PAYMENTS: 'Debt' };
export function normalizeBankPurchase(raw) {
  if (!raw || typeof raw.transaction_id !== 'string' || typeof raw.account_id !== 'string' || !Number.isFinite(raw.amount) || !Number.isSafeInteger(cents(raw.amount))) throw new Error('Bank purchase details are incomplete.');
  const date = raw.date;
  if (!readDate(date)) throw new Error('The bank purchase needs a valid date.');
  if (raw.iso_currency_code !== 'USD') throw new Error('This purchase feed currently supports USD accounts.');
  const primary = raw.personal_finance_category?.primary || '';
  const detailed = raw.personal_finance_category?.detailed || '';
  const merchant = (raw.merchant_name || raw.name || '').trim();
  if (!merchant) throw new Error('The bank purchase needs a merchant or description.');
  return { id: raw.transaction_id, accountId: raw.account_id, merchant,
    ...(raw.merchant_entity_id ? { merchantId: raw.merchant_entity_id } : {}),
    ...(raw.pending_transaction_id ? { pendingTransactionId: raw.pending_transaction_id } : {}),
    amountCents: cents(raw.amount), date, pending: raw.pending === true, currency: 'USD', source: 'bank',
    category: detailed.includes('GROCERIES') ? 'Groceries' : detailed.includes('CLOTHING') ? 'Clothing' : CATEGORY_MAP[primary] || 'Other',
    bankCategory: primary, bankDetail: detailed, transfer: primary.startsWith('TRANSFER') || primary === 'LOAN_PAYMENTS' };
}
export function applyBankSnapshot(finance, payload, { source = 'demo', now = new Date() } = {}) {
  if (!payload || !Array.isArray(payload.accounts) || !['added', 'modified', 'removed'].every(k => Array.isArray(payload[k]))) throw new Error('The bank update is incomplete.');
  if (payload.has_more === true) throw new Error('Collect every page of this bank update before applying it.');
  const accounts = payload.accounts.map(a => {
    if (typeof a.account_id !== 'string' || typeof a.name !== 'string' || a.balances?.iso_currency_code !== 'USD' || !Number.isFinite(a.balances.current) || (a.balances.available != null && !Number.isFinite(a.balances.available))) throw new Error('The bank account balance is incomplete or uses an unsupported currency.');
    return { id: a.account_id, name: a.name, type: a.type, subtype: a.subtype, currentCents: cents(a.balances.current), availableCents: a.balances.available == null ? null : cents(a.balances.available), currency: 'USD' };
  });
  const removed = new Set(payload.removed.map(t => t.transaction_id));
  const previous = categoryState(finance.categorization);
  // Reconcile pending -> posted FIRST. Plaid can remove the pending ID in the
  // same update that adds the posted ID; deleting its exception first loses it.
  const merged = mergeCategoryPurchases(previous, accounts, [...payload.added, ...payload.modified].map(normalizeBankPurchase));
  const categorization = { ...merged, transactions: merged.transactions.filter(t => !removed.has(t.id)), overrides: merged.overrides.filter(o => !removed.has(o.transactionId)) };
  const activity = { ...finance.bankActivity, source, checkedAt: now.toISOString(), accounts: accounts.length ? accounts : finance.bankActivity?.accounts || [], cursor: payload.next_cursor || finance.bankActivity?.cursor || '', batch: finance.bankActivity?.batch || 0,
    roundUpEntries: finance.bankActivity?.roundUpEntries || [], seenRoundUps: finance.bankActivity?.seenRoundUps || [] };
  return { ...finance, categorization, bankActivity: activity };
}
function dateMonthsAgo(now, months, day) {
  return dateKey(new Date(now.getFullYear(), now.getMonth() - months, day, 12));
}
function rawPurchase(id, merchant, amount, date, primary, extra = {}) {
  return { transaction_id: id, account_id: 'sample-checking', merchant_name: merchant, name: merchant,
    amount, date, pending: false, iso_currency_code: 'USD', personal_finance_category: { primary }, ...extra };
}
export function demoBankSnapshot(now = new Date()) {
  const added = [];
  for (let month = 4; month >= 1; month--) {
    added.push(rawPurchase(`stream-${month}`, 'CatFlix', 14.99, dateMonthsAgo(now, month, 12), 'ENTERTAINMENT', { merchant_entity_id: 'sample-catflix' }));
    added.push(rawPurchase(`music-${month}`, 'Pawtify', month === 1 ? 11.99 : 10.99, dateMonthsAgo(now, month, 18), 'ENTERTAINMENT', { merchant_entity_id: 'sample-pawtify' }));
    added.push(rawPurchase(`gym-${month}`, 'Neighborhood Fitness', 29.99, dateMonthsAgo(now, month, 22), 'PERSONAL_CARE', { merchant_entity_id: 'sample-fitness' }));
  }
  const date = dateKey(now);
  added.push(rawPurchase('sample-costco', 'Costco', 130, date, 'GENERAL_MERCHANDISE'));
  added.push(rawPurchase('sample-target', 'Target', 54.99, date, 'FOOD_AND_DRINK', { personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' } }));
  added.push(rawPurchase('sample-costco-card', 'Costco', 27.50, date, 'GENERAL_MERCHANDISE', { account_id: 'sample-card' }));
  return { accounts: [
    { account_id: 'sample-checking', name: 'Sample checking', type: 'depository', subtype: 'checking', balances: { available: 320, current: 320, iso_currency_code: 'USD' } },
    { account_id: 'sample-card', name: 'Sample card', type: 'credit', subtype: 'credit card', balances: { available: null, current: 27.50, iso_currency_code: 'USD' } },
    { account_id: 'sample-savings', name: 'Sample savings', type: 'depository', subtype: 'savings', balances: { available: 100, current: 100, iso_currency_code: 'USD' } },
  ], added, modified: [], removed: [], next_cursor: 'demo-initial' };
}
export function seedDemoBank(finance, now = new Date()) {
  const next = applyBankSnapshot({ ...finance, categorization: undefined, bankActivity: undefined }, demoBankSnapshot(now), { now });
  return { ...next, balance: 320, balanceUpdatedAt: now.getTime(), balanceSource: 'Demo bank',
    premiumBeta: { ...normalizePremiumBeta(finance.premiumBeta), sampleConnected: true, useSamplePlan: true },
    bankActivity: { ...next.bankActivity, seenRoundUps: next.categorization.transactions.map(t => t.id), clock: dateKey(now) } };
}
export function recurringCandidates(finance, now = new Date(), includeTracked = false) {
  const state = categoryState(finance.categorization), groups = new Map();
  for (const transaction of state.transactions) {
    if (transaction.pending || transaction.amountCents <= 0 || transaction.transfer || transaction.source !== 'bank' || transaction.date > dateKey(now)) continue;
    // Ordinary supermarket/shopping trips alone are not subscription evidence.
    if (['Shopping', 'Groceries', 'Dining', 'Transportation'].includes(transaction.category)) continue;
    const key = JSON.stringify([transaction.accountId, merchantKey(transaction)]);
    groups.set(key, [...(groups.get(key) || []), transaction]);
  }
  const accepted = new Set((finance.subscriptions || []).map(s => s.detectionKey).filter(Boolean));
  const dismissed = new Set(finance.subscriptionDetection?.dismissed || []);
  const candidates = [];
  for (const [key, group] of groups) {
    if ((!includeTracked && accepted.has(key)) || dismissed.has(key)) continue;
    const charges = group.slice().sort((a, b) => a.date.localeCompare(b.date));
    if (charges.length < 3) continue;
    const intervals = charges.slice(1).map((t, i) => Math.round((readDate(t.date) - readDate(charges[i].date)) / 86400000));
    const frequency = intervals.every(d => d >= 6 && d <= 8) ? 'Weekly' : intervals.every(d => d >= 25 && d <= 35) ? 'Monthly' : intervals.every(d => d >= 80 && d <= 100) ? 'Quarterly' : intervals.every(d => d >= 330 && d <= 400) ? 'Yearly' : null;
    if (!frequency) continue;
    const last = charges.at(-1), previous = charges.at(-2);
    // A long-stopped charge does not imply an active subscription today.
    const maxAge = { Weekly: 16, Monthly: 70, Quarterly: 200, Yearly: 800 }[frequency];
    if ((now - readDate(last.date)) / 86400000 > maxAge) continue;
    const estimate = readDate(last.date), anchor = estimate.getDate();
    let guard = 0;
    do {
      if (frequency === 'Weekly') estimate.setDate(estimate.getDate() + 7);
      else { const first = new Date(estimate.getFullYear(), estimate.getMonth() + { Monthly: 1, Quarterly: 3, Yearly: 12 }[frequency], 1, 12); estimate.setFullYear(first.getFullYear(), first.getMonth(), Math.min(anchor, new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate())); }
    } while (dateKey(estimate) <= dateKey(now) && ++guard < 100);
    candidates.push({ key, name: last.merchant, accountId: last.accountId, accountName: state.accounts.find(a => a.id === last.accountId)?.name || 'Account',
      amountCents: last.amountCents, frequency, count: charges.length, lastDate: last.date, renewalDate: dateKey(estimate),
      priceChangeCents: last.amountCents - previous.amountCents, transactionIds: charges.map(t => t.id),
      variable: charges.some(t => Math.abs(t.amountCents - last.amountCents) > Math.max(100, last.amountCents * 0.15)) });
  }
  return candidates.sort((a, b) => a.renewalDate.localeCompare(b.renewalDate));
}
export function bankSpending(finance, month) {
  const state = categoryState(finance.categorization), totals = new Map();
  for (const transaction of state.transactions) {
    if (transaction.pending || transaction.amountCents <= 0 || transaction.transfer || (month && transaction.date.slice(0, 7) !== month)) continue;
    const choice = purchaseCategory(state, transaction);
    for (const part of choice.splits || [{ category: choice.category, amountCents: transaction.amountCents }]) totals.set(part.category, (totals.get(part.category) || 0) + part.amountCents);
  }
  return [...totals].map(([category, amountCents]) => ({ category, amountCents })).sort((a, b) => b.amountCents - a.amountCents);
}
function weekKey(date) { const d = readDate(date); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return dateKey(d); }
function demoTransfer(state, id, amountCents, date) {
  if (!amountCents) return state;
  return mergeCategoryPurchases(state, [], [
    normalizeBankPurchase(rawPurchase(`${id}-out`, 'Transfer to demo savings', amountCents / 100, date, 'TRANSFER_OUT')),
    normalizeBankPurchase(rawPurchase(`${id}-in`, 'Transfer from demo checking', -amountCents / 100, date, 'TRANSFER_IN', { account_id: 'sample-savings' })),
  ]);
}
export function collectDemoRoundUps(finance, now = new Date()) {
  if (finance.bankActivity?.source !== 'demo') return finance;
  const settings = normalizePremiumState(finance.premiumResilience), beta = normalizePremiumBeta(finance.premiumBeta);
  const state = categoryState(finance.categorization), activity = finance.bankActivity;
  const seen = new Set(activity.seenRoundUps || []), entries = [...activity.roundUpEntries || []], week = weekKey(activity.clock || dateKey(now));
  let savedCents = entries.filter(e => e.week === week).reduce((sum, e) => sum + e.amountCents, 0), added = 0;
  for (const transaction of state.transactions) {
    if (seen.has(transaction.id) || (transaction.pendingTransactionId && seen.has(transaction.pendingTransactionId)) || transaction.pending) continue;
    seen.add(transaction.id);
    if (!beta.sampleConnected || !beta.roundUpEnabled || transaction.amountCents <= 0 || transaction.transfer || transaction.accountId === 'sample-savings') continue;
    const requested = cents(roundUpForPurchase(transaction.amountCents / 100, settings.roundUpMultiplier));
    const availableCash = Math.max(0, cents(finance.balance) - added);
    const amountCents = Math.min(requested, Math.max(0, cents(settings.roundUpCap) - savedCents), availableCash);
    if (amountCents > 0) { entries.push({ transactionId: transaction.id, amountCents, week }); savedCents += amountCents; added += amountCents; }
  }
  return { ...finance, balance: (cents(finance.balance) - added) / 100,
    categorization: demoTransfer(state, `demo-roundup-transfer-${entries.length}`, added, activity.clock),
    bankActivity: { ...activity, seenRoundUps: [...seen], roundUpEntries: entries },
    premiumBeta: { ...beta, roundUpSaved: savedCents / 100, sampleFund: (cents(beta.sampleFund) + added) / 100 } };
}
export function demoBankAction(finance, action, now = new Date()) {
  let next = finance.bankActivity?.source === 'demo' ? finance : seedDemoBank(finance, now);
  const activity = next.bankActivity, beta = normalizePremiumBeta(next.premiumBeta), settings = normalizePremiumState(next.premiumResilience);
  if (action.type === 'reset') return seedDemoBank({ ...next, premiumBeta: undefined, subscriptions: [], subscriptionDetection: undefined }, now);
  if (action.type === 'refresh') return { ...next, bankActivity: { ...activity, checkedAt: now.toISOString() }, premiumBeta: { ...beta, watchRefreshes: beta.watchRefreshes + 1 } };
  if (action.type === 'next-week') {
    const clock = readDate(activity.clock); clock.setDate(clock.getDate() + 7);
    return { ...next, bankActivity: { ...activity, clock: dateKey(clock) }, premiumBeta: { ...beta, roundUpSaved: 0 } };
  }
  if (action.type === 'purchase-batch') {
    if (!beta.sampleConnected) throw new Error('Connect the demo accounts first.');
    const batch = activity.batch + 1, date = activity.clock;
    const raw = [rawPurchase(`demo-costco-${batch}`, 'Costco', 4.22, date, 'GENERAL_MERCHANDISE'), rawPurchase(`demo-target-${batch}`, 'Target', 12.48, date, 'GENERAL_MERCHANDISE'), rawPurchase(`demo-cafe-${batch}`, 'Neighborhood Café', 7.01, date, 'FOOD_AND_DRINK'), rawPurchase(`demo-shop-${batch}`, 'Pet Treats', 18.65, date, 'GENERAL_MERCHANDISE')];
    const spent = raw.reduce((sum, t) => sum + cents(t.amount), 0);
    if (spent > cents(next.balance)) throw new Error('The demo checking account needs another payday before this purchase batch.');
    const categorization = mergeCategoryPurchases(next.categorization, [], raw.map(normalizeBankPurchase));
    next = { ...next, categorization, balance: (cents(next.balance) - spent) / 100, bankActivity: { ...activity, batch, checkedAt: now.toISOString() }, premiumBeta: { ...beta, roundupRuns: beta.roundupRuns + 1 } };
    return collectDemoRoundUps(next, now);
  }
  if (action.type === 'payday') {
    if (!beta.sampleConnected) throw new Error('Connect the demo accounts first.');
    const income = Math.max(0, cents(next.nextPaycheck || 850));
    const saved = beta.fundEnabled ? Math.min(cents(settings.paydayContribution), Math.max(0, cents(settings.lifeHappensTarget) - cents(beta.sampleFund)), cents(next.balance) + income) : 0;
    const id = `demo-payday-${activity.batch + 1}-${next.categorization.transactions.length}`;
    const transaction = normalizeBankPurchase(rawPurchase(id, 'Sample employer payday', -income / 100, activity.clock, 'INCOME'));
    return { ...next, balance: (cents(next.balance) + income - saved) / 100,
      categorization: demoTransfer(mergeCategoryPurchases(next.categorization, [], [transaction]), `${id}-savings`, saved, activity.clock),
      premiumBeta: { ...beta, sampleFund: (cents(beta.sampleFund) + saved) / 100 }, bankActivity: { ...activity, checkedAt: now.toISOString() } };
  }
  if (action.type === 'emergency') {
    const used = Math.min(5000, cents(beta.sampleFund));
    const purchase = normalizeBankPurchase(rawPurchase(`demo-emergency-${next.categorization.transactions.length}`, 'Sample emergency', used / 100, activity.clock, 'GENERAL_SERVICES', { account_id: 'sample-savings' }));
    return { ...next, categorization: used ? mergeCategoryPurchases(next.categorization, [], [purchase]) : next.categorization,
      premiumBeta: { ...beta, sampleFund: (cents(beta.sampleFund) - used) / 100 }, bankActivity: { ...activity, emergencySpentCents: (activity.emergencySpentCents || 0) + used } };
  }
  if (action.type === 'category') return { ...next, categorization: categoryAction(next.categorization, action.action) };
  throw new Error('Choose a demo bank action.');
}
