import test from 'node:test';
import assert from 'node:assert/strict';
import { savingsCents, saveSavingsGoal, contributeSavings, savingsProgress } from '../src/savings-goals.mjs';
import { validateBackup } from '../src/security-crypto.mjs';
test('savings preserve cents, support corrections, and celebrate reaching or exceeding target', () => {
  let goals = saveSavingsGoal([], { name: ' Trip ', target: '10.10', saved: '0.01' }, 'trip');
  goals = contributeSavings(goals, 'trip', '10.09');
  assert.equal(goals[0].savedCents, 1010);
  assert.deepEqual(savingsProgress(goals[0]), { percent: 100, remainingCents: 0, complete: true });
  goals = contributeSavings(goals, 'trip', '1.00');
  assert.equal(savingsProgress(goals[0]).percent, 100);
  goals = saveSavingsGoal(goals, { id: 'trip', name: 'Trip', target: '20', saved: '5.55' });
  assert.equal(goals.length, 1); assert.equal(goals[0].savedCents, 555);
  assert.equal(savingsProgress(goals[0]).remainingCents, 1445);
});
test('savings reject malformed, negative, zero target, overflow and missing goals', () => {
  for (const value of ['NaN', 'Infinity', '-1', '1.001', '1..2', '', '999999999999']) assert.throws(() => savingsCents(value));
  assert.throws(() => saveSavingsGoal([], { name: '', target: '10' }, 'a'));
  assert.throws(() => saveSavingsGoal([], { name: 'A', target: '0' }, 'a'));
  assert.throws(() => contributeSavings([], 'a', '1'));
});
test('backup validation accepts savings and rejects corrupt or duplicate goals', () => {
  const goal = saveSavingsGoal([], { name: 'Buffer', target: '100', saved: '2.50' }, 'buffer')[0];
  const base = { schema: 'payplace-manual-v1', finance: { bills: [], debts: [], savingsGoals: [goal] }, profile: {} };
  assert.doesNotThrow(() => validateBackup(base));
  assert.throws(() => validateBackup({ ...base, finance: { ...base.finance, savingsGoals: [goal, goal] } }));
  assert.throws(() => validateBackup({ ...base, finance: { ...base.finance, savingsGoals: [{ ...goal, savedCents: -1 }] } }));
});
