import { cappedRoundUps, money } from './premium-resilience.mjs';

// Isolated sample state never feeds into real balances or bills.
export const SAMPLE_PURCHASES = Object.freeze([4.22, 12.48, 7.01, 18.65]);
export const SAMPLE_FINANCE = Object.freeze({ balance: 320, nextPaycheck: 850, bills: [
  { id: 'sample-rent', name: 'Housing', amount: 600, category: 'housing', overdue: true },
  { id: 'sample-power', name: 'Electricity', amount: 120, category: 'utilities', overdue: true },
  { id: 'sample-phone', name: 'Phone', amount: 65, category: 'other', daysUntilDue: 3 },
] });
export function normalizePremiumBeta(value) {
  const saved = value && typeof value === 'object' ? value : {};
  const amount = (key, fallback) => Number.isFinite(Number(saved[key])) ? Math.max(0, money(saved[key])) : fallback;
  return { sampleConnected: saved.sampleConnected === true, useSamplePlan: saved.useSamplePlan === true,
    roundUpEnabled: saved.roundUpEnabled === true, fundEnabled: saved.fundEnabled === true,
    roundUpSaved: amount('roundUpSaved', 0), sampleFund: amount('sampleFund', 100),
    roundupRuns: Math.min(100000, Math.floor(amount('roundupRuns', 0))),
    creditRefreshes: Math.min(100000, Math.floor(amount('creditRefreshes', 0))),
    watchRefreshes: Math.min(100000, Math.floor(amount('watchRefreshes', 0))),
    savedRecovery: saved.savedRecovery && ['fastest', 'balanced', 'gentlest'].includes(saved.savedRecovery.choice)
      && Number.isFinite(Number(saved.savedRecovery.expense))
      ? { choice: saved.savedRecovery.choice, expense: Math.max(0, money(saved.savedRecovery.expense)) } : null };
}
export function simulateRoundup(value, settings) {
  const state = normalizePremiumBeta(value);
  if (!state.sampleConnected || !state.roundUpEnabled) return { state, added: 0 };
  const remaining = Math.max(0, money(settings.roundUpCap) - state.roundUpSaved);
  const added = cappedRoundUps(SAMPLE_PURCHASES, settings.roundUpMultiplier, remaining);
  return { added, state: { ...state, roundUpSaved: money(state.roundUpSaved + added), roundupRuns: state.roundupRuns + 1 } };
}
export function simulatePayday(value, settings) {
  const state = normalizePremiumBeta(value);
  if (!state.sampleConnected || !state.fundEnabled) return { state, added: 0 };
  const added = money(Math.min(Math.max(0, money(settings.lifeHappensTarget) - state.sampleFund), Math.max(0, money(settings.paydayContribution))));
  return { added, state: { ...state, sampleFund: money(state.sampleFund + added) } };
}
export function premiumAmount(text) {
  const raw = String(text).trim();
  if (!/^(?:\d+\.?\d{0,2}|\.\d{1,2})$/.test(raw)) return null;
  const number = Number(raw);
  return Number.isFinite(number) && number <= 1000000 ? money(number) : null;
}
