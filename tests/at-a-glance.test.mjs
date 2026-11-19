import test from 'node:test';
import assert from 'node:assert/strict';
import { atAGlance } from '../src/at-a-glance.mjs';
import { mirrorBudget } from '../src/smart-mirror.mjs';
import { categoryAction, mergeCategoryPurchases } from '../src/merchant-categories.mjs';
const now = new Date(2026, 10, 19, 12);
const fixture = () => ({ balance: 600, buffer: 70, nextPaycheck: 1800, nextPaycheckDate: '2026-12-02',
  daysUntilPayday: 999, bills: [
    { id: 'phone', name: 'Phone', amount: '80.00', dueDate: '2026-11-27' },
    { id: 'internet', name: 'Internet', amount: '62.38', dueDate: '2026-11-23' },
    { id: 'paid', amount: 500, paid: true }, { id: 'paid-status', amount: 900, status: 'Paid' },
  ], debts: [{ id: 'card', name: 'Credit card', balance: 1240, minimum: 30 }],
  savingsGoals: [{ id: 'fund', name: 'Emergency fund', savedCents: 15000, targetCents: 50000 }],
  categorization: mergeCategoryPurchases(undefined, [], [
    { id: 'one', accountId: 'manual-main', merchant: 'Store', date: '2026-11-18', amountCents: 5420, category: 'Groceries' },
    { id: 'two', accountId: 'manual-main', merchant: 'Cafe', date: '2026-11-18', amountCents: 2000, category: 'Dining' },
    { id: 'three', accountId: 'manual-main', merchant: 'Bus', date: '2026-11-19', amountCents: 1220, category: 'Transportation' },
    { id: 'old', accountId: 'manual-main', merchant: 'Old', date: '2026-10-31', amountCents: 9999 },
    { id: 'future', accountId: 'manual-main', merchant: 'Future', date: '2026-11-20', amountCents: 9999 },
  ]),
});
test('overview matches existing Budget, explains every reserve and never mutates the plan', () => {
  const finance = fixture(), original = structuredClone(finance), result = atAGlance(finance, now);
  assert.deepEqual(result.budget, mirrorBudget(finance));
  assert.equal(result.budget.available, 357.62);
  assert.equal(result.bills.reduce((n, b) => n + b.amountCents, 0), 14238);
  assert.deepEqual(result.bills.map(b => b.id), ['internet', 'phone']);
  assert.equal(result.debtBalanceCents, 124000);
  assert.equal(result.payday.days, 13, 'count is derived from date, not stale saved day count');
  assert.equal(result.spendingCents, 8640);
  assert.equal(result.goals[0].percent, 30);
  assert.equal(result.goals[0].remainingCents, 35000);
  assert.equal(result.balanceUpdatedAt, null, 'never invent a freshness timestamp');
  assert.deepEqual(finance, original);
  const updated = atAGlance({ ...finance, balance: 700, bills: finance.bills.map(b => b.id === 'phone' ? {...b, paid: true} : b) }, now);
  assert.equal(updated.budget.available, 537.62, 'edits appear without a separate copy of the data');
});
test('monthly spending honors remembered rules, splits and refunds exactly once', () => {
  const finance = fixture();
  finance.categorization = categoryAction(finance.categorization, {type:'categorize',id:'one',scope:'once',splits:[
    {category:'Groceries',amountCents:4000},{category:'Pets',amountCents:1420},
  ]});
  finance.categorization = categoryAction(finance.categorization, {type:'categorize',id:'two',scope:'all',category:'Coffee',includePast:true});
  finance.categorization = mergeCategoryPurchases(finance.categorization, [], [
    {id:'refund',accountId:'manual-main',merchant:'Bus',date:'2026-11-19',amountCents:-220,category:'Transportation'},
  ]);
  const result = atAGlance(finance, now);
  assert.equal(result.spendingCents, 8420);
  assert.deepEqual(Object.fromEntries(result.spending.map(s => [s.category,s.cents])), {Groceries:4000,Coffee:2000,Pets:1420,Transportation:1000});
  assert.equal(result.budget.available, 357.62);
});
test('missing and stale dates, shortfalls, empty plans and longer lists stay honest', () => {
  const empty = atAGlance({balance:0,bills:[],debts:[]}, now);
  assert.equal(empty.paydayDate, null); assert.equal(empty.payday.days, null);
  assert.equal(empty.spendingCents, 0); assert.deepEqual(empty.goals, []);
  const finance = fixture();
  finance.nextPaycheckDate = '2026-11-18';
  finance.bills = Array.from({length:25}, (_,i) => ({id:String(i),amount:30,name:`Bill ${i}`,dueDate:i === 0 ? '2026-11-01' : ''}));
  const result = atAGlance(finance, now);
  assert.equal(result.paydayDate, null);
  assert.equal(result.bills.length, 25, 'no bills are silently omitted to force a fixed screen');
  assert.equal(result.bills[0].overdue, true);
  assert.equal(result.bills[1].date, null);
  assert.equal(result.budget.available, 0); assert.equal(result.shortfallCents, 25000);
});
