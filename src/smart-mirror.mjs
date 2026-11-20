// Integer cents keep the mirror's boundaries consistent with the saved budget.
export function parseAmount(value) {
  const text = String(value ?? "").trim().replace(/^\$\s*/, "");
  if (!/^(?:(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?|\.\d{1,2})$/.test(text)) return null;
  const cents = Math.round(Number(text.replace(/,/g, "")) * 100);
  return Number.isSafeInteger(cents) ? cents / 100 : null;
}

function cents(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && Number.isSafeInteger(Math.round(number * 100))
    ? Math.round(number * 100) : 0;
}

// A matching bill already reserves this debt payment. Consume each bill once
// so two debts with the same lender cannot share a single reserved payment.
export function debtPaymentReserves(debts = [], bills = []) {
  const usedBills = new Set();
  const nameKey = value => String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return debts.reduce((total, debt) => {
    if (debt.balance !== undefined && Number(debt.balance) <= 0) return total;
    const minimum = cents(debt.minimum);
    const match = bills.findIndex((bill, index) => {
      if (usedBills.has(index) || bill.paid === true || bill.status === 'Paid') return false;
      const billDue = bill.dueDate || bill.due;
      const debtDue = debt.dueDate || debt.due;
      if (billDue && debtDue && billDue !== debtDue) return false;
      const linked = (debt.id && bill.debtId === debt.id) || (bill.id && debt.billId === bill.id);
      if (linked) return true;
      const name = nameKey(debt.name);
      if (!name || nameKey(bill.name) !== name || cents(bill.amount) !== minimum) return false;
      const account = String(debt.accountNumberLast4 || '');
      const billAccount = String(bill.accountNumberLast4 || '');
      if (account && billAccount && account !== billAccount) return false;
      return debts.filter(item => nameKey(item.name) === name &&
        String(item.accountNumberLast4 || '') === account).length === 1;
    });
    if (match < 0) return total + minimum;
    usedBills.add(match);
    return total + Math.max(0, minimum - cents(bills[match].amount));
  }, 0);
}

export function mirrorBudget(finance) {
  const balance = cents(finance.balance);
  const bills = (finance.bills || []).reduce((sum, bill) =>
    sum + (bill.status === "Paid" || bill.paid === true ? 0 : cents(bill.amount)), 0);
  const debt = debtPaymentReserves(finance.debts, finance.bills);
  const buffer = cents(finance.buffer);
  const available = Math.max(balance - bills - debt - buffer, 0);
  const limit = cents(finance.bobbieFunMoney?.limit);
  const entries = Array.isArray(finance.bobbieFunMoney?.entries) ? finance.bobbieFunMoney.entries : [];
  const spent = entries.reduce((sum, entry) => sum + cents(entry.amount), 0);
  const remaining = Math.max(limit - spent, 0);
  return {
    balance: balance / 100, bills: bills / 100, debt: debt / 100, buffer: buffer / 100,
    available: available / 100, limit: limit / 100, spent: spent / 100, remaining: remaining / 100,
    usableFunMoney: Math.min(available, remaining) / 100, entries,
    hasPlan: Boolean(finance.bobbieFunMoney),
    paydayChanged: Boolean(finance.bobbieFunMoney &&
      finance.bobbieFunMoney.paydayDate !== (finance.nextPaycheckDate || "")),
  };
}

export function checkPurchase(finance, amount) {
  const parsed = parseAmount(amount);
  if (parsed === null || parsed <= 0) return null;
  const budget = mirrorBudget(finance);
  const fits = cents(parsed) <= cents(budget.available);
  return {
    amount: parsed, fits, left: (cents(budget.available) - cents(parsed)) / 100,
    shortfall: Math.max(cents(parsed) - cents(budget.available), 0) / 100,
    fitsFunMoney: budget.hasPlan && cents(parsed) <= cents(budget.usableFunMoney),
  };
}

export function saveFunMoney(finance, amount) {
  const limit = parseAmount(amount);
  const budget = mirrorBudget(finance);
  if (limit === null) throw new Error("Enter a valid amount with up to two decimal places.");
  if (cents(limit) < cents(budget.spent)) throw new Error("Your total plan needs to include the treats already recorded.");
  if (cents(limit) - cents(budget.spent) > cents(budget.available)) {
    throw new Error("That amount would use money reserved for bills, debt, or your buffer. Try a smaller plan.");
  }
  return { ...finance, bobbieFunMoney: {
    limit, entries: budget.entries, paydayDate: finance.nextPaycheckDate || "",
  } };
}

export function recordTreat(finance, { amount, name, recordedAt = new Date().toISOString() }) {
  const purchase = checkPurchase(finance, amount);
  const budget = mirrorBudget(finance);
  if (!purchase || !purchase.fitsFunMoney) throw new Error("This treat needs to fit both your fun-money plan and your current budget.");
  let id = `treat-${recordedAt}`;
  while (budget.entries.some((entry) => entry.id === id)) id += "-next";
  const entry = { id, amount: purchase.amount,
    name: String(name || "A little treat").trim().slice(0, 100), recordedAt };
  return { ...finance, balance: (cents(finance.balance) - cents(purchase.amount)) / 100,
    bobbieFunMoney: { ...finance.bobbieFunMoney, entries: [...budget.entries, entry] } };
}

export function undoTreat(finance, id) {
  const budget = mirrorBudget(finance);
  const entry = budget.entries.find((item) => item.id === id);
  if (!entry) return finance;
  return { ...finance, balance: (cents(finance.balance) + cents(entry.amount)) / 100,
    bobbieFunMoney: { ...finance.bobbieFunMoney, entries: budget.entries.filter((item) => item.id !== id) } };
}

export function saveLook(finance, look) {
  const name = String(look.name || "").trim().slice(0, 60);
  if (!name) throw new Error("Give your look a name first, darling.");
  let id = `look-${Date.now()}`;
  while ((finance.bobbieLooks || []).some((entry) => entry.id === id)) id += "-next";
  const saved = { id, name, wig: String(look.wig || "").slice(0, 80),
    outfit: String(look.outfit || "").slice(0, 120), accessories: String(look.accessories || "").slice(0, 120) };
  return { ...finance, bobbieLooks: [saved, ...(finance.bobbieLooks || [])].slice(0, 12) };
}
