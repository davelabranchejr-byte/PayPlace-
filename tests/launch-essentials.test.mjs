import test from 'node:test';
import assert from 'node:assert/strict';
import { paydaySnapshot, recordBillHistory, undoPayment, canUndoPayment, firstWinPlan, emptyPlan, samplePlan, quietSettings, privateText } from '../src/launch-essentials.mjs';
import { planBillReminders } from '../src/bill-reminders.mjs';
import { planSubscriptionReminders } from '../src/subscription-detective.mjs';
import { recordActivity, weeklyRecap } from '../src/neighborhood-progress.mjs';
const now=new Date(2026,9,12,12);
const base={balance:500,nextPaycheck:2000,nextPaycheckDate:'2026-10-20',buffer:50,
  bills:[{id:'due',name:'Power',amount:'100.25',dueDate:'2026-10-19',status:'Upcoming'},{id:'later',amount:200,dueDate:'2026-11-01'},{id:'old',amount:40,dueDate:'2026-10-01'},{id:'undated',amount:10,dueDate:'Oct 13'},{id:'paid',amount:100,dueDate:'2026-10-15',paid:true}],debts:[{balance:1000,minimum:20}],paydayEssentials:{payday:'2026-10-20',groceriesCents:9000,gasCents:3500}};
test('snapshot reserves only unpaid bills through payday, overdue and undated items; excludes future paycheck',()=>{
 const s=paydaySnapshot(base,now);assert.equal(s.billTotal,15025);assert.equal(s.remaining,15475);assert.equal(s.unknownDates,1);assert.equal(s.days,8);assert.equal(s.updatedAt,null);
 assert.equal(paydaySnapshot({...base,nextPaycheckDate:'2026-10-11'},now).validPayday,false);
 assert.equal(paydaySnapshot({...base,nextPaycheckDate:'2026-10-21'},now).essentialsSet,false);
});
test('record, correction and undo keep an immutable history, protect newer edits and do not change balance',()=>{
 let f={...base,paymentHistory:[]};
 let next={...f,bills:f.bills.map(b=>b.id==='due'?{...b,paid:true,status:'Paid'}:b)};
 f=recordActivity(f,recordBillHistory(f,next,now.getTime()),now.getTime());
 const original=f.paymentHistory[0];assert.equal(original.kind,'recorded');assert.equal(f.balance,500);
 next={...f,bills:f.bills.map(b=>b.id==='due'?{...b,amount:'80.00'}:b)};
 f=recordActivity(f,recordBillHistory(f,next,now.getTime()+1),now.getTime()+1);
 assert.equal(weeklyRecap(f,now.getTime()+2).billAmount,80);assert.equal(canUndoPayment(f,original),false);
 f=recordActivity(f,recordBillHistory(f,undoPayment(f,f.paymentHistory.at(-1).id),now.getTime()+3),now.getTime()+3);
 assert.equal(f.bills[0].amount,'100.25');assert.equal(f.balance,500);assert.equal(f.paymentHistory.length,3);assert.equal(f.paymentHistory[1].after.amount,'80.00');
 assert.throws(()=>undoPayment(f,original.id),/changed/);
});
test('first win validates inputs, preserves old bills and samples cannot share references with a personal plan',()=>{
 const clean=emptyPlan(base);assert.deepEqual(clean.bills,[]);assert.equal(clean.balance,0);
 const f=firstWinPlan(clean,{payday:'2026-10-20',balance:'123.45',name:'Power',amount:'20.05',due:'2026-10-19'},now.getTime());
 assert.equal(f.balance,123.45);assert.equal(f.bills[0].amount,'20.05');assert.equal(f.firstWinComplete,true);
 assert.throws(()=>firstWinPlan(clean,{payday:'2026-10-20',balance:'100',name:'Power',amount:'20.001',due:'2026-10-19'},now.getTime()),/decimal/);
 const sample=samplePlan(base,now);sample.bills[0].amount='1.00';assert.equal(base.bills[0].amount,'100.25');assert.equal(sample.planSource,'Sample');assert.equal(sample.billReminders.enabled,false);
});
test('chosen local reminder time reaches bills and subscriptions without enabling notifications',()=>{
 const settings=quietSettings({hour:2,minute:45,pauseCheckIns:true});assert.equal(settings.hour,2);assert.equal(settings.minute,45);
 const bills=planBillReminders(base.bills,{enabled:true,hour:settings.hour,minute:settings.minute},now);
 assert.ok(bills.reminders.length);assert.ok(bills.reminders.every(r=>r.date.getHours()===2&&r.date.getMinutes()===45));
 const subs=planSubscriptionReminders([{status:'Active',renewalDate:'2026-10-20'}],{enabled:true,hour:2,minute:45},now);
 assert.ok(subs.reminders.every(r=>r.date.getHours()===2&&r.date.getMinutes()===45));
 assert.equal(planBillReminders(base.bills,{hour:2,minute:45},now).reminders.length,0);
 assert.equal(quietSettings({hour:25}).hour,null);
});
test('privacy masks signed and formatted currency without changing dates and bill names',()=>{
 assert.equal(privateText('Power: $1,234.56; shortfall $25.00; -$10.25 on 2026-10-12'),'Power: $•••; shortfall $•••; $••• on 2026-10-12');
});
