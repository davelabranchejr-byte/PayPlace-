// OCR is a suggestion, never permission to save or pay a bill.
export function billDate(value = '') {
  let parts;
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) parts = text.split('-').map(Number);
  else {
    const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const named = text.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (us) parts = [+us[3], +us[1], +us[2]];
    else if (named) {
      const month = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(named[1].slice(0,3).toLowerCase()) + 1;
      if (month) parts = [+named[3], month, +named[2]];
    }
  }
  if (!parts) return '';
  const [year, month, day] = parts;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 2000 || year > 2199 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function money(value) {
  const text = String(value ?? '').trim().replace(/^\$\s*/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return '';
  const amount = Number(text.replaceAll(',',''));
  return amount > 0 && amount <= 10000000 ? amount.toFixed(2) : '';
}

export function parseBillText(raw) {
  const lines = String(raw ?? '').slice(0, 50000).replace(/[\u0000-\u0008\u000B-\u001F]/g,'').split('\n').map(line => line.trim()).filter(Boolean);
  const amounts = [], dates = [];
  let name = '', accountNumberLast4 = '';
  lines.forEach((line, index) => {
    const vendor = line.match(/^(?:bill from|vendor|company)\s*:\s*(.+)$/i);
    if (vendor && !name) name = vendor[1].slice(0,100);
    const amount = line.match(/\b(total amount due|total due|amount due|balance due)\b\s*[:\-]?\s*(.*)$/i);
    if (amount) {
      const value = money(amount[2] || lines[index + 1]);
      if (value) amounts.push({value, rank: /^total/i.test(amount[1]) ? 0 : 1});
    }
    const due = line.match(/\b(?:payment due date|due date|pay by|due by)\b\s*:?\s*(.*)$/i);
    if (due) {
      const value = billDate(due[1] || lines[index + 1]);
      if (value) dates.push(value);
    }
    const last4 = line.match(/\baccount\b.*?(?:ending(?:\s+in)?\s*|[*xX•]{2,}\s*)(\d{4})\b/i);
    if (last4) accountNumberLast4 = last4[1];
  });
  if (!name) name = (lines.slice(0,4).find(line => /^[A-Za-z][A-Za-z &'’.,-]{2,99}$/.test(line) && !/invoice|statement|bill|account|payment|customer|due|total/i.test(line)) || '');
  const rank = Math.min(...amounts.map(item => item.rank));
  const uniqueAmounts = [...new Set(amounts.filter(item => item.rank === rank).map(item => item.value))];
  const uniqueDates = [...new Set(dates)];
  return {name, amount: uniqueAmounts.length === 1 ? uniqueAmounts[0] : '', due: uniqueDates.length === 1 ? uniqueDates[0] : '', accountNumberLast4, notes:''};
}

export function reviewedScannedBill(draft) {
  const name = String(draft.name || '').trim().slice(0,100);
  const amount = money(draft.amount);
  const due = billDate(draft.due);
  if (!name || !amount || !due) throw new Error('Check the bill name, a positive amount, and a full due date (YYYY-MM-DD).');
  const last4 = String(draft.accountNumberLast4 || '').trim();
  if (last4 && !/^\d{4}$/.test(last4)) throw new Error('Enter exactly four account digits, or leave that field empty.');
  return {name, amount, due, dueDate:due, accountNumberLast4:last4, notes:String(draft.notes || '').slice(0,1000), paymentMethod:'Manual', source:'Billiam photo scan', confidence:'Reviewed by you'};
}

export function duplicateScannedBill(candidate, bills = []) {
  const key = value => String(value || '').trim().toLowerCase().replace(/\s+/g,' ');
  return bills.some(bill => key(bill.name) === key(candidate.name) && money(bill.amount) === money(candidate.amount) && billDate(bill.dueDate || bill.due) === billDate(candidate.due));
}
