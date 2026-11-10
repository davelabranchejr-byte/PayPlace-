import { amountCents, vendorKey } from './billiam-tools.mjs';
import { billDate } from './bill-scanner.mjs';
const clean=(v,max=100)=>String(v || '').replace(/[\u0000-\u001f]/g,'').trim().slice(0,max);
const safeId=v=>typeof v==='string' && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
export function normalizeHousehold(value){
  const v=value && typeof value==='object'?value:{};
  const members=Array.isArray(v.members)?v.members.filter(m=>m&&safeId(m.id)&&clean(m.name)).slice(0,10).map(m=>({id:m.id,name:clean(m.name,50)})):[];
  return {id:safeId(v.id)?v.id:'',name:clean(v.name)||'Our household',members:members.length?members:[{id:'me',name:'Me'}],assignments:v.assignments && typeof v.assignments==='object' && !Array.isArray(v.assignments)?v.assignments:{},received:Array.isArray(v.received)?v.received.filter(p=>{try{validateHouseholdSnapshot(p);return true;}catch{return false;}}).slice(-20):[]};
}
export function householdAssignment(plan,bill){
  const item=plan.assignments[bill.id] || {};
  const total=amountCents(bill.amount);
  const members=new Set(plan.members.map(m=>m.id));
  const split=Array.isArray(item.split)?item.split:[];
  const valid=total!==null && split.length>0 && split.every(s=>members.has(s.memberId)&&Number.isSafeInteger(s.cents)&&s.cents>=0) && new Set(split.map(s=>s.memberId)).size===split.length && split.reduce((sum,s)=>sum+s.cents,0)===total;
  return {shared:item.shared===true,split:valid?split:[{memberId:members.has(item.payer)?item.payer:plan.members[0].id,cents:total || 0}]};
}
export function assignHouseholdBill(plan,bill,mode,memberId){
  const p=normalizeHousehold(plan),total=amountCents(bill.amount);if(total===null)throw Error('This bill needs a valid amount.');
  let split;
  if(mode==='equal'){
    const base=Math.floor(total/p.members.length),extra=total%p.members.length;
    split=p.members.map((m,i)=>({memberId:m.id,cents:base+(i<extra?1:0)}));
  }else{
    if(!p.members.some(m=>m.id===memberId))throw Error('Choose a household member.');
    split=[{memberId,cents:total}];
  }
  return {...p,assignments:{...p.assignments,[bill.id]:{...householdAssignment(p,bill),split}}};
}
export function householdTotals(plan,bills){
  const p=normalizeHousehold(plan),totals=Object.fromEntries(p.members.map(m=>[m.id,0]));
  for(const bill of bills){if(bill.paid || bill.status==='Paid')continue;for(const share of householdAssignment(p,bill).split)totals[share.memberId]+=share.cents;}
  return totals;
}
export function householdSnapshot(plan,bills,now=Date.now()){
  const p=normalizeHousehold(plan);if(!p.id)throw Error('Save the household name first.');
  const selected=bills.filter(b=>p.assignments[b.id]?.shared===true);
  if(!selected.length)throw Error('Choose at least one bill to share.');
  const undated=selected.find(b=>!billDate(b.dueDate || b.due));if(undated)throw Error(`Give ${clean(undated.name)} a full YYYY-MM-DD due date in Bills before sharing.`);
  const snapshot={schema:'payplace-household-v1',id:p.id,name:p.name,createdAt:new Date(now).toISOString(),members:p.members,bills:selected.map(b=>({id:b.id,name:clean(b.name),amount:amountCents(b.amount)/100,due:billDate(b.dueDate || b.due),paid:!!b.paid || b.status==='Paid',split:householdAssignment(p,b).split}))};
  return validateHouseholdSnapshot(snapshot);
}
export function validateHouseholdSnapshot(s){
  if(!s || s.schema!=='payplace-household-v1' || !safeId(s.id) || typeof s.name!=='string' || !s.name.trim() || s.name.length>100 || !Number.isFinite(Date.parse(s.createdAt)) || !Array.isArray(s.members) || !s.members.length || s.members.length>10 || !Array.isArray(s.bills) || !s.bills.length || s.bills.length>500)throw Error('This household plan is invalid.');
  const ids=new Set();
  const members=s.members.map(m=>{if(!safeId(m.id)||ids.has(m.id)||typeof m.name!=='string'||!m.name.trim()||m.name.length>50)throw Error('Invalid household member.');ids.add(m.id);return {id:m.id,name:clean(m.name,50)};});
  const billIds=new Set();
  const bills=s.bills.map(b=>{
    if(!safeId(b.id)||billIds.has(b.id)||typeof b.name!=='string'||!b.name.trim()||b.name.length>100 || amountCents(b.amount)===null || !billDate(b.due)||typeof b.paid!=='boolean'||!Array.isArray(b.split)||!b.split.length||b.split.length>members.length)throw Error('Invalid shared bill.');
    billIds.add(b.id);const people=new Set();
    const split=b.split.map(part=>{if(!ids.has(part.memberId)||people.has(part.memberId)||!Number.isSafeInteger(part.cents)||part.cents<0)throw Error('Invalid bill split.');people.add(part.memberId);return {memberId:part.memberId,cents:part.cents};});
    if(split.reduce((sum,p)=>sum+p.cents,0)!==amountCents(b.amount))throw Error('The household split does not match the bill total.');
    return {id:b.id,name:clean(b.name),amount:amountCents(b.amount)/100,due:billDate(b.due),paid:b.paid,split};
  });
  return {schema:s.schema,id:s.id,name:clean(s.name),createdAt:s.createdAt,members,bills};
}
export function receiveHouseholdSnapshot(plan,snapshot){
  const p=normalizeHousehold(plan),s=validateHouseholdSnapshot(snapshot);
  const previous=p.received.find(x=>x.id===s.id);
  if(previous && Date.parse(previous.createdAt)>=Date.parse(s.createdAt))throw Error('This plan is already saved, or is older than your saved copy.');
  return {...p,received:[...p.received.filter(x=>x.id!==s.id),s].slice(-20)};
}
