export const celebrationKey = event => event.date.slice(0, 7);
export function firstUncelebratedExtra(events, seen = {}, today = "") {
  return events.find(event => event.extra && event.date >= today && !seen[celebrationKey(event)]) || null;
}
