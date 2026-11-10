// Stable catalog IDs and shelf positions must never depend on checkout order.
export const LIBRARY_BOOKS = Object.freeze([
  Object.freeze({ id: 'before-you-call-me-difficult', shelf: 'A1',
    title: 'Before You Call Me Difficult', author: 'Emma Acly',
    subtitle: 'A Memoir of Foster Care, Faith, and Learning to Love Again',
    purchaseUrl: 'https://a.co/d/09P0VmeL',
    description: 'Emma Acly’s memoir of foster care, faith, and learning to love again. The inaugural book in Annie’s Neighborhood Library, featured with Emma’s permission.' }),
]);
export const LIBRARY_READERS = Object.freeze([
  { id: 'you', name: 'You', room: 'Annie' },
  { id: 'bobbie', name: 'Bobbie', room: 'Bobbie' },
  { id: 'westley', name: 'Westley', room: 'Westley' },
  { id: 'tate', name: 'Tate', room: 'Tate' },
  { id: 'chapo', name: 'Chapo', room: 'Chapo' },
  { id: 'annie', name: 'Annie', room: 'Annie' },
  { id: 'daddy', name: 'Daddy', room: 'Annie' },
]);
const bookIds = new Set(LIBRARY_BOOKS.map(book => book.id));
const readerIds = new Set(LIBRARY_READERS.map(reader => reader.id));
const circle = ['bobbie', 'westley', 'tate', 'chapo', 'annie', null];
const validTime = value => Number.isFinite(value) && value >= 0;
export function libraryDay(now = Date.now()) {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function normalizeLibrary(value) {
  const loans = {};
  for (const book of LIBRARY_BOOKS) {
    const loan = value?.loans?.[book.id];
    if (readerIds.has(loan?.reader) && validTime(loan?.at)) loans[book.id] = {
      reader: loan.reader, at: loan.at, automatic: loan.automatic === true,
    };
  }
  const history = (Array.isArray(value?.history) ? value.history : []).filter(entry =>
    entry && bookIds.has(entry.bookId) && readerIds.has(entry.reader) &&
    ['borrow', 'return'].includes(entry.action) && validTime(entry.at)
  ).slice(-60).map(({bookId, reader, action, at}) => ({bookId, reader, action, at}));
  return { loans, history,
    lastRotationDay: typeof value?.lastRotationDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.lastRotationDay) ? value.lastRotationDay : '',
    round: Number.isSafeInteger(value?.round) && value.round >= 0 ? value.round : 0,
  };
}
function log(state, bookId, loan, action, at) {
  state.history = [...state.history, {bookId, reader: loan.reader, action, at}].slice(-60);
}
export function checkoutBook(value, bookId, reader, now = Date.now()) {
  if (!bookIds.has(bookId) || !readerIds.has(reader)) throw new Error('Choose a book and a reader from the library.');
  const state = normalizeLibrary(value);
  if (state.loans[bookId]) throw new Error('This copy is already borrowed. Return it to its shelf before choosing another reader.');
  const loan = {reader, at: now, automatic: false};
  state.loans[bookId] = loan;
  state.lastRotationDay = libraryDay(now);
  log(state, bookId, loan, 'borrow', now);
  return state;
}
export function returnBook(value, bookId, now = Date.now()) {
  const state = normalizeLibrary(value), loan = state.loans[bookId];
  if (!loan) return state;
  delete state.loans[bookId];
  state.lastRotationDay = libraryDay(now);
  log(state, bookId, loan, 'return', now);
  return state;
}
// One observed local day at a time, without inventing missed-day reading history.
// Manual loans never rotate; automatic loans return before another book is chosen.
export function advanceReadingCircle(value, now = Date.now()) {
  const state = normalizeLibrary(value), today = libraryDay(now);
  if (!state.lastRotationDay) return {...state, lastRotationDay: today};
  if (state.lastRotationDay >= today) return state;
  for (const [bookId, loan] of Object.entries(state.loans)) {
    if (loan.automatic) { delete state.loans[bookId]; log(state, bookId, loan, 'return', now); }
  }
  const reader = circle[state.round % circle.length];
  const available = LIBRARY_BOOKS.filter(book => !state.loans[book.id]);
  if (reader && available.length) {
    // Bobbie (and every reader) cycles through catalog titles across rounds.
    const book = available[Math.floor(state.round / circle.length) % available.length];
    const loan = {reader, at: now, automatic: true};
    state.loans[book.id] = loan; log(state, book.id, loan, 'borrow', now);
  }
  state.round += 1; state.lastRotationDay = today;
  return state;
}
