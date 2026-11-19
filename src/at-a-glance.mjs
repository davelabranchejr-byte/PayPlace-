import { mirrorBudget } from './smart-mirror.mjs';
import { isPaid, localDate, paydaySnapshot } from './launch-essentials.mjs';
import { billDate } from './bill-reminders.mjs';
import { categoryState, purchaseCategory } from './merchant-categories.mjs';
import { savingsProgress } from './savings-goals.mjs';

const amountCents = value => {
  const cents = Math.round(Number(value) * 100);
  return Number.isSafeInteger(cents) ? Math.max(0, cents) : 0;
};

// Read-only: use Budget's existing calculation and never subtract purchase
// records from the balance. Remembered categories and splits stay authoritative.
export function atAGlance(finance, now = new Date()) {
  const budget = mirrorBudget(finance);
  const payday = paydaySnapshot(finance, now);
  const today = localDate(now);
  const categories = categoryState(finance.categorization);
  const spending = new Map();
  for (const transaction of categories.transactions) {
    if (!billDate(transaction.date) || transaction.date.slice(0, 7) !== today.slice(0, 7) || transaction.date > today) continue;
    const choice = purchaseCategory(categories, transaction);
    for (const part of choice.splits || [{ category: choice.category, amountCents: transaction.amountCents }]) {
      spending.set(part.category, (spending.get(part.category) || 0) + part.amountCents);
    }
  }
  const bills = (finance.bills || []).filter(bill => !isPaid(bill)).map(bill => {
    const due = billDate(bill.dueDate || bill.due);
    return { ...bill, amountCents: amountCents(bill.amount), date: due ? localDate(due) : null,
      overdue: Boolean(due && localDate(due) < today) };
  }).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));
  const debts = (finance.debts || []).map(debt => ({ ...debt,
    balanceCents: amountCents(debt.balance), minimumCents: amountCents(debt.minimum) }));
  const goals = (finance.savingsGoals || []).map(goal => ({ ...goal, ...savingsProgress(goal) }));
  return {
    budget, bills, debts, goals,
    debtBalanceCents: debts.reduce((sum, debt) => sum + debt.balanceCents, 0),
    paycheckCents: amountCents(finance.nextPaycheck), payday,
    paydayDate: payday.validPayday ? finance.nextPaycheckDate : null,
    spending: [...spending].map(([category, cents]) => ({ category, cents }))
      .sort((a, b) => b.cents - a.cents || a.category.localeCompare(b.category)),
    spendingCents: [...spending.values()].reduce((sum, cents) => sum + cents, 0),
    month: now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    balanceUpdatedAt: finance.balanceUpdatedAt || null,
    balanceSource: finance.balanceSource || 'Manual entry',
    shortfallCents: Math.max(0, Math.round((budget.bills + budget.debt + budget.buffer - budget.balance) * 100)),
  };
}
