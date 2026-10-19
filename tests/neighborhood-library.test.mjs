import test from 'node:test';
import assert from 'node:assert/strict';
import { LIBRARY_BOOKS, checkoutBook, returnBook, advanceReadingCircle, normalizeLibrary, libraryDay } from '../src/neighborhood-library.mjs';
const id = LIBRARY_BOOKS[0].id;
const day = n => new Date(2026, 9, n, 12).getTime();

test('one physical copy reserves its shelf through borrowing, duplicate taps, and return', () => {
  const state = checkoutBook(undefined, id, 'bobbie', day(19));
  assert.equal(state.loans[id].reader, 'bobbie');
  assert.equal(LIBRARY_BOOKS[0].shelf, 'A1');
  assert.throws(() => checkoutBook(state, id, 'you', day(19)), /already borrowed/);
  assert.equal(state.history.length, 1);
  const restored = normalizeLibrary(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  const returned = returnBook(restored, id, day(20));
  assert.equal(returned.loans[id], undefined);
  assert.equal(LIBRARY_BOOKS[0].shelf, 'A1');
  assert.deepEqual(returned.history.map(e => e.action), ['borrow', 'return']);
  assert.deepEqual(returnBook(returned, id, day(20)), returned);
});

test('daily reading starts with book at home, rotates readers once a day, and preserves manual loans', () => {
  const first = advanceReadingCircle(undefined, day(19));
  assert.deepEqual(first.loans, {});
  const bobbie = advanceReadingCircle(first, day(20));
  assert.equal(bobbie.loans[id].reader, 'bobbie');
  assert.deepEqual(advanceReadingCircle(bobbie, day(20)), bobbie);
  const westley = advanceReadingCircle(bobbie, day(21));
  assert.equal(westley.loans[id].reader, 'westley');
  assert.deepEqual(westley.history.map(e => e.action), ['borrow', 'return', 'borrow']);
  const manual = checkoutBook(returnBook(westley, id, day(21)), id, 'you', day(21));
  const later = advanceReadingCircle(manual, day(29));
  assert.deepEqual(later.loans[id], manual.loans[id]);
  assert.equal(later.history.length, manual.history.length);
  assert.equal(later.lastRotationDay, libraryDay(day(29)));
  assert.deepEqual(advanceReadingCircle(later, day(28)), later, 'clock going backward must not rotate');
});

test('returned copies stay home for the day and ledger is bounded', () => {
  let state = advanceReadingCircle(advanceReadingCircle(undefined, day(19)), day(20));
  state = returnBook(state, id, day(20));
  assert.deepEqual(advanceReadingCircle(state, day(20)), state);
  for (let i = 0; i < 40; i++) state = returnBook(checkoutBook(state, id, 'tate', day(20)), id, day(20));
  assert.equal(state.history.length, 60);
  assert.deepEqual(normalizeLibrary({loans:{[id]:{reader:'unknown',at:1}},history:[{bookId:'bad'}]}).loans, {});
});


test('all illustrated book targets stay inside the visible shelf and Daddy is beside Emma', async () => {
  const { MASCOT_BOOKS, MASCOT_SHELF_BOUNDS, EM_SHELF_BOUNDS, LIBRARY_VISIBLE_HEIGHT, shelfTarget } = await import('../src/library-stories.mjs');
  assert.equal(MASCOT_BOOKS.length, MASCOT_SHELF_BOUNDS.length);
  assert.equal(new Set(MASCOT_BOOKS.map(b => b.id)).size, MASCOT_BOOKS.length);
  for (const bounds of [EM_SHELF_BOUNDS, ...MASCOT_SHELF_BOUNDS]) {
    assert.ok(bounds.left >= 0 && bounds.left + bounds.width <= 1);
    assert.ok(bounds.top >= 0 && bounds.top + bounds.height <= LIBRARY_VISIBLE_HEIGHT);
    assert.ok(parseFloat(shelfTarget(bounds).top) + parseFloat(shelfTarget(bounds).height) <= 100);
  }
  const i = MASCOT_BOOKS.findIndex(b => b.author === 'Daddy');
  const daddy = MASCOT_SHELF_BOUNDS[i];
  assert.ok(Math.abs(daddy.left + daddy.width - EM_SHELF_BOUNDS.left) < .001);
  assert.equal(MASCOT_BOOKS[i].title, 'Everyone Belongs Here');
  assert.equal(MASCOT_BOOKS[i].subtitle, 'Money without shame.');
});
