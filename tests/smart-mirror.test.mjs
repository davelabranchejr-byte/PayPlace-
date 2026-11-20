import test from "node:test";
import assert from "node:assert/strict";
import { checkPurchase, mirrorBudget, parseAmount, recordTreat, saveFunMoney, saveLook, undoTreat } from "../src/smart-mirror.mjs";

function example(overrides = {}) {
  return { balance: 1000, nextPaycheck: 5000, nextPaycheckDate: "2026-10-10", buffer: 100,
    bills: [{ id: "rent", amount: "400", status: "Upcoming" }, { id: "paid", amount: "900", status: "Paid" }],
    debts: [{ minimum: 100 }], customSetting: "keep me", ...overrides };
}

test("only current funds after unpaid bills, debt minimums and buffer can fund a purchase", () => {
  const finance = example();
  assert.equal(mirrorBudget(finance).available, 400);
  assert.deepEqual(checkPurchase(finance, "400.00"), { amount: 400, fits: true, left: 0, shortfall: 0, fitsFunMoney: false });
  assert.equal(checkPurchase(finance, "400.01").fits, false);
  assert.equal(checkPurchase(finance, "400.01").shortfall, 0.01);
  assert.equal(mirrorBudget(example({ balance: 10 })).available, 0);
});

test("invalid or negative amounts cannot become a positive purchase or allowance", () => {
  for (const amount of ["", "-25", "1.2.3", "1,00", "Infinity", "NaN", "1e3", "100.999", "nope", "9007199254740993"]) {
    assert.equal(parseAmount(amount), null, amount);
    assert.equal(checkPurchase(example(), amount), null, amount);
    assert.throws(() => saveFunMoney(example(), amount), undefined, amount);
  }
  assert.equal(parseAmount("$1,234.50"), 1234.5);
  assert.equal(parseAmount(".50"), 0.5);
  assert.equal(checkPurchase(example(), "0"), null);
});

test("cent boundaries stay exact and both paid-bill flags are respected", () => {
  const finance = example({ balance: 0.3, buffer: 0, bills: [{ amount: 0.1 }, { amount: 300, paid: true }], debts: [{ minimum: 0.1 }] });
  assert.equal(mirrorBudget(finance).available, 0.1);
  assert.equal(checkPurchase(finance, "0.10").fits, true);
  assert.equal(checkPurchase(finance, "0.11").fits, false);
});

test("recording and undoing a treat update one persisted budget without spending reserved money", () => {
  const original = example();
  const planned = saveFunMoney(original, "75.50");
  assert.equal(planned.balance, original.balance);
  assert.throws(() => saveFunMoney(original, "400.01"));
  const recorded = recordTreat(planned, { amount: "25.25", name: "Dinner", recordedAt: "2026-10-03T06:00:00Z" });
  assert.equal(recorded.balance, 974.75);
  assert.equal(mirrorBudget(recorded).remaining, 50.25);
  assert.equal(mirrorBudget(recorded).available, 374.75);
  assert.equal(recorded.customSetting, "keep me");
  assert.deepEqual(mirrorBudget(JSON.parse(JSON.stringify(recorded))), mirrorBudget(recorded));
  assert.throws(() => recordTreat(recorded, { amount: "50.26" }));
  assert.throws(() => saveFunMoney(recorded, "25.24"));
  const restored = undoTreat(recorded, recorded.bobbieFunMoney.entries[0].id);
  assert.equal(restored.balance, original.balance);
  assert.equal(mirrorBudget(restored).remaining, 75.5);
  assert.equal(undoTreat(restored, "missing"), restored);
});

test("budget changes cap usable fun money and two quick purchases have separate undo targets", () => {
  const planned = saveFunMoney(example(), "100");
  const squeezed = { ...planned, balance: 605 };
  assert.equal(mirrorBudget(squeezed).remaining, 100);
  assert.equal(mirrorBudget(squeezed).usableFunMoney, 5);
  assert.throws(() => recordTreat(squeezed, { amount: "5.01" }));
  const first = recordTreat(planned, { amount: "10", recordedAt: "same" });
  const second = recordTreat(first, { amount: "10", recordedAt: "same" });
  assert.notEqual(second.bobbieFunMoney.entries[0].id, second.bobbieFunMoney.entries[1].id);
  assert.equal(undoTreat(second, second.bobbieFunMoney.entries[0].id).bobbieFunMoney.entries.length, 1);
  assert.equal(mirrorBudget({ ...planned, nextPaycheckDate: "2026-10-24" }).paydayChanged, true);
});

test("look plans persist alongside existing finance data and preserve the character artwork", () => {
  const finance = example();
  const next = saveLook(finance, { name: "Friday", wig: "Blonde curls", outfit: "Teal gown", accessories: "Diamonds" });
  assert.equal(next.bobbieLooks[0].name, "Friday");
  assert.deepEqual(next.bills, finance.bills);
  assert.equal(next.balance, finance.balance);
  assert.equal(JSON.parse(JSON.stringify(next)).bobbieLooks[0].outfit, "Teal gown");
  assert.throws(() => saveLook(finance, { name: " " }));
});

test('partial linked bills and paid current-cycle bills cover a debt minimum exactly once', () => {
 const debt={id:'card',name:'Card',balance:900,minimum:100,due:'2026-11-25'};
 const bill=(id,amount,paid=false,due='2026-11-25')=>({id,debtId:'card',amount,paid,due});
 const f=example({balance:500,buffer:0,debts:[debt],bills:[bill('a',30),bill('b',20)]});
 assert.equal(mirrorBudget(f).debt,50);assert.equal(mirrorBudget(f).available,400);
 assert.equal(mirrorBudget({...f,bills:[bill('paid',100,true)]}).debt,0);
 assert.equal(mirrorBudget({...f,bills:[bill('old',100,true,'2026-10-25')]}).debt,100);
 assert.equal(mirrorBudget({...f,bills:[bill('undated',100,true,'')]}).debt,100);
});
test('already reflected purchases, retries and undo preserve a reconciled balance', () => {
 const planned=saveFunMoney(example({balanceUpdatedAt:100}),100);
 const request={amount:'25.25',name:'Dinner',requestId:'one'};
 const recorded=recordTreat(planned,request);
 assert.equal(recordTreat(JSON.parse(JSON.stringify(recorded)),request).bobbieFunMoney.entries.length,1);
 assert.throws(()=>recordTreat(recorded,{...request,amount:'26'}),/different details/);
 const reconciled={...recorded,balance:800,balanceUpdatedAt:200};
 assert.equal(undoTreat(reconciled,recorded.bobbieFunMoney.entries[0].id).balance,800);
 const past=recordTreat({...planned,balance:0},{...request,alreadyInBalance:true});
 assert.equal(past.balance,0);assert.equal(mirrorBudget(past).remaining,74.75);
 assert.equal(undoTreat(past,past.bobbieFunMoney.entries[0].id).balance,0);
 assert.throws(()=>recordTreat(planned,{...request,amount:'101',alreadyInBalance:true}));
});
