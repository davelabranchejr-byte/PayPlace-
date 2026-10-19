import { billDate, reviewedScannedBill } from './bill-scanner.mjs';
export const BREAKDOWN_FIELDS = [['currentCharges','Current charges'],['pastDue','Past-due balance'],['minimumPayment','Minimum payment'],['lateFees','Late fees'],['otherFees','Other fees']];
export const vendorKey = name => String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function amountCents(value, allowZero = false) {
  const text = String(value ?? '').trim().replace(/^\$\s*/,'');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(text)) return null;
  const cents = Math.round(Number(text.replaceAll(',','')) * 100);
  return Number.isSafeInteger(cents) && cents <= 1000000000 && (allowZero ? cents >= 0 : cents > 0) ? cents : null;
}
export function parseBreakdown(text) {
  const lines = String(text || '').slice(0,50000).split(/\r?\n/).map(line=>line.trim());
  const labels = {currentCharges:/^(?:current charges|new charges|current balance charges)\s*:?\s*(.*)$/i,pastDue:/^(?:past[ -]due(?: balance| amount)?|previous unpaid balance)\s*:?\s*(.*)$/i,minimumPayment:/^(?:minimum payment(?: due)?)\s*:?\s*(.*)$/i,lateFees:/^(?:late fees?|late payment fees?)\s*:?\s*(.*)$/i,otherFees:/^(?:other fees?|service fees?)\s*:?\s*(.*)$/i};
  return Object.fromEntries(Object.entries(labels).map(([field,re])=>{
    const values = [...new Set(lines.flatMap((line,index)=>{const match=line.match(re);if(!match)return [];const cents=amountCents(match[1] || lines[index+1],true);return cents===null?[]:[(cents/100).toFixed(2)];}))];
    return [field,values.length===1?values[0]:''];
  }));
}
export function reviewedBreakdown(draft = {}) {
  const fields = {};
  for(const [key,label] of BREAKDOWN_FIELDS){
    if(draft[key] === '' || draft[key] === undefined)continue;
    const cents=amountCents(draft[key],true);
    if(cents===null)throw Error(`Check ${label.toLowerCase()}; use a nonnegative dollar amount or leave it empty.`);
    fields[key]=(cents/100).toFixed(2);
  }
  return fields;
}
export function reviewBilliamDraft(draft){return {...reviewedScannedBill(draft),breakdown:reviewedBreakdown(draft.breakdown)};}
function sameProvider(a,b){
  if(!vendorKey(a.name) || vendorKey(a.name)!==vendorKey(b.name))return false;
  const x=a.accountNumberLast4 || '',y=b.accountNumberLast4 || '';
  return x===y; // Unknown accounts are not silently equated with a known account.
}
export function previousReading(draft,bills=[],history=[]){
  const due=billDate(draft.dueDate || draft.due);
  if(!due)return null;
  const candidates=[...history,...bills].filter(item=>sameProvider(draft,item) && billDate(item.dueDate || item.due) && billDate(item.dueDate || item.due)<due && amountCents(item.amount)!==null);
  return candidates.sort((a,b)=>billDate(b.dueDate || b.due).localeCompare(billDate(a.dueDate || a.due)) || (b.at || 0)-(a.at || 0))[0] || null;
}
export function compareBills(current,previous){
  const a=amountCents(current?.amount),b=amountCents(previous?.amount);
  if(a===null || b===null)throw Error('Choose two bills with valid amounts.');
  const changes=BREAKDOWN_FIELDS.flatMap(([key,label])=>{
    const x=amountCents(current.breakdown?.[key],true),y=amountCents(previous.breakdown?.[key],true);
    return x===null || y===null || x===y ? [] : [{key,label,deltaCents:x-y}];
  });
  return {deltaCents:a-b,percent:b?Math.round((a-b)/b*10000)/100:0,changes};
}
export function recordBilliamReadings(before,after,now=Date.now()){
  const remaining=new Set((after.bills || []).map(b=>b.id));
  const removed=new Set((before.bills || []).filter(b=>!remaining.has(b.id)).map(b=>b.id));
  const history=Array.isArray(before.billiamHistory)?before.billiamHistory.filter(item=>!removed.has(item.billId)):[];
  const signature=b=>JSON.stringify([b.name,b.amount,b.dueDate || b.due,b.accountNumberLast4 || '',b.breakdown || {}]);
  // Also seed pre-existing bills the first time any plan change is saved.
  for(const bill of [...(before.bills || []),...(after.bills || [])]){
    if(removed.has(bill.id))continue;
    if(!billDate(bill.dueDate || bill.due) || amountCents(bill.amount)===null)continue;
    const sig=signature(bill);
    if(history.some(entry=>entry.signature===sig))continue;
    history.push({billId:bill.id,name:String(bill.name).slice(0,100),amount:String(bill.amount),due:billDate(bill.dueDate || bill.due),accountNumberLast4:/^\d{4}$/.test(bill.accountNumberLast4 || '')?bill.accountNumberLast4:'',breakdown:reviewedBreakdown(bill.breakdown || {}),signature:sig,at:now});
  }
  return {...after,billiamHistory:history.slice(-1000)};
}
export function nextBillDate(date,cadence='monthly',anchorDay){
  const iso=billDate(date);if(!iso)throw Error('Use a full due date first.');
  const [year,month,day]=iso.split('-').map(Number);
  const months={monthly:1,quarterly:3,yearly:12}[cadence];if(!months)throw Error('Choose monthly, quarterly or yearly.');
  const target=new Date(Date.UTC(year,month-1+months,1));
  const last=new Date(Date.UTC(target.getUTCFullYear(),target.getUTCMonth()+1,0)).getUTCDate();
  target.setUTCDate(Math.min(anchorDay || day,last));
  return target.toISOString().slice(0,10);
}
export function recurringMatch(draft,templates=[]){
  const matches=templates.filter(item=>sameProvider(draft,item));
  return matches.length===1?matches[0]:null;
}
export function saveRecurring(templates,bill,cadence='monthly',id){
  const reviewed=reviewBilliamDraft({...bill,due:bill.dueDate || bill.due});
  nextBillDate(reviewed.due,cadence);
  const existing=recurringMatch(reviewed,templates);
  const template={id:existing?.id || id,name:reviewed.name,accountNumberLast4:reviewed.accountNumberLast4,cadence,lastDue:reviewed.due,anchorDay:existing?.anchorDay || Number(reviewed.due.slice(-2))};
  if(!template.id)throw Error('Missing recurring bill identifier.');
  return [...templates.filter(item=>item.id!==template.id),template].slice(-200);
}
export function recurringDraft(template){return {name:template.name,amount:'',due:nextBillDate(template.lastDue,template.cadence,template.anchorDay),accountNumberLast4:template.accountNumberLast4,notes:'',breakdown:{}};}

export function validateBilliamState(finance){
  if(finance.billiamHistory!==undefined){
    if(!Array.isArray(finance.billiamHistory)||finance.billiamHistory.length>1000)throw Error('Invalid Billiam history.');
    for(const item of finance.billiamHistory){
      if(!item||typeof item.name!=='string'||item.name.length>100||!billDate(item.due)||amountCents(item.amount)===null||typeof item.signature!=='string'||item.signature.length>2000||!Number.isFinite(item.at))throw Error('Invalid Billiam reading.');
      reviewedBreakdown(item.breakdown || {});
    }
  }
  if(finance.billiamRecurring!==undefined){
    if(!Array.isArray(finance.billiamRecurring)||finance.billiamRecurring.length>200)throw Error('Invalid recurring bill templates.');
    const ids=new Set();
    for(const t of finance.billiamRecurring){
      if(!t||typeof t.id!=='string'||ids.has(t.id)||typeof t.name!=='string'||!t.name.trim()||t.name.length>100||!['monthly','quarterly','yearly'].includes(t.cadence)||!billDate(t.lastDue)||!Number.isInteger(t.anchorDay)||t.anchorDay<1||t.anchorDay>31||! /^\d{4}$|^$/.test(t.accountNumberLast4 || ''))throw Error('Invalid recurring bill template.');
      ids.add(t.id);
    }
  }
  for(const bill of (Array.isArray(finance.bills)?finance.bills:[]))if(bill?.breakdown!==undefined)reviewedBreakdown(bill.breakdown);
}
