import { isPaid } from './launch-essentials.mjs';
import { readDate } from './paycheck-calendar.mjs';

const milestones = ['firstBill', 'paidBill', 'foundNote', 'sentNote', 'savingsGoal', 'micropayment', 'plannedPayday', 'addedSavings', 'paidDebt', 'trackedSubscription', 'savedGrooming', 'borrowedBook', 'joinedFacebook', 'invitedFriend'];

export function quiltMilestones(finance) {
  if (!finance || finance.planSource === 'Sample') return [];
  const earned = new Set(finance.quiltMilestones);
  const bills = (finance.bills || []).filter(bill => bill.source !== 'Sample data');
  if (bills.length) earned.add('firstBill');
  if (bills.some(isPaid) || finance.paymentHistory?.some(event => event.kind === 'recorded')) {
    earned.add('firstBill');
    earned.add('paidBill');
  }
  if (finance.savingsGoals?.length) earned.add('savingsGoal');
  if (finance.micropayments?.length) earned.add('micropayment');
  if ((finance.firstWinComplete && readDate(finance.nextPaycheckDate)) ||
      Object.keys(finance.extraPaycheckPlans || {}).length || finance.extraPaychecks?.length) earned.add('plannedPayday');
  if (finance.savingsGoals?.some(goal => goal.savedCents > 0)) earned.add('addedSavings');
  if (finance.neighborEvents?.some(event => event.kind === 'debt')) earned.add('paidDebt');
  if (finance.subscriptions?.length) earned.add('trackedSubscription');
  if (finance.groomingAppointments?.length) earned.add('savedGrooming');
  if (Object.values(finance.neighborhoodLibrary?.loans || {}).some(loan => loan.automatic === false)) earned.add('borrowedBook');
  return milestones.filter(id => earned.has(id));
}

export function keepQuiltMilestones(before, after) {
  if (after.planSource === 'Sample') return after;
  const earned = new Set([...quiltMilestones(before), ...quiltMilestones(after)]);
  if (after.nextPaycheckDate !== before.nextPaycheckDate && readDate(after.nextPaycheckDate)) earned.add('plannedPayday');
  return earned.size ? { ...after, quiltMilestones: milestones.filter(id => earned.has(id)) } : after;
}

export function awardQuiltMilestone(finance, id) {
  if (finance.planSource === 'Sample' || !milestones.includes(id) || finance.quiltMilestones?.includes(id)) return finance;
  return keepQuiltMilestones(finance, { ...finance, quiltMilestones: [...(finance.quiltMilestones || []), id] });
}

export function validateQuiltMilestones(value) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > milestones.length ||
      value.some(id => !milestones.includes(id)) || new Set(value).size !== value.length) {
    throw new Error('Invalid Belonging Quilt squares.');
  }
}
