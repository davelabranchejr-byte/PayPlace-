import test from "node:test";
import assert from "node:assert/strict";
import { readDate, buildCalendar, nextExtraPaycheck, addBonus, suggestedSplit, validateSplit, saveSplit } from "../src/paycheck-calendar.mjs";
const month = value => readDate(value);
const base = { nextPaycheckDate: "2026-10-09", payFrequency: "Biweekly", nextPaycheck: 2000, balance: 50 };
test("counts checks before the anchor and finds the third check, not all checks in a three-check month", () => {
  const calendar = buildCalendar({ ...base, nextPaycheckDate: "2026-10-30" }, month("2026-10-01"));
  assert.deepEqual(calendar.events.map(event => [event.date, event.extra]), [["2026-10-02", false], ["2026-10-16", false], ["2026-10-30", true]]);
  assert.equal(nextExtraPaycheck({ ...base, nextPaycheckDate: "2026-10-30" }, month("2026-10-20")).date, "2026-10-30");
});
test("weekly calendar detects the fifth check and survives year rollover", () => {
  const result = buildCalendar({ ...base, payFrequency: "Weekly", nextPaycheckDate: "2027-01-01" }, month("2026-12-01"), 2);
  assert.deepEqual(result.events.filter(event => event.extra).map(event => event.date), ["2027-01-29"]);
});
test("monthly month-end schedule does not drift or report false extra checks in leap years", () => {
  const result = buildCalendar({ ...base, payFrequency: "Monthly", nextPaycheckDate: "2028-01-31" }, month("2028-01-01"), 3);
  assert.deepEqual(result.events.map(event => event.date), ["2028-01-31", "2028-02-29", "2028-03-31"]);
  assert.equal(result.events.some(event => event.extra), false);
});
test("twice monthly uses calendar days and configurable second day", () => {
  const result = buildCalendar({ ...base, payFrequency: "Twice monthly", nextPaycheckDate: "2026-01-15" }, month("2026-02-01"), 2);
  assert.deepEqual(result.events.map(event => event.date), ["2026-02-15", "2026-02-28", "2026-03-15", "2026-03-31"]);
  assert.equal(result.events.some(event => event.extra), false);
  assert.deepEqual(buildCalendar({ ...base, payFrequency: "Semi-monthly", nextPaycheckDate: "2026-01-05", secondPaydayDay: 20 }, month("2026-02-01")).events.map(event => event.date), ["2026-02-05", "2026-02-20"]);
});
test("missing or invalid date gives no invented scheduled paydays, but permits a bonus", () => {
  assert.equal(readDate("2026-02-30"), null);
  assert.equal(readDate("nonsense"), null);
  const finance = addBonus({ ...base, nextPaycheckDate: "" }, { id: "b1", date: "2026-10-06", amount: "225.45", label: "Overtime" });
  assert.deepEqual(buildCalendar(finance, month("2026-10-01")).events.map(event => [event.label, event.amount, event.extra]), [["Overtime", 225.45, true]]);
  assert.equal(finance.balance, base.balance);
  assert.throws(() => addBonus(base, { id: "b2", date: "2026-02-30", amount: "10" }));
  assert.throws(() => addBonus(base, { id: "b3", date: "2026-10-06", amount: "-10" }));
});
test("saved splits use cents, allow money left over, and reject over/negative/invalid allocations", () => {
  const split = suggestedSplit(100.01, 1000);
  assert.equal(Math.round(Object.values(split).reduce((sum, value) => sum + value, 0) * 100), 10001);
  for (const amount of [0.01, 0.02, 0.03]) {
    const tiny = suggestedSplit(amount, 1000);
    assert.equal(Object.values(tiny).every(value => value >= 0), true);
    assert.equal(Math.round(Object.values(tiny).reduce((sum, value) => sum + value, 0) * 100), Math.round(amount * 100));
  }
  assert.deepEqual(validateSplit(1, { bills: "0.10", debt: "0.20", buffer: "0.30", joy: "0.40" }), { bills: 0.1, debt: 0.2, buffer: 0.3, joy: 0.4 });
  for (const joy of ["1.01", "-1", "NaN", "0.001"]) assert.throws(() => validateSplit(1, { bills: "0", debt: "0", buffer: "0", joy }));
  const event = { id: "pay-2026-10-30", date: "2026-10-30", amount: 2000 };
  const finance = saveSplit(base, event, { bills: "500", debt: "500", buffer: "500", joy: "100" });
  assert.equal(finance.extraPaycheckPlans[event.id].split.joy, 100);
  assert.equal(finance.balance, base.balance);
  assert.equal(JSON.parse(JSON.stringify(finance)).extraPaycheckPlans[event.id].date, "2026-10-30");
});
