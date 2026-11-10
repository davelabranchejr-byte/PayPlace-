import { moneyCents } from './launch-essentials.mjs';

const rate = item => item.apr !== '' && item.apr != null && Number.isFinite(Number(item.apr)) && Number(item.apr) >= 0 ? Number(item.apr) : null;
export function micropaymentTargets(finance, sort = 'interest') {
  const amount = item => Number(item.type === 'debt' ? item.balance : item.amount) || 0;
  return [
    ...(finance.bills || []).map(bill => ({ ...bill, type: 'bill' })),
    ...(finance.debts || []).filter(debt => Number(debt.balance) > 0).map(debt => ({ ...debt, type: 'debt' })),
  ].map(item => ({ ...item, interestRate: rate(item) })).sort((a, b) => sort === 'amount'
    ? amount(a) - amount(b) || (b.interestRate ?? -1) - (a.interestRate ?? -1)
    : (b.interestRate ?? -1) - (a.interestRate ?? -1) || amount(a) - amount(b));
}

export function micropaymentTotal(finance) {
  return (finance.micropayments || []).filter(event => !event.undoneAt).reduce((sum, event) => sum + event.amountCents, 0);
}

export function recordMicropayment(finance, { type, targetId, amount }, now = Date.now()) {
  const amountCents = moneyCents(amount);
  if (amountCents <= 0) throw new Error('Enter a small payment greater than zero.');
  const target = micropaymentTargets(finance).find(item => item.type === type && item.id === targetId);
  if (!target) throw new Error('Choose a bill or an active debt.');
  const beforeBalanceCents = type === 'debt' ? moneyCents(Number(target.balance).toFixed(2)) : null;
  if (type === 'debt' && amountCents > beforeBalanceCents) throw new Error('This is more than the remaining debt balance.');
  const history = finance.micropayments || [];
  const event = {
    id: `micro-${now}-${history.length}`, type, targetId, name: target.name, amountCents, at: now,
    source: 'Manual record', beforeBalanceCents,
    afterBalanceCents: type === 'debt' ? beforeBalanceCents - amountCents : null,
  };
  return { ...finance, micropayments: [...history, event],
    ...(type === 'debt' ? { debts: finance.debts.map(debt => debt.id === targetId ? { ...debt, balance: event.afterBalanceCents / 100 } : debt) } : {}),
  };
}

export function canUndoMicropayment(finance, event) {
  if (!event || event.undoneAt) return false;
  if (event.type === 'bill') return true;
  const latest = (finance.micropayments || []).filter(item => item.type === 'debt' && item.targetId === event.targetId && !item.undoneAt).at(-1);
  const debt = (finance.debts || []).find(item => item.id === event.targetId);
  return latest?.id === event.id && !!debt && Math.round(Number(debt.balance) * 100) === event.afterBalanceCents;
}

export function undoMicropayment(finance, id, now = Date.now()) {
  const event = (finance.micropayments || []).find(item => item.id === id);
  if (!canUndoMicropayment(finance, event)) throw new Error('This debt has changed. Review its current balance before correcting the record.');
  return { ...finance, micropayments: finance.micropayments.map(item => item.id === id ? { ...item, undoneAt: now } : item),
    ...(event.type === 'debt' ? { debts: finance.debts.map(debt => debt.id === event.targetId ? { ...debt, balance: event.beforeBalanceCents / 100 } : debt) } : {}),
  };
}
