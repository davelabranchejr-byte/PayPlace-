import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBankPurchase, applyBankSnapshot, demoBankSnapshot, seedDemoBank, recurringCandidates, bankSpending, collectDemoRoundUps, demoBankAction } from '../src/bank-activity.mjs';
import { categoryAction, purchaseCategory } from '../src/merchant-categories.mjs';
import { updateSubscription } from '../src/subscription-detective.mjs';
const now = new Date(2026, 10, 8, 12);
const base = () => seedDemoBank({ bills: [], debts: [], nextPaycheck: 850, buffer: 20 }, now);

test('the demo and the future bank adapter use identical normalization and transaction records', () => {
  const raw = demoBankSnapshot(now), normalized = applyBankSnapshot({ bills: [], debts: [] }, raw, { now });
  assert.equal(normalized.categorization.transactions.length, 15);
  assert.equal(normalized.categorization.transactions.find(t => t.id === 'sample-target').category, 'Groceries');
  assert.throws(() => normalizeBankPurchase({ ...raw.added[0], iso_currency_code: 'EUR' }), /USD/);
  assert.throws(() => applyBankSnapshot({}, { ...raw, has_more: true }), /every page/);
  assert.equal(normalizeBankPurchase({ ...raw.added[0], amount: -850 }).amountCents, -85000);
});
test('recurring finder discovers real patterns, reports a price increase, and projects reviewable dates', () => {
  const candidates = recurringCandidates(base(), now);
  assert.deepEqual(candidates.map(c => c.name).sort(), ['CatFlix', 'Neighborhood Fitness', 'Pawtify']);
  const music = candidates.find(c => c.name === 'Pawtify');
  assert.equal(music.priceChangeCents, 100);
  assert.equal(music.frequency, 'Monthly');
  assert.equal(music.renewalDate, '2026-11-18');
  assert.equal(music.count, 4);
});
test('finder excludes ordinary groceries, pending duplicates, refunds and irregular charges', () => {
  const raw = demoBankSnapshot(now);
  const stream = raw.added.filter(t => t.merchant_name === 'CatFlix');
  const groceries = stream.map((t, i) => ({ ...t, transaction_id: `grocery-${i}`, merchant_name: 'Grocery store', merchant_entity_id: 'grocer', personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_GROCERIES' } }));
  const pending = stream.map((t, i) => ({ ...t, transaction_id: `pending-${i}`, merchant_entity_id: 'pending-only', merchant_name: 'Pending charges', pending: true }));
  const refunds = stream.map((t, i) => ({ ...t, transaction_id: `refund-${i}`, merchant_entity_id: 'refunds', merchant_name: 'Refunds', amount: -14.99 }));
  const irregular = stream.map((t, i) => ({ ...t, transaction_id: `irregular-${i}`, merchant_entity_id: 'irregular', merchant_name: 'Irregular', date: ['2026-07-01', '2026-07-02', '2026-09-15', '2026-10-27'][i] }));
  const finance = applyBankSnapshot({}, { ...raw, added: [...groceries, ...pending, ...refunds, ...irregular] }, { now });
  assert.equal(recurringCandidates(finance, now).length, 0);
});
test('confirming a detected subscription never duplicates its case or deducts money; dismissal stays reversible', () => {
  let finance = base(); const clue = recurringCandidates(finance, now)[0], before = finance.balance;
  const entry = { id: 'detected-case', name: clue.name, amount: clue.amountCents / 100, frequency: clue.frequency, renewalDate: clue.renewalDate, status: 'Review', detectionKey: clue.key };
  finance = updateSubscription(finance, { type: 'save', entry });
  finance = updateSubscription(finance, { type: 'save', entry });
  assert.equal(finance.subscriptions.length, 1);
  assert.equal(finance.balance, before);
  assert.equal(recurringCandidates(finance, now).some(c => c.key === clue.key), false);
  const next = recurringCandidates(finance, now)[0];
  finance = updateSubscription(finance, { type: 'dismiss-detected', key: next.key });
  assert.equal(recurringCandidates(finance, now).some(c => c.key === next.key), false);
  finance = updateSubscription(finance, { type: 'restore-detected' });
  assert.equal(recurringCandidates(finance, now).some(c => c.key === next.key), true);
});
test('saved merchant categories immediately change spending insights and future demo purchases', () => {
  let finance = base();
  const before = bankSpending(finance).find(c => c.category === 'Groceries').amountCents;
  finance.categorization = categoryAction(finance.categorization, { type: 'categorize', id: 'sample-costco', category: 'Groceries', scope: 'account', includePast: true });
  assert.equal(bankSpending(finance).find(c => c.category === 'Groceries').amountCents, before + 13000);
  finance = demoBankAction(finance, { type: 'purchase-batch' }, now);
  assert.equal(purchaseCategory(finance.categorization, finance.categorization.transactions.find(t => t.id === 'demo-costco-1')).category, 'Groceries');
});
test('round-ups debit fictional checking, credit savings, honor caps and never process history twice', () => {
  let finance = base();
  finance.premiumBeta.roundUpEnabled = true;
  finance.premiumResilience = { roundUpCap: 1.50, roundUpMultiplier: 2 };
  finance = demoBankAction(finance, { type: 'purchase-batch' }, now);
  assert.equal(finance.premiumBeta.roundUpSaved, 1.50);
  assert.equal(finance.premiumBeta.sampleFund, 101.50);
  assert.equal(finance.balance, 320 - 42.36 - 1.50);
  const repeated = collectDemoRoundUps(finance, now);
  assert.equal(repeated.balance, finance.balance);
  assert.equal(repeated.premiumBeta.sampleFund, 101.50);
  finance = demoBankAction(finance, { type: 'refresh' }, now);
  assert.equal(finance.premiumBeta.sampleFund, 101.50);
  finance = demoBankAction(finance, { type: 'next-week' }, now);
  assert.equal(finance.premiumBeta.roundUpSaved, 0);
  assert.equal(finance.premiumBeta.sampleFund, 101.50);
});
test('payday records income once per event, funds savings and keeps money conserved through an emergency', () => {
  let finance = base(); finance.premiumBeta.fundEnabled = true;
  finance.premiumResilience = { lifeHappensTarget: 120, paydayContribution: 50 };
  finance = demoBankAction(finance, { type: 'payday' }, now);
  assert.equal(finance.balance, 1150);
  assert.equal(finance.premiumBeta.sampleFund, 120);
  assert.equal(finance.categorization.transactions.find(t => t.merchant === 'Sample employer payday').amountCents, -85000);
  assert.equal(finance.categorization.transactions.filter(t => t.transfer).length, 2);
  const spendingBefore = bankSpending(finance).reduce((sum, t) => sum + t.amountCents, 0);
  finance = demoBankAction(finance, { type: 'emergency' }, now);
  assert.equal(finance.premiumBeta.sampleFund, 70);
  assert.equal(finance.bankActivity.emergencySpentCents, 5000);
  assert.equal(bankSpending(finance).reduce((sum, t) => sum + t.amountCents, 0), spendingBefore + 5000);
});
test('Plaid-style removed pending plus added posted preserves the category exception', () => {
  const raw = demoBankSnapshot(now);
  const pending = { ...raw.added[0], transaction_id: 'pending', pending: true };
  let finance = applyBankSnapshot({}, { ...raw, added: [pending] }, { now });
  finance.categorization = categoryAction(finance.categorization, { type: 'categorize', id: 'pending', category: 'Family fun', scope: 'once' });
  const posted = { ...pending, transaction_id: 'posted', pending_transaction_id: 'pending', pending: false };
  finance = applyBankSnapshot(finance, { ...raw, added: [posted], removed: [{ transaction_id: 'pending' }] }, { now });
  assert.equal(finance.categorization.transactions.length, 1);
  assert.equal(purchaseCategory(finance.categorization, finance.categorization.transactions[0]).category, 'Family fun');
});
