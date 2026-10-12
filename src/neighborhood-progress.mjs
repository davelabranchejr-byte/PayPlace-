const cents = n => Math.max(0, Math.round((Number(n) || 0) * 100));
const paid = b => b.status === 'Paid' || b.paid === true;
export function recordActivity(before, after, now = Date.now()) {
  const oldBills = new Map((before.bills || []).map(b => [b.id, b]));
  const oldDebts = new Map((before.debts || []).map(d => [d.id, d]));
  const oldSubs = new Map((before.subscriptions || []).map(s => [s.id, s]));
  const oldGoals = new Map((before.savingsGoals || []).map(g => [g.id, g]));
  let events = [...(before.neighborEvents || [])].filter(e => e.at >= now - 90 * 86400000);
  const add = (kind, id, amount = 0) => { events = events.filter(e => !(e.kind === kind && e.id === id && ['bill', 'debt', 'subscription'].includes(kind))); events.push({ kind, id, amount, at: now }); };
  for (const b of after.bills || []) {
    const old = oldBills.get(b.id);
    if (old && !paid(old) && paid(b)) add('bill', b.id, cents(b.amount));
    if (old && paid(old) && paid(b) && cents(old.amount)!==cents(b.amount)) events=events.map(e => e.kind==='bill'&&e.id===b.id ? {...e,amount:cents(b.amount)} : e);
    if (old && paid(old) && !paid(b)) events = events.filter(e => !(e.kind === 'bill' && e.id === b.id));
  }
  for (const d of after.debts || []) {
    if (oldDebts.has(d.id) && Number(oldDebts.get(d.id).balance) > 0 && Number(d.balance) === 0) add('debt', d.id);
    if (Number(d.balance) > 0) events = events.filter(e => !(e.kind === 'debt' && e.id === d.id));
  }
  for (const s of after.subscriptions || []) {
    const old = oldSubs.get(s.id);
    if (s.status === 'Cancelled' && old?.status !== 'Cancelled') add('subscription', s.id, Math.round(cents(s.amount) * ({Monthly:12, Yearly:1, Quarterly:4, Weekly:52}[s.frequency] || 0) / 12));
    if (old?.status === 'Cancelled' && s.status !== 'Cancelled') events = events.filter(e => !(e.kind === 'subscription' && e.id === s.id));
  }
  for (const g of after.savingsGoals || []) {
    const old = oldGoals.get(g.id);
    const delta = old ? g.savedCents - old.savedCents : 0;
    if (delta > 0) add('saving', g.id, delta);
    if (delta < 0) events.push({kind:'saving', id:g.id, amount:delta, at:now});
  }
  return { ...after, neighborEvents: events.slice(-2000) };
}
export function weeklyRecap(finance, now = Date.now()) {
  const events = (finance.neighborEvents || []).filter(e => e.at > now - 7 * 86400000 && e.at <= now);
  const count = kind => events.filter(e => e.kind === kind).length;
  const total = kind => events.filter(e => e.kind === kind).reduce((n, e) => n + e.amount, 0) / 100;
  return { bills:count('bill'), billAmount:total('bill'), debts:count('debt'), subscriptions:count('subscription'), monthlySaved:total('subscription'), savings:Math.max(0,total('saving')) };
}
export function smallTasks(finance) {
  const bill = (finance.bills || []).find(b => !paid(b));
  const sub = (finance.subscriptions || []).find(s => s.status !== 'Cancelled');
  return [{id:'balance', title:'Check your current balance', target:'Budget'},
    ...(bill ? [{id:`bill-${bill.id}`, title:`Review ${bill.name}`, target:'Bills'}] : []),
    ...(sub ? [{id:`subscription-${sub.id}`, title:`Review ${sub.name}`, target:'Subscriptions'}] : []),
    {id:'savings', title:'Check one savings goal', target:'Savings'}];
}
export function nextQuietDate(days, hour, now = new Date(), minute = 0) {
  const date = new Date(now); date.setDate(date.getDate() + days); date.setHours(Math.max(0,Math.min(23,Number(hour) || 0)),minute,0,0); if(date.getTime() < now.getTime() + days*86400000) date.setDate(date.getDate()+1); return date;
}
