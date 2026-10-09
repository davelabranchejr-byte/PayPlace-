import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PREMIUM_STATE,
  roundUpForPurchase,
  cappedRoundUps,
  applyLifeHappensContribution,
  useLifeHappensFund,
  buildBillShockPlans,
  buildCatchUpPlan,
  recoveryMessage,
} from '../src/premium-resilience.mjs';

test('roundups calculate correctly', () => {
  assert.equal(roundUpForPurchase(4.22), 0.78);
  assert.equal(roundUpForPurchase(12.48), 0.52);
  assert.equal(roundUpForPurchase(10), 0);
  assert.equal(roundUpForPurchase(4.22, 2), 1.56);
});

test('roundup cap is respected', () => {
  assert.equal(cappedRoundUps([4.22, 12.48, 7.01], 1, 1.5), 1.5);
});

test('life happens fund contributes and rebuilds', () => {
  const state = { ...DEFAULT_PREMIUM_STATE, rebuildMode: true, lifeHappensBalance: 100 };
  const next = applyLifeHappensContribution(state, 50, 'payday');
  assert.equal(next.lifeHappensBalance, 150);
  assert.equal(next.lastContribution.source, 'payday');
});

test('using emergency fund never overspends it', () => {
  const result = useLifeHappensFund({ ...DEFAULT_PREMIUM_STATE, lifeHappensBalance: 200 }, 450);
  assert.equal(result.used, 200);
  assert.equal(result.remainingExpense, 250);
  assert.equal(result.state.rebuildMode, true);
});

test('bill shock produces four recovery choices', () => {
  const plans = buildBillShockPlans({ expense: 800, balance: 300, nextIncome: 500, upcomingEssentialBills: 400, lifeHappensBalance: 250 });
  assert.equal(plans.useFund.fundUse, 250);
  assert.ok(plans.fastest);
  assert.ok(plans.balanced);
  assert.ok(plans.gentlest);
});

test('catch-up prioritizes overdue essentials', () => {
  const plan = buildCatchUpPlan({
    availableCash: 300,
    bills: [
      { id: 'streaming', category: 'other', amount: 25, overdue: true },
      { id: 'rent', category: 'housing', amount: 500, overdue: true },
      { id: 'power', category: 'utilities', amount: 120, overdue: false, daysUntilDue: 1 },
    ],
  });
  assert.equal(plan.steps[0].id, 'rent');
  assert.equal(plan.steps[0].recommendedPayment, 300);
  assert.equal(plan.steps[1].recommendedPayment, 0);
});

test('recovery copy is shame-free and reflects rebuild state', () => {
  const message = recoveryMessage({ ...DEFAULT_PREMIUM_STATE, rebuildMode: true, lifeHappensBalance: 125 });
  assert.match(message, /did its job/i);
  assert.match(message, /375\.00/);
});
