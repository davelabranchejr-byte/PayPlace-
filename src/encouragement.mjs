// Built-in notes are editorial content. Neighbor submissions never enter this
// collection; the service delivers them only after owner approval.
export const MASCOT_NOTES = Object.freeze([
  { id: 'annie-rest', voice: 'Annie', text: 'Resting is growing, too. You still belong here.' },
  { id: 'bobbie-show-up', voice: 'Bobbie', text: 'Darling, showing up in yesterday’s wig still counts as showing up.' },
  { id: 'westley-step', voice: 'Westley', text: 'You do not need the whole path. One little step is enough for today.' },
  { id: 'tate-progress', voice: 'Tate', text: 'Progress is progress, no matter how small. I should know.' },
  { id: 'chapo-pause', voice: 'Chapo', text: 'A pause, a snack, and a fresh look. We can try again after that.' },
  { id: 'billiam-mail', voice: 'Billiam', text: 'Today’s delivery: you are more than the number on any bill.' },
  { id: 'daddy-start', voice: 'Daddy', text: 'It’s okay to start over. You still belong here.' },
  { id: 'em-fresh', voice: 'Em', text: 'A fresh start doesn’t have to be dramatic. A little care is a start.' },
  { id: 'annie-space', voice: 'Annie', text: 'There is room for you here, even on the days you have nothing to give.' },
  { id: 'bobbie-worth', voice: 'Bobbie', text: 'Your worth is not on clearance, darling. Be kind to yourself.' },
  { id: 'westley-together', voice: 'Westley', text: 'Some paths are easier with a friend beside you. You do not have to do this alone.' },
  { id: 'tate-tiny', voice: 'Tate', text: 'Tiny steps still move you. No giant leap required.' },
  { id: 'chapo-enough', voice: 'Chapo', text: 'You are allowed to have a good moment before everything is sorted out.' },
  { id: 'billiam-tomorrow', voice: 'Billiam', text: 'You can open one envelope today and leave the next one for tomorrow.' },
  { id: 'daddy-real', voice: 'Daddy', text: 'You do not have to fix your whole life today. Pick one thing you can manage.' },
  { id: 'em-care', voice: 'Em', text: 'Being cared for is not something you have to earn.' },
].map(note => Object.freeze({ ...note, source: 'mascot' })));

export const ENCOURAGEMENT_PLACES = Object.freeze({
  garden: { label: 'A little encouragement in this garden stone', x: 46, y: 78, shape: 'stone' },
  town: { label: 'A little encouragement in this neighborhood brick', x: 71, y: 69, shape: 'brick' },
  library: { label: 'A little encouragement tucked into this library shelf', x: 82, y: 84, shape: 'shelf' },
  spa: { label: 'A little encouragement on Em’s window ledge', x: 78, y: 79, shape: 'brick' },
  room: { label: 'A little encouragement in this wall brick', x: 24, y: 72, shape: 'brick' },
});

export function approvedPublicNotes(result) {
  if (!Array.isArray(result?.notes)) return [];
  return result.notes.filter(n => n && n.source === 'community' && typeof n.id === 'string' && typeof n.text === 'string' && n.text.length >= 8 && n.text.length <= 240 && typeof n.alias === 'string' && n.alias.length <= 32 && Number.isSafeInteger(n.revision) && n.revision > 0)
    .map(({ id, text, alias, revision }) => ({ id, text, alias, revision, source: 'community' }));
}

export function encouragementNote(community = [], random = Math.random) {
  const pool = community.length && random() < 0.35 ? community : MASCOT_NOTES;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
}
