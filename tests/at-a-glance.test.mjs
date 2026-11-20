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
  assert.equal(result.paydayDate, '2026-11-18');
  assert.equal(result.payday.validPayday, false);
  assert.equal(result.bills.length, 25, 'no bills are silently omitted to force a fixed screen');
  assert.equal(result.bills[0].overdue, true);
  assert.equal(result.bills[1].date, null);
  assert.equal(result.budget.available, 0); assert.equal(result.shortfallCents, 25000);
});


test('Build 78 distinguishes payment reserves, debt balances, shortfalls and fractional savings', () => {
  const finance = {
    balance: 500, buffer: 100, nextPaycheckDate: '2026-12-02',
    bills: [{id:'card-bill', name:'Card', amount:100, debtId:'card'}],
    debts: [{id:'card',name:'Card',balance:10000,minimum:100},
      {id:'loan',name:'Loan',balance:10840,minimum:574}],
    savingsGoals:[{id:'fund',name:'Fund',savedCents:500,targetCents:100000}],
  };
  const original = structuredClone(finance);
  const result = atAGlance(finance, now);
  assert.equal(result.debtPaymentCents, 67400);
  assert.equal(result.debtBalanceCents, 2084000);
  assert.equal(result.budget.debt, 574);
  assert.equal(result.budget.available, 0);
  assert.equal(result.budget.balance, 500);
  assert.equal(result.shortfallCents, 27400);
  assert.equal(result.goals[0].percent, 0.5);
  assert.equal(result.hasPaycheckAmount, false);
  assert.equal(result.paydayDate, '2026-12-02');
  assert.deepEqual(finance, original);
});

test('legacy matching debt payments count once and ambiguous or different accounts stay reserved', () => {
  const base = {balance:1000,buffer:0,bills:[{id:'bill',name:'Credit Card',amount:100}],
    debts:[{id:'card',name:'credit card',balance:2000,minimum:100}]};
  assert.equal(atAGlance(base,now).budget.available,900);
  const otherAccount = {...base, bills:[{...base.bills[0],accountNumberLast4:'1111'}],
    debts:[{...base.debts[0],accountNumberLast4:'2222'}]};
  assert.equal(atAGlance(otherAccount,now).budget.available,800);
  assert.equal(atAGlance({...base, debts:[...base.debts,{id:'second',name:'Credit Card',balance:1000,minimum:100}]},now).budget.available,700);
  assert.equal(atAGlance({...base,bills:[{...base.bills[0],due:'2026-12-01'}],
    debts:[{...base.debts[0],due:'2026-11-20'}]},now).budget.available,800);
  assert.equal(atAGlance({...base,debts:[{...base.debts[0],balance:0}]},now).budget.debt,0);
});

test('linked partial payments reserve the remainder, and missing values remain distinct from zero', () => {
  const finance = {balance:1000,bills:[{id:'partial',debtId:'loan',amount:40}],
    debts:[{id:'loan',balance:2000,minimum:100}]};
  assert.equal(atAGlance(finance,now).budget.available,900);
  assert.equal(atAGlance({...finance,bills:[]},now).budget.available,900);
  const missing = atAGlance({balance:'',nextPaycheck:null,nextPaycheckDate:'',daysUntilPayday:3},now);
  assert.equal(missing.hasBalance,false);
  assert.equal(missing.hasPaycheckAmount,false);
  assert.equal(missing.paydayDate,null);
  const zeros = atAGlance({balance:0,nextPaycheck:0},now);
  assert.equal(zeros.hasBalance,true);
  assert.equal(zeros.hasPaycheckAmount,true);
});
