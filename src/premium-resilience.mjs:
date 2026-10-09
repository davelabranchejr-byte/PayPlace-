export const DEFAULT_PREMIUM_STATE = Object.freeze({
  lifeHappensTarget: 500,
  lifeHappensBalance: 0,
  paydayContribution: 20,
  roundUpMultiplier: 1,
  roundUpCap: 25,
  roundUpPot: 0,
  rebuildMode: false,
});

export function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export function roundUpForPurchase(amount, multiplier = 1) {
  const purchase = Math.max(0, money(amount));
  if (!purchase) return 0;
  const cents = Math.round(purchase * 100);
  const nextDollar = Math.ceil(cents / 100) * 100;
  const base = nextDollar === cents ? 0 : (nextDollar - cents) / 100;
  return money(base * Math.max(0, Number(multiplier) || 0));
}

export function cappedRoundUps(purchases = [], multiplier = 1, cap = Infinity) {
  const total = purchases.reduce((sum, value) => sum + roundUpForPurchase(value, multiplier), 0);
  return money(Math.min(total, Number.isFinite(Number(cap)) ? Math.max(0, Number(cap)) : total));
}

export function applyLifeHappensContribution(state, amount, source = 'manual') {
  const contribution = Math.max(0, money(amount));
  const target = Math.max(0, money(state.lifeHappensTarget));
  const balance = money(Math.min(target || Infinity, money(state.lifeHappensBalance) + contribution));
  return {
    ...state,
    lifeHappensBalance: balance,
    lastContribution: { amount: contribution, source },
    rebuildMode: balance < target && state.rebuildMode,
  };
}

export function useLifeHappensFund(state, amount) {
  const requested = Math.max(0, money(amount));
  const available = Math.max(0, money(state.lifeHappensBalance));
  const used = money(Math.min(requested, available));
  return {
    state: {
      ...state,
      lifeHappensBalance: money(available - used),
      rebuildMode: used > 0,
      lastFundUse: used,
    },
    used,
    remainingExpense: money(requested - used),
  };
}

export function buildBillShockPlans({ expense, balance = 0, nextIncome = 0, upcomingEssentialBills = 0, lifeHappensBalance = 0 }) {
  const shock = Math.max(0, money(expense));
  const cashAfterEssentials = Math.max(0, money(balance + nextIncome - upcomingEssentialBills));
  const fundUse = Math.min(shock, Math.max(0, money(lifeHappensBalance)));
  const afterFund = money(shock - fundUse);
  const immediatelyCoverable = Math.min(afterFund, cashAfterEssentials);
  const unresolved = money(afterFund - immediatelyCoverable);
  const periods = unresolved <= 0 ? 0 : Math.max(1, Math.ceil(unresolved / Math.max(25, nextIncome * 0.08 || 25)));

  return {
    expense: shock,
    useFund: {
      label: 'Use My Life Happens Fund',
      fundUse: money(fundUse),
      remaining: money(shock - fundUse),
    },
    fastest: {
      label: 'Fastest',
      payNow: money(Math.min(shock, fundUse + cashAfterEssentials)),
      remaining: money(Math.max(0, shock - fundUse - cashAfterEssentials)),
    },
    balanced: {
      label: 'Balanced',
      fundUse: money(fundUse),
      payment: periods ? money(unresolved / periods) : 0,
      periods,
    },
    gentlest: {
      label: 'Gentlest',
      fundUse: money(Math.min(fundUse, shock * 0.5)),
      suggestedWeekly: unresolved ? money(Math.max(10, unresolved / Math.max(4, periods * 2))) : 0,
    },
  };
}

const PRIORITY = {
  housing: 1,
  utilities: 2,
  food: 3,
  transportation: 4,
  insurance: 5,
  medical: 6,
  minimum_debt: 7,
  other: 20,
};

export function buildCatchUpPlan({ bills = [], availableCash = 0, nextIncome = 0 }) {
  const resources = money(Math.max(0, Number(availableCash) || 0) + Math.max(0, Number(nextIncome) || 0));
  const normalized = bills
    .map((bill, index) => ({
      ...bill,
      id: bill.id ?? `bill-${index}`,
      amount: Math.max(0, money(bill.amount)),
      overdue: Boolean(bill.overdue),
      priority: PRIORITY[bill.category] ?? PRIORITY.other,
    }))
    .sort((a, b) => (b.overdue - a.overdue) || (a.priority - b.priority) || ((a.daysUntilDue ?? 9999) - (b.daysUntilDue ?? 9999)));

  let remaining = resources;
  const steps = normalized.map((bill) => {
    const pay = money(Math.min(bill.amount, remaining));
    remaining = money(remaining - pay);
    return {
      ...bill,
      recommendedPayment: pay,
      shortfall: money(bill.amount - pay),
      protected: bill.priority <= PRIORITY.minimum_debt,
    };
  });

  return {
    resources,
    assigned: money(resources - remaining),
    remaining,
    totalShortfall: money(steps.reduce((sum, bill) => sum + bill.shortfall, 0)),
    steps,
  };
}

export function recoveryMessage(state) {
  const target = Math.max(0, money(state.lifeHappensTarget));
  const balance = Math.max(0, money(state.lifeHappensBalance));
  if (!state.rebuildMode) return 'Your cushion is ready when real life gets loud.';
  if (balance >= target) return 'Your cushion is rebuilt. You did exactly what it was there to do.';
  return `Your cushion did its job. PayPlace will quietly help rebuild the remaining $${money(target - balance).toFixed(2)}.`;
}
