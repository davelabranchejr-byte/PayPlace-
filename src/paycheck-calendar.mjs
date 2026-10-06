// Local calendar dates at noon avoid UTC day shifts and daylight-saving drift.
export function readDate(value) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d, 12);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function scheduleSettings(value) {
  const text = String(value || "Biweekly").toLowerCase().replace(/[-_]/g, " ");
  if (text.includes("semi") || text.includes("twice")) return { kind: "semi", baseline: 2, label: "Twice monthly" };
  if (text.includes("bi") || text.includes("every two") || text.includes("every 2")) return { kind: "interval", interval: 14, baseline: 2, label: "Biweekly" };
  if (text.includes("week")) return { kind: "interval", interval: 7, baseline: 4, label: "Weekly" };
  if (text.includes("month")) return { kind: "monthly", baseline: 1, label: "Monthly" };
  return { kind: "interval", interval: 14, baseline: 2, label: "Biweekly" };
}
function cents(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
}
function monthDay(year, month, day) {
  return new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()), 12);
}
export function buildCalendar(finance, month, monthCount = 1) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1, 12);
  const end = new Date(first.getFullYear(), first.getMonth() + monthCount, 1, 12);
  const anchor = readDate(finance.nextPaycheckDate);
  const settings = scheduleSettings(finance.payFrequency);
  const events = [];
  const push = date => { if (date >= first && date < end) events.push({ id: `pay-${dateKey(date)}`, date: dateKey(date), amount: cents(finance.nextPaycheck) / 100, label: "Payday", type: "pay", extra: false }); };
  if (anchor) {
    if (settings.kind === "interval") {
      const cursor = new Date(anchor);
      // Project backwards too: the current month's earlier checks determine which is extra.
      while (cursor > first) cursor.setDate(cursor.getDate() - settings.interval);
      while (cursor < first) cursor.setDate(cursor.getDate() + settings.interval);
      while (cursor < end) { push(new Date(cursor)); cursor.setDate(cursor.getDate() + settings.interval); }
    } else {
      const anchorDay = anchor.getDate();
      const anchorEnd = anchorDay === new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
      const otherDay = Number(finance.secondPaydayDay) || (anchorDay === 15 ? 31 : anchorDay >= 28 ? 15 : anchorDay <= 14 ? anchorDay + 15 : anchorDay - 15);
      for (let i = 0; i < monthCount; i += 1) {
        const y = first.getFullYear(), m = first.getMonth() + i;
        const primary = monthDay(y, m, anchorEnd ? 31 : anchorDay);
        push(primary);
        if (settings.kind === "semi") {
          const second = monthDay(y, m, Math.min(31, Math.max(1, otherDay)));
          if (dateKey(second) !== dateKey(primary)) push(second);
        }
      }
    }
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  const counts = {};
  for (const event of events) {
    const key = event.date.slice(0, 7);
    counts[key] = (counts[key] || 0) + 1;
    event.extra = settings.kind === "interval" && counts[key] > settings.baseline;
    if (event.extra) event.label = "Extra paycheck";
  }
  for (const bonus of Array.isArray(finance.extraPaychecks) ? finance.extraPaychecks : []) {
    const date = readDate(bonus.date);
    if (date && date >= first && date < end && cents(bonus.amount)) events.push({ ...bonus, amount: cents(bonus.amount) / 100, type: "bonus", extra: true, label: bonus.label || "Bonus check" });
  }
  return { events: events.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)), settings, configured: Boolean(anchor) };
}
export function nextExtraPaycheck(finance, today = new Date()) {
  const key = dateKey(readDate(today));
  return buildCalendar(finance, today, 13).events.find(event => event.extra && event.date >= key) || null;
}
export function suggestedSplit(amount, bills = 0) {
  const total = cents(amount);
  const catchup = Math.min(Math.round(total * 0.35), cents(bills));
  const debt = Math.min(total - catchup, Math.round(total * 0.30));
  const buffer = Math.min(total - catchup - debt, Math.round(total * 0.25));
  return { bills: catchup / 100, debt: debt / 100, buffer: buffer / 100, joy: (total - catchup - debt - buffer) / 100 };
}
export function validateSplit(amount, values) {
  const labels = ["bills", "debt", "buffer", "joy"];
  if (labels.some(key => !/^\d+(\.\d{1,2})?$/.test(String(values[key])))) throw new Error("Enter a zero or positive amount with no more than two decimal places for each part.");
  const total = labels.reduce((sum, key) => sum + cents(values[key]), 0);
  if (total > cents(amount)) throw new Error("Your plan is larger than this check. Lower an amount before saving.");
  return Object.fromEntries(labels.map(key => [key, cents(values[key]) / 100]));
}
export function addBonus(finance, entry) {
  if (!readDate(entry.date)) throw new Error("Use a real date in YYYY-MM-DD format.");
  if (!/^\d+(\.\d{1,2})?$/.test(String(entry.amount)) || !cents(entry.amount)) throw new Error("Enter a check amount greater than zero with up to two decimal places.");
  if ((finance.extraPaychecks || []).some(item => item.id === entry.id)) throw new Error("This check is already saved.");
  return { ...finance, extraPaychecks: [...(finance.extraPaychecks || []), { id: entry.id, date: entry.date, amount: cents(entry.amount) / 100, label: String(entry.label || "Bonus check").trim().slice(0, 60) }] };
}
export function saveSplit(finance, event, values) {
  const split = validateSplit(event.amount, values);
  return { ...finance, extraPaycheckPlans: { ...(finance.extraPaycheckPlans || {}), [event.id]: { date: event.date, amount: event.amount, split } } };
}
