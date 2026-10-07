import test from "node:test";
import assert from "node:assert/strict";
import { orderDebts, selectStrategy, initializeMixedTarget, normalizeStrategy } from "../src/debt-strategies.mjs";
import { firstUncelebratedExtra, celebrationKey } from "../src/paycheck-celebration.mjs";
const debts = [{ id: "small", balance: 100, apr: 0 }, { id: "costly", balance: 1000, apr: 29 }, { id: "middle", balance: 300, apr: 12 }, { id: "paid", balance: 0, apr: 40 }];
test("Snowball and Avalanche exclude paid debts and use their correct targets", () => {
  assert.deepEqual(orderDebts(debts, "snowball").map(d => d.id), ["small", "middle", "costly"]);
  assert.deepEqual(orderDebts(debts, "avalanche").map(d => d.id), ["costly", "middle", "small"]);
});
test("Mixed retains one quick-win target across saves and transitions to APR after payoff", () => {
  const chosen = selectStrategy({ debts, payoffMode: "snowball" }, "mixed");
  const reopened = JSON.parse(JSON.stringify(chosen));
  assert.equal(normalizeStrategy(reopened.payoffMode), "mixed");
  assert.equal(orderDebts(reopened.debts, "mixed", reopened.mixedQuickWinId)[0].id, "small");
  const changed = { ...reopened, debts: reopened.debts.map(d => d.id === "small" ? { ...d, balance: 0 } : d) };
  assert.deepEqual(orderDebts(changed.debts, "mixed", changed.mixedQuickWinId).map(d => d.id), ["costly", "middle"]);
  assert.equal(selectStrategy(changed, "mixed"), changed);
  assert.equal(orderDebts([...changed.debts, { id: "new-tiny", balance: 10, apr: 0 }], "mixed", changed.mixedQuickWinId)[0].id, "costly");
});
test("Mixed can be chosen before adding debts and never moves a saved target", () => {
  const empty = selectStrategy({ debts: [], payoffMode: "snowball" }, "mixed");
  const first = initializeMixedTarget({ ...empty, debts: [debts[0]] });
  assert.equal(first.mixedQuickWinId, "small");
  const added = initializeMixedTarget({ ...first, debts: [...first.debts, { id: "tiny", balance: 10, apr: 0 }] });
  assert.equal(added.mixedQuickWinId, "small");
});
test("Extra-check celebration skips regular/past checks and is acknowledged once per month", () => {
  const events = [{ id: "old", date: "2026-09-30", extra: true }, { id: "regular", date: "2026-10-16", extra: false }, { id: "first", date: "2026-10-30", extra: true }, { id: "bonus", date: "2026-10-31", extra: true }];
  const first = firstUncelebratedExtra(events, {}, "2026-10-07");
  assert.equal(first.id, "first");
  const persisted = JSON.parse(JSON.stringify({ [celebrationKey(first)]: true }));
  assert.equal(firstUncelebratedExtra(events, persisted, "2026-10-07"), null);
  assert.equal(firstUncelebratedExtra([...events, { id: "next", date: "2026-11-10", extra: true }], persisted, "2026-10-07").id, "next");
});
