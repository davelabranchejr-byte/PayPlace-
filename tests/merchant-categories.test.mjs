import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { categoryState, categoryAction, purchaseCategory, mergeCategoryPurchases, sampleCategoryState, categoryAmountCents, validateCategoryState } from '../src/merchant-categories.mjs';
import { createVaultStorage, FINANCE_KEY } from '../src/vault-storage.mjs';
import { createBackup, restoreBackup, validateBackup } from '../src/security-crypto.mjs';

const purchase = (id, accountId = 'a', merchant = 'Costco', category = 'Shopping') => ({ id, accountId, merchant, category, amountCents: 13000, date: '2026-11-08' });
const fixture = () => mergeCategoryPurchases(undefined, [{ id: 'a', name: 'Checking' }, { id: 'b', name: 'Card' }], [purchase('old'), purchase('card-old', 'b')]);
const choice = (state, id) => purchaseCategory(state, state.transactions.find(t => t.id === id));
const categorize = (state, id, category, scope = 'account', includePast = false) => categoryAction(state, { type: 'categorize', id, category, scope, includePast });

test('future-only rule leaves earlier purchases alone, applies only to its account, and survives refresh', () => {
  const original = fixture();
  let state = mergeCategoryPurchases(original, [], [purchase('current')]);
  state = categorize(state, 'current', 'Groceries');
  assert.equal(choice(state, 'old').category, 'Shopping');
  state = mergeCategoryPurchases(state, [], [purchase('new'), purchase('new-card', 'b')]);
  assert.equal(choice(state, 'new').category, 'Groceries');
  assert.equal(choice(state, 'new-card').category, 'Shopping');
  state = mergeCategoryPurchases(state, [], [{ ...purchase('new'), category: 'Clothing' }]);
  assert.equal(choice(state, 'new').category, 'Groceries');
  assert.equal(original.rules.length, 0);
});
test('account-specific choice wins over global; one-time exceptions win over both', () => {
  let state = categorize(fixture(), 'old', 'Shopping', 'all', true);
  state = categorize(state, 'card-old', 'Clothing', 'account', true);
  state = mergeCategoryPurchases(state, [], [purchase('new-a'), purchase('new-b', 'b')]);
  assert.equal(choice(state, 'new-a').category, 'Shopping');
  assert.equal(choice(state, 'new-b').category, 'Clothing');
  state = categorize(state, 'new-b', 'Electronics', 'once');
  state = categorize(state, 'old', 'Groceries', 'all', true);
  assert.equal(choice(state, 'new-b').category, 'Electronics');
});
test('updating past purchases respects deliberate exceptions and exact-cent splits', () => {
  let state = fixture();
  state = categoryAction(state, { type: 'categorize', id: 'card-old', scope: 'once', splits: [{ category: 'Clothing', amountCents: 3000 }, { category: 'Groceries', amountCents: 10000 }] });
  state = mergeCategoryPurchases(state, [], [purchase('current'), purchase('untouched')]);
  state = categorize(state, 'current', 'Household', 'all', true);
  assert.equal(choice(state, 'old').category, 'Household');
  assert.equal(choice(state, 'untouched').category, 'Household');
  assert.equal(choice(state, 'card-old').splits[0].amountCents, 3000);
  assert.throws(() => categoryAction(state, { type: 'categorize', id: 'old', scope: 'once', splits: [{ category: 'A', amountCents: 3000 }, { category: 'B', amountCents: 9999 }] }), /add up/);
});
test('matching is conservative and user-defined categories are supported', () => {
  let state = categorize(fixture(), 'old', 'Family essentials', 'all', true);
  state = mergeCategoryPurchases(state, [], [purchase('same', 'a', '  COSTCO  '), purchase('gas', 'a', 'Costco Gas'), purchase('target', 'a', 'Target')]);
  assert.equal(choice(state, 'same').category, 'Family essentials');
  assert.equal(choice(state, 'gas').category, 'Shopping');
  assert.equal(choice(state, 'target').category, 'Shopping');
  state = mergeCategoryPurchases(state, [], [{ ...purchase('entity1', 'a', 'Store'), merchantId: 'first' }]);
  state = categorize(state, 'entity1', 'Groceries', 'all', true);
  state = mergeCategoryPurchases(state, [], [{ ...purchase('entity2', 'a', 'Store'), merchantId: 'second' }]);
  assert.equal(choice(state, 'entity2').category, 'Shopping');
});
test('pending-to-posted refresh carries one-time choices and never duplicates the purchase', () => {
  let state = categorize(fixture(), 'old', 'Electronics', 'once');
  state = mergeCategoryPurchases(state, [], [{ ...purchase('posted'), pendingTransactionId: 'old', category: 'Groceries' }]);
  assert.equal(state.transactions.length, 2);
  assert.equal(choice(state, 'posted').category, 'Electronics');
  assert.equal(state.transactions.find(t => t.id === 'posted').sequence, 1);
  assert.throws(() => mergeCategoryPurchases(state, [], [purchase('posted', 'b')]), /cannot change accounts/);
});
test('deletion does not reuse the sequence or postpone remembered preferences', () => {
  let state = categorize(fixture(), 'card-old', 'Groceries');
  state = categoryAction(state, { type: 'delete-purchase', id: 'card-old' });
  state = mergeCategoryPurchases(state, [], [purchase('next', 'b')]);
  assert.equal(choice(state, 'next').category, 'Groceries');
});
test('rules can be edited and forgotten without changing one-time choices', () => {
  let state = categorize(fixture(), 'old', 'Groceries', 'account', true);
  state = mergeCategoryPurchases(state, [], [purchase('next')]);
  const id = state.rules[0].id;
  state = categoryAction(state, { type: 'edit-rule', id, category: 'Shopping' });
  assert.equal(choice(state, 'next').category, 'Shopping');
  assert.equal(choice(state, 'old').category, 'Groceries');
  state = categoryAction(state, { type: 'delete-rule', id });
  assert.equal(choice(state, 'next').source, 'Original category');
});
test('categories, account rules and split exceptions survive encrypted reopen and portable backup', async () => {
  let state = categorize(fixture(), 'old', 'Groceries', 'all', true);
  state = categoryAction(state, { type: 'categorize', id: 'card-old', scope: 'once', splits: [{ category: 'Clothing', amountCents: 3000 }, { category: 'Groceries', amountCents: 10000 }] });
  const finance = { bills: [], debts: [], balance: 123.45, categorization: state };
  const records = new Map(); let key;
  const adapters = { storage: { getItem: async k => records.get(k) ?? null, setItem: async (k, v) => records.set(k, v), removeItem: async k => records.delete(k) }, readKey: async () => key, writeKey: async v => { key = v; }, randomBytes: n => new Uint8Array(randomBytes(n)) };
  await createVaultStorage(adapters).setItem(FINANCE_KEY, JSON.stringify(finance));
  const reopened = JSON.parse(await createVaultStorage(adapters).getItem(FINANCE_KEY));
  assert.deepEqual(reopened.categorization, state);
  assert.ok([...records.values()].every(v => !v.includes('Costco')));
  const backup = await createBackup(finance, {}, 'A long test password!', adapters.randomBytes);
  assert.deepEqual((await restoreBackup(backup, 'A long test password!')).finance.categorization, state);
  assert.equal(reopened.balance, 123.45);
  assert.throws(() => validateBackup({ schema: 'payplace-manual-v1', finance: { ...finance, categorization: { ...state, overrides: [{ transactionId: 'unknown', category: 'Shopping' }] } } }), /Invalid purchase category/);
});
test('old plans need no migration; sample data remains independent; invalid cents and duplicate IDs are rejected', () => {
  validateCategoryState(undefined);
  assert.equal(categoryState().transactions.length, 0);
  const sample = sampleCategoryState();
  assert.equal(sample.transactions.length, 3);
  assert.equal(categoryState().transactions.length, 0);
  assert.equal(categoryAmountCents('123.10'), 12310);
  for (const text of ['1.001', '-1', '0', 'NaN', 'Infinity']) assert.throws(() => categoryAmountCents(text));
  assert.throws(() => categoryAction(fixture(), { type: 'add-purchase', purchase: purchase('old') }), /duplicate/);
});
