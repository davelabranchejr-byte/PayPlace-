import { billDate } from './bill-reminders.mjs';
export const isPaid = bill => bill.paid === true || bill.status === 'Paid';
const cents = value => Math.round(Number(value || 0) * 100);
export function moneyCents(text, { signed = false } = {}) {
  const value = String(text).trim();
  if (!(signed ? /^-?\d+(?:\.\d{1,2})?$/ : /^\d+(?:\.\d{1,2})?$/).test(value) || !Number.isSafeInteger(cents(value))) throw new Error('Enter an amount with up to two decimal places.');
  return cents(value);
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function paydaySnapshot(finance, now = new Date()) {
  const payday = billDate(finance.nextPaycheckDate);
  const today = billDate(localDate(now));
  const validPayday = payday && payday >= today;
  const unpaid = (finance.bills || []).filter(b => !isPaid(b));
  const bills = validPayday ? unpaid.filter(b => {
    const due = billDate(b.dueDate || b.due);
    return !due || due <= payday;
  }) : [];
  const essentials = finance.paydayEssentials?.payday === finance.nextPaycheckDate ? finance.paydayEssentials : null;
  const groceries = essentials?.groceriesCents || 0, gas = essentials?.gasCents || 0;
  const billTotal = bills.reduce((total,b) => total + cents(b.amount),0);
  const debt = (finance.debts || []).filter(d => Number(d.balance)>0).reduce((total,d) => total+cents(d.minimum),0);
  const balance = cents(finance.balance), buffer = cents(finance.buffer);
  const remaining = balance-billTotal-debt-groceries-gas-buffer;
  return { validPayday:!!validPayday, bills, balance, billTotal, debt, buffer, groceries, gas, remaining,
    essentialsSet:!!essentials, unknownDates:bills.filter(b => !billDate(b.dueDate || b.due)).length,
    days:validPayday ? Math.round((Date.UTC(payday.getFullYear(),payday.getMonth(),payday.getDate())-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000) : null,
    updatedAt:finance.balanceUpdatedAt || null };
}
const billState = b => ({ paid:isPaid(b), amount:String(b.amount) });
const sameState = (a,b) => a.paid===b.paid && cents(a.amount)===cents(b.amount);
export function recordBillHistory(before, after, now = Date.now()) {
  const old = new Map((before.bills || []).map(b => [b.id,b]));
  const history = [...(before.paymentHistory || [])];
  for (const bill of after.bills || []) {
    const prior=old.get(bill.id);
    if (!prior || sameState(billState(prior),billState(bill))) continue;
    history.push({ id:`payment-${now}-${history.length}`, billId:bill.id, name:bill.name, at:now,
      kind:isPaid(prior)!==isPaid(bill) ? isPaid(bill)?'recorded':'unmarked' : 'corrected',
      before:billState(prior), after:billState(bill), undoOf:after.paymentUndoOf || null });
  }
  const { paymentUndoOf, ...next } = after;
  return {...next,paymentHistory:history};
}
export function canUndoPayment(finance,event) {
  const history=finance.paymentHistory || [];
  const latest=history.filter(e => e.billId===event.billId).at(-1);
  const bill=(finance.bills || []).find(b => b.id===event.billId);
  return !!bill && latest?.id===event.id && !event.undoOf && sameState(billState(bill),event.after);
}
export function undoPayment(finance,id) {
  const event=(finance.paymentHistory || []).find(e => e.id===id);
  if (!event || !canUndoPayment(finance,event)) throw new Error('This record has changed. Review the latest entry before undoing.');
  return {...finance,paymentUndoOf:id,bills:finance.bills.map(b => b.id===event.billId ? {...b,amount:event.before.amount,paid:event.before.paid,status:event.before.paid?'Paid':'Upcoming'} : b)};
}
export function firstWinPlan(finance,entry,now = Date.now()) {
  const payday=billDate(entry.payday), due=billDate(entry.due);
  if (!payday || payday < billDate(localDate(new Date(now)))) throw new Error('Choose today or a future payday using YYYY-MM-DD.');
  if (!due) throw new Error('Enter the bill due date using YYYY-MM-DD.');
  if (!entry.name.trim()) throw new Error('Give your first bill a name.');
  const amount=moneyCents(entry.amount), balance=moneyCents(entry.balance,{signed:true});
  if (amount<=0) throw new Error('Enter a bill amount greater than zero.');
  return {...finance,nextPaycheckDate:entry.payday,daysUntilPayday:paydaySnapshot({...finance,nextPaycheckDate:entry.payday},new Date(now)).days,
    balance:balance/100,balanceUpdatedAt:now,balanceSource:'Manual entry',firstWinComplete:true,
    bills:[...(finance.bills || []),{id:`first-bill-${now}`,name:entry.name.trim(),amount:(amount/100).toFixed(2),due:entry.due,dueDate:entry.due,paid:false,status:'Upcoming',source:'Manual entry'}]};
}
export function emptyPlan(starter) {
  return {...starter,balance:0,nextPaycheck:0,nextPaycheckDate:'',daysUntilPayday:0,allowance:0,buffer:0,creditScore:0,bills:[],debts:[],firstWinComplete:false,planSource:'Personal',balanceUpdatedAt:null};
}
export function samplePlan(starter,now = new Date()) {
  const payday=new Date(now);payday.setDate(payday.getDate()+9);
  const due=new Date(now);due.setDate(due.getDate()+3);
  return {...starter,planSource:'Sample',firstWinComplete:true,balanceUpdatedAt:now.getTime(),balanceSource:'Sample data',nextPaycheckDate:localDate(payday),daysUntilPayday:9,
    bills:[{id:'sample-power',name:'Sample power bill',amount:'142.38',dueDate:localDate(due),due:localDate(due),status:'Upcoming',paid:false}],
    paydayEssentials:{payday:localDate(payday),groceriesCents:9000,gasCents:3500},billReminders:{enabled:false},subscriptionReminders:{enabled:false},annieCare:{weekly:false,checkIn:false}};
}
export function quietSettings(value) {
  return {pauseCheckIns:value?.pauseCheckIns===true,reduceAnimation:value?.reduceAnimation===true,hideAmounts:value?.hideAmounts===true,
    hour:Number.isInteger(value?.hour)&&value.hour>=0&&value.hour<=23?value.hour:null,
    minute:Number.isInteger(value?.minute)&&value.minute>=0&&value.minute<=59?value.minute:0};
}
export function privateText(value) {
  return typeof value==='string' ? value.replace(/-?\$\s*\d[\d,]*(?:\.\d+)?/g,'$•••') : value;
}
