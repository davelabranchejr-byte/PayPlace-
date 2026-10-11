import test from 'node:test';
import assert from 'node:assert/strict';
import {recordActivity,weeklyRecap,smallTasks,nextQuietDate} from '../src/neighborhood-progress.mjs';
const now=Date.now();
test('recap excludes historical totals, sample simulations and deletions; records real transitions',()=>{
 const before={bills:[{id:'b',amount:40,status:'Upcoming'}],debts:[{id:'d',balance:20}],subscriptions:[{id:'s',amount:12,frequency:'Monthly',status:'Keep'}],savingsGoals:[{id:'g',savedCents:500}]};
 const after={...before,bills:[{id:'b',amount:40,status:'Paid'}],debts:[{id:'d',balance:0}],subscriptions:[{...before.subscriptions[0],status:'Cancelled'}],savingsGoals:[{id:'g',savedCents:800}],premiumBeta:{roundUpSaved:1000}};
 const recorded=recordActivity(before,after,now);
 assert.deepEqual(weeklyRecap(recorded,now),{bills:1,billAmount:40,debts:1,subscriptions:1,monthlySaved:12,savings:3});
 assert.deepEqual(recordActivity(recorded,recorded,now).neighborEvents,recorded.neighborEvents);
 assert.equal(weeklyRecap(before,now).savings,0);
 assert.equal(weeklyRecap(recordActivity(before,{...before,bills:[],debts:[],subscriptions:[]},now),now).debts,0);
 const undone=recordActivity(recorded,{...recorded,bills:before.bills,subscriptions:before.subscriptions,savingsGoals:before.savingsGoals},now);
 assert.equal(weeklyRecap(undone,now).bills,0);assert.equal(weeklyRecap(undone,now).monthlySaved,0);assert.equal(weeklyRecap(undone,now).savings,0);
 assert.equal(weeklyRecap(recorded,now+8*86400000).bills,0);
});
test('small steps route to existing screens and check-in waits at least seven days',()=>{
 assert.deepEqual(smallTasks({bills:[],subscriptions:[]}).map(t=>t.target),['Budget','Savings']);
 const start=new Date(2026,9,11,22,30);const next=nextQuietDate(7,17,start);
 // A late session must not get its reminder before seven full days.
 assert.ok(next.getTime()-start.getTime()>=7*86400000);assert.equal(next.getHours(),17);
});
