import { isPaid } from './launch-essentials.mjs';
import { buildCalendar, dateKey, readDate } from './paycheck-calendar.mjs';

function cents(value) {
  const amount = Math.round(Number(value) * 100);
  return Number.isSafeInteger(amount) ? amount : 0;
}

export function monthEndOutlook(finance, now = new Date()) {
  const today = dateKey(now);
  const monthEnd = dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0, 12));
  const nextPayday = readDate(finance.nextPaycheckDate);
  const firstPayday = nextPayday ? dateKey(nextPayday) : '';
  const checks = buildCalendar(finance, now).events.filter(check =>
    check.date > today && check.amount > 0 && (check.type === 'bonus' || check.date >= firstPayday));
  const bills = (finance.bills || []).filter(bill => {
    const due = readDate(bill.dueDate || bill.due);
    return !isPaid(bill) && (!due || dateKey(due) <= monthEnd);
  });
  const balance = cents(finance.balance);
  const income = checks.reduce((sum, check) => sum + cents(check.amount), 0);
  const billsDue = bills.reduce((sum, bill) => sum + Math.max(0, cents(bill.amount)), 0);
  const debtMinimums = (finance.debts || []).filter(debt => Number(debt.balance) > 0)
    .reduce((sum, debt) => sum + Math.max(0, cents(debt.minimum)), 0);
  const buffer = Math.max(0, cents(finance.buffer));
  return { balance, income, billsDue, debtMinimums, buffer, estimate: balance + income - billsDue - debtMinimums - buffer };
}
