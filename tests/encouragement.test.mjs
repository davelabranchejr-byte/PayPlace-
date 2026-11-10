import test from 'node:test';
import assert from 'node:assert/strict';
import { MASCOT_NOTES, ENCOURAGEMENT_PLACES, approvedPublicNotes, encouragementNote } from '../src/encouragement.mjs';
test('all eight locked mascot voices contribute notes without reward mechanics', () => {
  assert.deepEqual(new Set(MASCOT_NOTES.map(n => n.voice)), new Set(['Annie', 'Bobbie', 'Westley', 'Tate', 'Chapo', 'Billiam', 'Daddy', 'Em']));
  assert.equal(MASCOT_NOTES.length, 16); assert.ok(MASCOT_NOTES.every(n => n.source === 'mascot'));
  assert.deepEqual(Object.keys(ENCOURAGEMENT_PLACES), ['garden', 'town', 'library', 'spa', 'room']);
  assert.equal(encouragementNote([], () => 0), MASCOT_NOTES[0]);
});
test('malformed community feed entries cannot be displayed as valid notes', () => {
  const note = { id: 'id', text: 'A little kindness goes a long way.', alias: 'A neighbor', revision: 1, source: 'community' };
  assert.deepEqual(approvedPublicNotes({ notes: [note, { ...note, revision: null }, { ...note, text: 'x'.repeat(241) }, { ...note, source: 'mascot' }] }), [note]);
  assert.deepEqual(approvedPublicNotes(null), []);
});
