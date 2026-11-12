import test from 'node:test';
import assert from 'node:assert/strict';
import { awardQuiltMilestone, quiltMilestones, validateQuiltMilestones } from '../src/quilt-milestones.mjs';
import { recordActivity } from '../src/neighborhood-progress.mjs';

test('a personal quilt grows with real activity and keeps its squares after deletion', () => {
  const bill = { id: 'power', name: 'Power', status: 'Upcoming' };
  const original = { bills: [bill] };
  assert.deepEqual(quiltMilestones(original), ['firstBill']);
  let finance = recordActivity(original, { bills: [{ ...bill, status: 'Paid' }] });
  finance = recordActivity(finance, { bills: [], savingsGoals: [{}], micropayments: [{}] });
  finance = awardQuiltMilestone(finance, 'foundNote');
  assert.equal(awardQuiltMilestone(finance, 'foundNote'), finance);
  finance = awardQuiltMilestone(finance, 'sentNote');
  assert.deepEqual(quiltMilestones(finance), ['firstBill', 'paidBill', 'foundNote', 'sentNote', 'savingsGoal', 'micropayment']);
  assert.deepEqual(quiltMilestones(recordActivity(finance, {})), quiltMilestones(finance));
});

test('the sample neighborhood stays separate and old recorded payments count', () => {
  const sample = { planSource: 'Sample', bills: [{ paid: true }] };
  assert.equal(awardQuiltMilestone(sample, 'foundNote'), sample);
  assert.deepEqual(quiltMilestones(sample), []);
  assert.deepEqual(quiltMilestones({ paymentHistory: [{ kind: 'recorded' }] }), ['firstBill', 'paidBill']);
  assert.doesNotThrow(() => validateQuiltMilestones(undefined));
  assert.throws(() => validateQuiltMilestones(['firstBill', 'firstBill']), /Invalid/);
  assert.throws(() => validateQuiltMilestones(['unknown']), /Invalid/);
});

test('additional squares reflect personal planning, community and neighborhood actions', () => {
  const before = { bills: [], nextPaycheckDate: '', debts: [{ id: 'car', balance: 12 }] };
  let finance = recordActivity(before, {
    ...before,
    nextPaycheckDate: '2026-11-12',
    debts: [{ id: 'car', balance: 0 }],
    savingsGoals: [{ savedCents: 100 }],
    subscriptions: [{ id: 'music' }],
    groomingAppointments: [{ id: 'visit' }],
    neighborhoodLibrary: { loans: { book: { automatic: false } } },
  });
  finance = awardQuiltMilestone(awardQuiltMilestone(finance, 'joinedFacebook'), 'invitedFriend');
  assert.deepEqual(quiltMilestones(finance), ['savingsGoal', 'plannedPayday', 'addedSavings', 'paidDebt', 'trackedSubscription', 'savedGrooming', 'borrowedBook', 'joinedFacebook', 'invitedFriend']);
  assert.deepEqual(quiltMilestones({ neighborhoodLibrary: { loans: { book: { automatic: true } } } }), []);
});
