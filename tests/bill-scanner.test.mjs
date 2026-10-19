import test from 'node:test';
import assert from 'node:assert/strict';
import { billDate, parseBillText, reviewedScannedBill, duplicateScannedBill } from '../src/bill-scanner.mjs';
import { readBillPhoto } from '../src/bill-photo-flow.mjs';

test('scan extracts labeled amounts and dates without retaining raw account data', () => {
  const draft = parseBillText('Acme Electric\nAccount number: 123456789012\nMinimum payment: $5.00\nAmount Due: $123.45\nTotal Amount Due\n$145.67\nDue Date: November 7, 2026');
  assert.deepEqual(draft, {name:'Acme Electric', amount:'145.67', due:'2026-11-07', accountNumberLast4:'', notes:''});
  assert.equal(parseBillText('Vendor: City Water\nAccount ending in 1234\nBalance Due: $1,234.50\nPay by\n11/30/2026').accountNumberLast4, '1234');
  assert.equal(parseBillText('Vendor: City Water\nAccount ****9876').accountNumberLast4, '9876');
});
test('ambiguous OCR values stay empty and missing dates are never invented', () => {
  assert.equal(parseBillText('Total Due: $10.00\nTotal Due: $20.00').amount, '');
  assert.equal(parseBillText('Due date: 2026-10-30\nDue date: 2026-11-30').due, '');
  assert.equal(parseBillText('Total Due: -$10.00').amount, '');
  assert.equal(parseBillText('Total Due: 123456789012').amount, '');
  assert.equal(parseBillText('Due date: Nov 12').due, '');
  assert.equal(billDate('2026-02-29'), '');
  assert.equal(billDate('2028-02-29'), '2028-02-29');
  assert.equal(billDate('13/1/2026'), '');
});
test('review requires valid values and saves only a whitelist of reviewed fields', () => {
  const draft = {name:' Internet ', amount:'$75.50', due:'2026-11-03', accountNumberLast4:'1234', uri:'private.jpg', raw:'private full bill'};
  const bill = reviewedScannedBill(draft);
  assert.equal(bill.source, 'Billiam photo scan');
  assert.equal(bill.confidence, 'Reviewed by you');
  assert.equal(bill.name, 'Internet');
  assert.equal(bill.raw, undefined); assert.equal(bill.uri, undefined);
  for (const fields of [{amount:'0'}, {amount:'-5'}, {amount:'NaN'}, {due:''}, {due:'2026-02-31'}, {name:' '}, {accountNumberLast4:'1234567'}]) {
    assert.throws(() => reviewedScannedBill({...draft, ...fields}));
  }
  assert.equal(duplicateScannedBill(bill, [{name:' INTERNET ', amount:75.5, dueDate:'11/03/2026'}]), true);
  assert.equal(duplicateScannedBill(bill, [{...bill, due:'2026-12-03', dueDate:'2026-12-03'}]), false);
});
function device(overrides = {}) {
  const removed = [], calls = [];
  return {removed, calls, cacheDirectory:'file:///cache/', cameraPermission:async () => ({granted:true}),
    pick:async source => {calls.push(source); return {assets:[{uri:'file:///cache/original.jpg'}]};},
    normalize:async () => ({uri:'file:///cache/normalized.jpg'}), recognize:async () => ({text:'Amount due: $10.00'}),
    remove:async uri => removed.push(uri), ...overrides};
}
test('photo workflow reads on device and cleans both cache copies', async () => {
  const d = device();
  assert.equal(await readBillPhoto('camera',d), 'Amount due: $10.00');
  assert.deepEqual(d.removed.sort(), ['file:///cache/normalized.jpg','file:///cache/original.jpg']);
});
test('photo denial and cancellation do not run OCR', async () => {
  const denied = device({cameraPermission:async () => ({granted:false})});
  await assert.rejects(readBillPhoto('camera',denied), /Camera access is off/);
  assert.deepEqual(denied.calls, []);
  const canceled = device({pick:async () => ({canceled:true}), normalize:async () => {throw Error('must not normalize');}});
  assert.equal(await readBillPhoto('library', canceled), null);
});
test('OCR failure still cleans cache and never deletes original library photos', async () => {
  const d = device({pick:async () => ({assets:[{uri:'file:///photos/original.jpg'}]}), recognize:async () => {throw Error('OCR unavailable');}});
  await assert.rejects(readBillPhoto('library',d), /OCR unavailable/);
  assert.deepEqual(d.removed, ['file:///cache/normalized.jpg']);
  const empty = device({recognize:async () => ({text:'  '})});
  await assert.rejects(readBillPhoto('library',empty), /could not read/);
  assert.equal(empty.removed.length, 2);
});
