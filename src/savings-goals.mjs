export function savingsCents(value) {
  const text = String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) throw new Error('Enter a positive amount with up to two decimal places.');
  const cents = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(cents) || cents > 100000000000) throw new Error('That amount is too large.');
  return cents;
}
export function validateSavingsGoal(goal) {
  if (!goal || typeof goal.id !== 'string' || !goal.id || goal.id.length > 100 || typeof goal.name !== 'string' || !goal.name.trim() || goal.name.length > 100 ||
    !Number.isSafeInteger(goal.targetCents) || goal.targetCents <= 0 || goal.targetCents > 100000000000 ||
    !Number.isSafeInteger(goal.savedCents) || goal.savedCents < 0 || goal.savedCents > 100000000000) throw new Error('Invalid savings goal.');
  return goal;
}
export function saveSavingsGoal(goals, draft, id) {
  const goal = validateSavingsGoal({ id: draft.id || id, name: String(draft.name).trim(), targetCents: savingsCents(draft.target), savedCents: savingsCents(draft.saved || '0') });
  const exists = goals.some(item => item.id === goal.id);
  if (!exists && goals.length >= 100) throw new Error('You can keep up to 100 goals.');
  return exists ? goals.map(item => item.id === goal.id ? goal : item) : [...goals, goal];
}
export function contributeSavings(goals, id, amount) {
  const cents = savingsCents(amount);
  if (cents <= 0) throw new Error('Enter an amount greater than zero.');
  if (!goals.some(goal => goal.id === id)) throw new Error('That goal is no longer available.');
  return goals.map(goal => goal.id === id ? validateSavingsGoal({ ...goal, savedCents: goal.savedCents + cents }) : goal);
}
export function savingsProgress(goal) {
  validateSavingsGoal(goal);
  return { percent: Math.min(100, Math.floor(goal.savedCents / goal.targetCents * 100)), remainingCents: Math.max(0, goal.targetCents - goal.savedCents), complete: goal.savedCents >= goal.targetCents };
}
