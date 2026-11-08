// User choices are kept separately from imported categories. A bank refresh can
// update its own fields without replacing an exception or remembered preference.
export const CATEGORY_CHOICES = Object.freeze(['Shopping', 'Clothing', 'Groceries', 'Household', 'Dining', 'Transportation', 'Health', 'Pets', 'Entertainment', 'Other']);
export const DEFAULT_CATEGORY_ACCOUNT = Object.freeze({ id: 'manual-main', name: 'My everyday account' });
const label = (value, max = 80) => typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
export function merchantNameKey(name) {
  // Deliberately conservative: Costco Gas must not become Costco groceries.
  return String(name || '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
}
export function merchantKey(transaction) {
  return transaction.merchantId ? `entity:${transaction.merchantId}` : `name:${merchantNameKey(transaction.merchant)}`;
}
export function categoryState(value) {
  return value || { version: 1, accounts: [{ ...DEFAULT_CATEGORY_ACCOUNT }], transactions: [], rules: [], overrides: [] };
}
export function validateCategoryState(value) {
  if (value === undefined) return;
  if (!value || value.version !== 1 || !['accounts', 'transactions', 'rules', 'overrides'].every(k => Array.isArray(value[k]))) throw new Error('Invalid remembered categories.');
  const unique = (items, field, max) => {
    if (items.length > max || items.some(item => !item || !label(item[field], 300)) || new Set(items.map(item => item[field])).size !== items.length) throw new Error('Invalid or duplicate category entries.');
  };
  unique(value.accounts, 'id', 200); unique(value.transactions, 'id', 5000); unique(value.rules, 'id', 2000); unique(value.overrides, 'transactionId', 5000);
  const accounts = new Set(value.accounts.map(a => a.id));
  if (value.nextSequence !== undefined && (!Number.isSafeInteger(value.nextSequence) || value.nextSequence < 1)) throw new Error('Invalid category sequence.');
  if (!accounts.size || value.accounts.some(a => !label(a.name))) throw new Error('Name each category account.');
  if (value.transactions.some(t => !accounts.has(t.accountId) || !label(t.merchant) || !Number.isSafeInteger(t.amountCents) || !Number.isSafeInteger(t.sequence) || t.sequence < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(t.date) || (t.category !== undefined && !label(t.category, 40)) || (t.merchantId !== undefined && !label(t.merchantId, 200)))) throw new Error('Invalid purchase details.');
  if (value.rules.some(r => !label(r.merchant) || !label(r.merchantKey, 240) || r.merchantKey !== merchantKey(r) || (r.accountId !== null && !accounts.has(r.accountId)) || !label(r.category, 40) || !Number.isSafeInteger(r.fromSequence) || r.fromSequence < 1)) throw new Error('Invalid merchant preference.');
  const ids = new Map(value.transactions.map(t => [t.id, t]));
  for (const entry of value.overrides) {
    const transaction = ids.get(entry.transactionId);
    if (!transaction || (!entry.splits && !label(entry.category, 40))) throw new Error('Invalid purchase category.');
    if (entry.splits) validateSplits(transaction, entry.splits);
  }
}
function validateSplits(transaction, splits) {
  if (!Array.isArray(splits) || splits.length < 2 || splits.length > 20 || splits.some(s => !label(s.category, 40) || !Number.isSafeInteger(s.amountCents) || s.amountCents <= 0) || splits.reduce((sum, s) => sum + s.amountCents, 0) !== transaction.amountCents) throw new Error('Split amounts must add up to the purchase total, to the cent.');
}
function matches(rule, transaction) {
  return (rule.merchantKey === merchantKey(transaction) || (!rule.merchantId && merchantNameKey(rule.merchant) === merchantNameKey(transaction.merchant))) && (rule.accountId === null || rule.accountId === transaction.accountId) && transaction.sequence >= rule.fromSequence;
}
export function purchaseCategory(value, transaction) {
  const state = categoryState(value);
  const override = state.overrides.find(o => o.transactionId === transaction.id);
  if (override) return override.splits ? { category: 'Split purchase', splits: override.splits, source: 'Your split' } : { category: override.category, source: 'Your choice' };
  const pick = accountId => {
    const matching = state.rules.filter(r => r.accountId === accountId && matches(r, transaction));
    return matching.find(r => r.merchantKey === merchantKey(transaction)) || matching[0];
  };
  const rule = pick(transaction.accountId) || pick(null);
  return rule ? { category: rule.category, source: 'Remembered' } : { category: transaction.category || 'Uncategorized', source: transaction.category ? 'Original category' : 'Choose a category' };
}
const nextSequence = state => Math.max(0, (state.nextSequence || 1) - 1, ...state.transactions.map(t => t.sequence)) + 1;
export function categoryAction(value, action) {
  const state = categoryState(value);
  let next;
  if (action.type === 'add-account') {
    next = { ...state, accounts: [...state.accounts, { id: action.id, name: action.name.trim() }] };
  } else if (action.type === 'add-purchase') {
    next = { ...state, nextSequence: nextSequence(state) + 1, transactions: [...state.transactions, { ...action.purchase, merchant: action.purchase.merchant.trim(), sequence: nextSequence(state) }] };
  } else if (action.type === 'delete-purchase') {
    next = { ...state, transactions: state.transactions.filter(t => t.id !== action.id), overrides: state.overrides.filter(o => o.transactionId !== action.id) };
  } else if (action.type === 'delete-rule') {
    next = { ...state, rules: state.rules.filter(r => r.id !== action.id) };
  } else if (action.type === 'edit-rule') {
    const rule = state.rules.find(r => r.id === action.id);
    if (!rule) throw new Error('This remembered choice is no longer here.');
    next = { ...state, rules: state.rules.map(r => r.id === action.id ? { ...r, category: action.category } : r) };
  } else if (action.type === 'categorize') {
    const transaction = state.transactions.find(t => t.id === action.id);
    if (!transaction) throw new Error('This purchase is no longer here.');
    if (!['once', 'account', 'all'].includes(action.scope)) throw new Error('Choose where to remember this category.');
    if (action.splits) {
      if (action.scope !== 'once') throw new Error('A split applies to this purchase only.');
      validateSplits(transaction, action.splits);
    } else if (!label(action.category, 40)) throw new Error('Choose or name a category.');
    const override = action.splits ? { transactionId: transaction.id, splits: action.splits } : { transactionId: transaction.id, category: action.category.trim() };
    next = { ...state, overrides: [...state.overrides.filter(o => o.transactionId !== transaction.id), override] };
    if (action.scope !== 'once') {
      const key = merchantKey(transaction), accountId = action.scope === 'account' ? transaction.accountId : null;
      const id = JSON.stringify([key, accountId]);
      const prior = state.rules.find(r => r.id === id);
      const rule = { id, merchantKey: key, merchant: transaction.merchant, ...(transaction.merchantId ? { merchantId: transaction.merchantId } : {}), accountId, category: action.category.trim(), fromSequence: action.includePast ? 1 : prior?.fromSequence || nextSequence(state) };
      next.rules = [...state.rules.filter(r => r.id !== id), rule];
    }
  } else throw new Error('Unknown category update.');
  validateCategoryState(next);
  return next;
}
// Adapter for a future transaction feed. Requires stable account and purchase
// IDs; it does not fetch bank data or infer a broad merchant from a descriptor.
export function mergeCategoryPurchases(value, accounts, purchases) {
  const state = categoryState(value);
  const next = { ...state, accounts: [...state.accounts], transactions: [...state.transactions], overrides: [...state.overrides] };
  for (const account of accounts) {
    next.accounts = [...next.accounts.filter(a => a.id !== account.id), { ...account }];
  }
  let sequence = nextSequence(state);
  for (const purchase of purchases) {
    const prior = next.transactions.find(t => t.id === purchase.id || (purchase.pendingTransactionId && t.id === purchase.pendingTransactionId));
    if (prior && prior.accountId !== purchase.accountId) throw new Error('A refreshed purchase cannot change accounts.');
    if (prior && prior.id !== purchase.id) next.overrides = next.overrides.map(o => o.transactionId === prior.id ? { ...o, transactionId: purchase.id } : o);
    next.transactions = [...next.transactions.filter(t => t.id !== prior?.id && t.id !== purchase.id), { ...prior, ...purchase, sequence: prior?.sequence || sequence++ }];
  }
  next.nextSequence = sequence;
  validateCategoryState(next);
  return next;
}
export function sampleCategoryState(date = '2026-11-08') {
  return mergeCategoryPurchases(undefined, [{ id: 'sample-checking', name: 'Sample checking' }, { id: 'sample-card', name: 'Sample card' }], [
    { id: 'sample-costco', accountId: 'sample-checking', merchant: 'Costco', amountCents: 13000, date, category: 'Shopping' },
    { id: 'sample-target', accountId: 'sample-checking', merchant: 'Target', amountCents: 5499, date, category: 'Groceries' },
    { id: 'sample-costco-card', accountId: 'sample-card', merchant: 'Costco', amountCents: 2750, date, category: 'Shopping' },
  ]);
}
export function categoryAmountCents(text) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(text).trim())) throw new Error('Enter an amount with up to two decimal places.');
  const [whole, fraction = ''] = String(text).trim().split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error('Enter an amount above zero.');
  return cents;
}
