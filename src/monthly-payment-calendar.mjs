import { buildCalendar, dateKey, readDate } from './paycheck-calendar.mjs';

export const calendarKinds = {
  due: { label: 'Bill due', mascot: 'Billiam', color: '#D8FAF3' },
  paid: { label: 'Payment recorded', mascot: 'Westley', color: '#DDE9FF' },
  pay: { label: 'Payday', mascot: 'Chapo', color: '#FFF0A7' },
  subscription: { label: 'Subscription fee', mascot: 'Bobbie', color: '#F2DCFF' },
};

function renewalDates(item, month) {
  const anchor = readDate(item.renewalDate);
  if (!anchor) return [];
  const start = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const end = new Date(month.getFullYear(), month.getMonth() + 1, 1, 12);
  if (anchor >= end) return [];
  if (item.frequency === 'Weekly') {
    const dates = [];
    const cursor = new Date(anchor);
    const weeks = Math.max(0, Math.floor((start - cursor) / (7 * 86400000)));
    cursor.setDate(cursor.getDate() + weeks * 7);
    while (cursor < end) {
      if (cursor >= start) dates.push(dateKey(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return dates;
  }
  const interval = { Monthly: 1, Quarterly: 3, Yearly: 12 }[item.frequency];
  const months = (start.getFullYear() - anchor.getFullYear()) * 12 + start.getMonth() - anchor.getMonth();
  if (months === 0) return [dateKey(anchor)];
  if (!interval || months < 0 || months % interval) return [];
  const day = Math.min(item.anchorDay || anchor.getDate(), new Date(end.getFullYear(), end.getMonth(), 0).getDate());
  return [dateKey(new Date(start.getFullYear(), start.getMonth(), day, 12))];
}

export function paymentCalendar(finance, month) {
  const prefix = dateKey(month).slice(0, 7);
  const events = [];
  const add = (date, kind, name, amount) => {
    if (readDate(date) && date.startsWith(prefix)) events.push({ date, kind, name, amount });
  };
  const bills = finance.bills || [];
  const subscriptions = (finance.subscriptions || []).filter(item => item.status !== 'Cancelled');
  const renewals = subscriptions.flatMap(item => renewalDates(item, month).map(date => ({ ...item, date })));
  for (const bill of bills) {
    const date = bill.dueDate || bill.due;
    if (!renewals.some(item => item.billId === bill.id && item.date === date)) {
      add(date, 'due', bill.name, bill.amount);
    }
  }
  const history = finance.paymentHistory || [];
  const undone = new Set(history.map(item => item.undoOf).filter(Boolean));
  for (const record of history) {
    if (record.kind !== 'recorded' || record.undoOf || undone.has(record.id) || record.at == null) continue;
    const date = readDate(new Date(record.at));
    if (date) add(dateKey(date), 'paid', record.name, record.after?.amount);
  }
  for (const record of finance.micropayments || []) {
    if (record.undoneAt || record.at == null) continue;
    const date = readDate(new Date(record.at));
    if (date) add(dateKey(date), 'paid', record.name, record.amountCents / 100);
  }
  for (const record of finance.debtPaymentHistory || []) {
    const date = record.at == null ? null : readDate(new Date(record.at));
    if (date) add(dateKey(date), 'paid', record.name, record.amount);
  }
  for (const item of buildCalendar(finance, month).events) add(item.date, 'pay', item.label, item.amount);
  for (const item of renewals) add(item.date, 'subscription', item.name, item.amount);
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export function calendarWeeks(month) {
  const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({ length: Math.ceil((offset + days) / 7) }, (_, week) =>
    Array.from({ length: 7 }, (_, index) => {
      const day = week * 7 + index - offset + 1;
      return day >= 1 && day <= days ? day : null;
    }));
}

export const calendarTitle = month => month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
export const calendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export function eventText(event, hideAmounts) {
  const amount = event.amount != null && event.amount !== '' && Number.isFinite(Number(event.amount))
    ? ' · ' + Number(event.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '';
  return event.name + (hideAmounts ? '' : amount);
}

const escape = value => String(value).replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function calendarHtml(month, events, hideAmounts, artwork, landscape, sample = false) {
  const list = (items, limit) => items.slice(0, limit).map(event =>
    `<div class="event" style="background:${calendarKinds[event.kind].color}"><b>${calendarKinds[event.kind].label}</b> ${escape(eventText(event, hideAmounts))}</div>`).join('');
  const overflow = [];
  const rows = calendarWeeks(month).map(week => '<tr>' + week.map(day => {
    if (!day) return '<td class="empty"></td>';
    const items = events.filter(event => Number(event.date.slice(-2)) === day);
    if (items.length > 2) overflow.push([day, items.slice(2)]);
    return `<td><b>${day}</b>${list(items, 2)}${items.length > 2 ? '<small>More in list below</small>' : ''}</td>`;
  }).join('') + '</tr>').join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><title>PayPlace · ${calendarTitle(month)}</title>
<style>
@page{size:letter ${landscape ? 'landscape' : 'portrait'};margin:.35in}
*{box-sizing:border-box;print-color-adjust:exact;-webkit-print-color-adjust:exact}
body{font:12px Arial,sans-serif;color:#152649;margin:0}
h1{font-size:25px;margin:0} p{margin:4px 0 8px}
.legend{display:flex;gap:8px;margin:8px 0}.legend div{flex:1;padding:5px 8px;border-radius:10px;display:flex;gap:7px;align-items:center}
img{width:38px;height:38px;object-fit:contain}
table{width:100%;border-collapse:collapse;table-layout:fixed} th{background:#692da5;color:white;padding:4px} td{border:1px solid #cdc3e4;height:65px;vertical-align:top;padding:3px;overflow-wrap:anywhere}
tr{break-inside:avoid}.empty{background:#f6f3fb}.event{border-radius:3px;padding:2px;margin-top:2px;font-size:9px} small{font-size:8px}.overflow{break-before:page}
</style><h1>PayPlace · ${calendarTitle(month)}</h1><p>Money without shame. · Monthly payment calendar</p>${sample ? '<p><b>Sample calendar · fictional data</b></p>' : ''}
<div class="legend">${Object.entries(calendarKinds).map(([id, entry]) => `<div style="background:${entry.color}">${artwork[id] ? `<img src="${escape(artwork[id])}" alt="">` : ''}<span><b>${entry.mascot}</b><br>${entry.label}</span></div>`).join('')}</div>
<table><thead><tr>${calendarWeekdays.map(day => '<th>' + day + '</th>').join('')}</tr></thead><tbody>${rows}</tbody></table>
<p>Paydays and projected renewals are estimates. Recorded payments are shown on the date logged in PayPlace.</p>
${overflow.length ? '<section class="overflow"><h2>More dates for ' + calendarTitle(month) + '</h2>' + overflow.map(([day, items]) => '<h3>' + day + '</h3>' + list(items, items.length)).join('') + '</section>' : ''}</html>`;
}
