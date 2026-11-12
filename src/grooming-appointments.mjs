import { readDate } from './paycheck-calendar.mjs';

const limit = 500;
const validTime = value => value === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export function validateGroomingAppointments(items) {
  if (items === undefined) return;
  if (!Array.isArray(items) || items.length > limit) throw new Error('Invalid grooming appointments.');
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id || item.id.length > 100 || ids.has(item.id) ||
        typeof item.pet !== 'string' || !item.pet.trim() || item.pet.length > 80 ||
        typeof item.date !== 'string' || !readDate(item.date) ||
        typeof item.time !== 'string' || !validTime(item.time)) throw new Error('Invalid grooming appointment.');
    ids.add(item.id);
  }
}

export function saveGroomingAppointment(items, draft, id) {
  const item = { id: draft.id || id, pet: draft.pet.trim(), date: draft.date.trim(), time: draft.time.trim() };
  if (!item.pet) throw new Error('Enter your pet’s name.');
  if (!readDate(item.date)) throw new Error('Enter a valid date in YYYY-MM-DD format.');
  if (!validTime(item.time)) throw new Error('Enter a time in HH:MM format, or leave it blank.');
  const exists = items.some(entry => entry.id === item.id);
  if (!exists && items.length >= limit) throw new Error('Remove an older appointment before adding another.');
  const next = exists ? items.map(entry => entry.id === item.id ? item : entry) : [...items, item];
  validateGroomingAppointments(next);
  return next;
}
