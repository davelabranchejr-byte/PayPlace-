import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizePremiumBeta, premiumAmount, simulatePayday, simulateRoundup } from '../src/premium-beta.mjs';
import { DEFAULT_PREMIUM_STATE, buildBillShockPlans } from '../src/premium-resilience.mjs';

test('locked logo retains the exact user-supplied bytes', () => {
  const original = readFileSync(new URL('../assets/branding/payplace-locked-logo.jpeg', import.meta.url));
  assert.equal(createHash('sha256').update(original).digest('hex'), 'f48af4b4f31db5dbc9ef0b81a0b2fda46777b6e30da7d203640a2df471af7afb');
});

test('sample automation requires both account connection and the feature switch', () => {
  for (const saved of [null, {}, { sampleConnected: true }, { roundUpEnabled: true, fundEnabled: true }]) {
    assert.equal(simulateRoundup(saved, DEFAULT_PREMIUM_STATE).added, 0);
    assert.equal(simulatePayday(saved, DEFAULT_PREMIUM_STATE).added, 0);
  }
});
test('sample weeks respect cumulative caps and lower caps never withdraw money', () => {
  const state = normalizePremiumBeta({ sampleConnected: true, roundUpEnabled: true });
  const first = simulateRoundup(state, { roundUpMultiplier: 2, roundUpCap: 1.25 });
  assert.equal(first.added, 1.25);
  const second = simulateRoundup(first.state, { roundUpMultiplier: 3, roundUpCap: 0.5 });
  assert.equal(second.added, 0);
  assert.equal(second.state.roundUpSaved, 1.25);
  assert.equal(state.roundUpSaved, 0, 'simulation does not mutate its input');
});
test('sample paydays respect cents, goals and pauses', () => {
  const state = normalizePremiumBeta({ sampleConnected: true, fundEnabled: true, sampleFund: 100.1 });
  const result = simulatePayday(state, { lifeHappensTarget: 100.25, paydayContribution: 20 });
  assert.equal(result.added, 0.15);
  assert.equal(result.state.sampleFund, 100.25);
  assert.equal(simulatePayday(result.state, { lifeHappensTarget: 100, paydayContribution: 20 }).added, 0);
  assert.equal(simulatePayday({ ...state, fundEnabled: false }, DEFAULT_PREMIUM_STATE).state.sampleFund, 100.1);
});
test('invalid money drafts and corrupt sample settings are safe', () => {
  for (const draft of ['', '.', '-1', 'NaN', '1e3', '12.345', '1000001', '1..2']) assert.equal(premiumAmount(draft), null, draft);
  assert.equal(premiumAmount('.05'), 0.05);
  assert.equal(premiumAmount('123.10'), 123.1);
  const normalized = normalizePremiumBeta({ sampleConnected: 'true', sampleFund: 'bad', roundUpSaved: -20, savedRecovery: { choice: 'loan', expense: 10 } });
  assert.equal(normalized.sampleConnected, false);
  assert.equal(normalized.sampleFund, 100);
  assert.equal(normalized.roundUpSaved, 0);
  assert.equal(normalized.savedRecovery, null);
});
test('gentlest recovery accounts for the cushion it preserves', () => {
  const plans = buildBillShockPlans({ expense: 500, lifeHappensBalance: 500, balance: 0, nextIncome: 1000 });
  assert.equal(plans.fastest.remaining, 0);
  assert.equal(plans.gentlest.fundUse, 250);
  assert.equal(plans.gentlest.remaining, 250);
  assert.ok(plans.gentlest.suggestedWeekly > 0, 'preserving half the fund leaves an expense to cover');
});
