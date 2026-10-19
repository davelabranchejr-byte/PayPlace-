import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {amountCents,parseBreakdown,reviewedBreakdown,compareBills,previousReading,recordBilliamReadings,nextBillDate,saveRecurring,recurringDraft,recurringMatch} from '../src/billiam-tools.mjs';
import {processBillAssets} from '../src/bill-import-flow.mjs';
import {normalizeHousehold,assignHouseholdBill,householdAssignment,householdTotals,householdSnapshot,validateHouseholdSnapshot,receiveHouseholdSnapshot} from '../src/household-plan.mjs';
import {encryptHousehold,decryptHousehold} from '../src/household-crypto.mjs';
const bill={id:'water',name:'City Water',amount:'100.01',due:'2026-11-20',accountNumberLast4:'1234',notes:'PRIVATE NOTES',paymentAddress:'PRIVATE ADDRESS'};
const plan={id:'house-1',name:'Our place',members:[{id:'me',name:'Alex'},{id:'partner',name:'Sam'}],assignments:{}};
test('breakdown extracts only labeled figures, including zero, and refuses ambiguity',()=>{
  assert.deepEqual(parseBreakdown('Current charges: $70.00\nPast-due balance\n$20.00\nMinimum payment due: $5.00\nLate fee: $0.00\nOther fees: $2.00'),{currentCharges:'70.00',pastDue:'20.00',minimumPayment:'5.00',lateFees:'0.00',otherFees:'2.00'});
  assert.equal(parseBreakdown('Late fees: $5.00\nLate fees: $10.00').lateFees,'');
  assert.throws(()=>reviewedBreakdown({lateFees:'-1'}));
  assert.equal(amountCents('$1,234.56'),123456);assert.equal(amountCents('1e5'),null);
});
test('comparison records cents and itemized changes without inventing a reason',()=>{
  const result=compareBills({amount:'120.01',breakdown:{lateFees:'20.00'}},{amount:'100.01',breakdown:{lateFees:'0'}});
  assert.equal(result.deltaCents,2000);assert.equal(result.changes[0].deltaCents,2000);
  assert.deepEqual(compareBills({amount:100},{amount:100}).changes,[]);
  assert.throws(()=>compareBills({amount:'invalid'},{amount:100}));
});
test('previous bill matching separates account endings and picks the latest earlier period',()=>{
  const bills=[{...bill,due:'2026-10-20',amount:80},{...bill,due:'2026-09-20',amount:70},{...bill,due:'2026-10-21',accountNumberLast4:'9876',amount:900}];
  assert.equal(previousReading(bill,bills).amount,80);
  assert.equal(previousReading({...bill,accountNumberLast4:''},bills),null);
  assert.equal(previousReading({...bill,due:'bad'},bills),null);
});
test('reading history preserves earlier cycles when a saved entry is updated',()=>{
  const before={bills:[{...bill,due:'2026-10-20',amount:80}]};
  const after=recordBilliamReadings(before,{bills:[bill]},123);
  assert.equal(after.billiamHistory.length,2);
  assert.equal(previousReading(bill,[],after.billiamHistory).amount,'80');
  const text=JSON.stringify(after.billiamHistory);assert.doesNotMatch(text,/PRIVATE/);
  assert.equal(recordBilliamReadings(after,after).billiamHistory.length,2);
});
test('recurring dates keep month-end anchors and leap years; amount always needs review',()=>{
  assert.equal(nextBillDate('2026-01-31'),'2026-02-28');
  assert.equal(nextBillDate('2026-02-28','monthly',31),'2026-03-31');
  assert.equal(nextBillDate('2028-01-31'),'2028-02-29');
  assert.equal(nextBillDate('2026-12-31','quarterly'),'2027-03-31');
  let templates=saveRecurring([],bill,'monthly','repeat-water');
  assert.equal(recurringDraft(templates[0]).amount,'');
  assert.equal(recurringDraft(templates[0]).due,'2026-12-20');
  templates=saveRecurring(templates,{...bill,due:'2026-12-20'},'monthly','unused');
  assert.equal(templates.length,1);assert.equal(templates[0].id,'repeat-water');
  assert.equal(recurringMatch({...bill,accountNumberLast4:'9999'},templates),null);
});
function device(overrides={}){const removed=[];return {removed,cacheDirectory:'cache/',makeFolder:async()=>'cache/Billiam-123/',readPDF:async()=>[{text:'City Water\nAmount due: $100.00\nDue date: 2026-12-20'},{uri:'cache/Billiam-123/page.jpg'}],normalize:async()=>({uri:'cache/normalized.jpg'}),recognize:async()=>({text:'Late fee: $3.00'}),remove:async uri=>removed.push(uri),...overrides};}
test('multi-page PDFs combine digital text and OCR, and all owned caches are removed',async()=>{
  const d=device(),results=await processBillAssets([{uri:'cache/input.pdf',mimeType:'application/pdf'}],d);
  assert.equal(results[0].draft.amount,'100.00');assert.equal(results[0].draft.breakdown.lateFees,'3.00');
  assert.deepEqual(d.removed.sort(),['cache/Billiam-123/','cache/input.pdf']);
  assert.equal(results[0].text,undefined);
});
test('batch reading isolates failed files, retains later reviews, and leaves original photos untouched',async()=>{
  const d=device({normalize:async asset=>{if(asset.uri==='photos/bad')throw Error('bad image');return {uri:'cache/normalized.jpg'};},recognize:async()=>({text:'City Water\nAmount due: $10.00\nDue date: 2026-12-20'})});
  const results=await processBillAssets([{uri:'photos/bad'},{uri:'photos/good'}],d);
  assert.match(results[0].error,/bad image/);assert.equal(results[1].draft.amount,'10.00');
  assert.deepEqual(d.removed,['cache/normalized.jpg']);
  await assert.rejects(processBillAssets(Array(13).fill({uri:'x'}),d),/12/);
});
test('PDF failures and oversized inputs still clear owned copies',async()=>{
  const d=device({readPDF:async()=>{throw Error('locked PDF');}});
  const results=await processBillAssets([{uri:'cache/locked.pdf',name:'locked.pdf'},{uri:'cache/large.jpg',size:21*1024*1024}],d);
  assert.match(results[0].error,/locked/);assert.match(results[1].error,/20 MB/);
  assert.ok(d.removed.includes('cache/Billiam-123/'));assert.ok(d.removed.includes('cache/large.jpg'));
});
test('household equal splitting distributes every cent and paid bills leave unpaid totals',()=>{
  const p=assignHouseholdBill(plan,bill,'equal');
  assert.deepEqual(householdAssignment(p,bill).split,[{memberId:'me',cents:5001},{memberId:'partner',cents:5000}]);
  assert.deepEqual(householdTotals(p,[bill]),{me:5001,partner:5000});
  assert.deepEqual(householdTotals(p,[{...bill,status:'Paid'}]),{me:0,partner:0});
  assert.throws(()=>assignHouseholdBill(p,bill,'person','unknown'));
  const changed={...bill,amount:'120'};assert.equal(householdAssignment(p,changed).split[0].cents,12000,'stale split is never silently retained');
});
function selectedPlan(){const p=assignHouseholdBill(plan,bill,'equal');p.assignments.water.shared=true;return p;}
test('household exports only selected bills and a strict financial whitelist',()=>{
  const p=selectedPlan(),snapshot=householdSnapshot(p,[bill,{...bill,id:'private',name:'PRIVATE BILL'}],1234);
  assert.equal(snapshot.bills.length,1);assert.equal(snapshot.bills[0].amount,100.01);
  assert.doesNotMatch(JSON.stringify(snapshot),/PRIVATE|1234|paymentAddress|notes|accountNumber/);
  assert.throws(()=>householdSnapshot(plan,[bill]),/Choose at least/);
  assert.throws(()=>validateHouseholdSnapshot({...snapshot,bills:[{...snapshot.bills[0],split:[{memberId:'me',cents:1}]}]}),/split/);
});
test('received plans require review, do not replace private assignments, and reject stale copies',()=>{
  const snapshot=householdSnapshot(selectedPlan(),[bill],1234),original=JSON.stringify(plan);
  const next=receiveHouseholdSnapshot(plan,snapshot);
  assert.equal(JSON.stringify(plan),original);assert.equal(next.received.length,1);assert.deepEqual(next.assignments,{});
  assert.throws(()=>receiveHouseholdSnapshot(next,snapshot),/already saved/);
  const fresh={...snapshot,createdAt:new Date(5678).toISOString()};assert.equal(receiveHouseholdSnapshot(next,fresh).received.length,1);
  assert.equal(normalizeHousehold({members:[null,{}]}).members[0].id,'me');
});
test('household sharing encrypts selected data and authenticates wrong passwords and tampering',async()=>{
  const snapshot=householdSnapshot(selectedPlan(),[bill],1234),password='household-test-secret';
  const text=await encryptHousehold(snapshot,password,randomBytes);
  assert.doesNotMatch(text,/City Water|Alex|Sam/);
  assert.deepEqual(await decryptHousehold(text,password),snapshot);
  await assert.rejects(decryptHousehold(text,'a-different-password'),/incorrect|damaged/);
  const changed=JSON.parse(text);changed.ciphertext=changed.ciphertext.slice(0,-2)+(changed.ciphertext.endsWith('00')?'01':'00');
  await assert.rejects(decryptHousehold(JSON.stringify(changed),password),/incorrect|damaged/);
  changed.iterations=1;await assert.rejects(decryptHousehold(JSON.stringify(changed),password),/supported/);
  await assert.rejects(encryptHousehold(snapshot,'short',randomBytes),/12/);
});

test('deleting a bill removes its comparison readings instead of quietly retaining them',()=>{
  const saved=recordBilliamReadings({bills:[]},{bills:[bill]});
  const removed=recordBilliamReadings(saved,{...saved,bills:[]});
  assert.deepEqual(removed.billiamHistory,[]);
});
