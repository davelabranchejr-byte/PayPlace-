import test from 'node:test';
import assert from 'node:assert/strict';
import { nextSpaScene, SPA_SCENES, spaCanPlay } from '../src/spa-scenes.mjs';

test('the spa wraps in either direction without losing a neighbor', () => {
  assert.equal(nextSpaScene(SPA_SCENES.length - 1), 0);
  assert.equal(nextSpaScene(0, -1), SPA_SCENES.length - 1);
  const seen = new Set();
  let current = 0;
  for (let i = 0; i < SPA_SCENES.length; i++) { seen.add(SPA_SCENES[current].id); current = nextSpaScene(current); }
  assert.equal(seen.size, SPA_SCENES.length);
  assert.equal(current, 0);
});

test('rotation and atmosphere stop for pauses, reduced motion, background, or a covered screen', () => {
  const visible = { paused: false, reducedMotion: false, active: true, focused: true };
  assert.equal(spaCanPlay(visible), true);
  for (const override of [{ paused: true }, { reducedMotion: true }, { active: false }, { focused: false }]) {
    assert.equal(spaCanPlay({ ...visible, ...override }), false);
  }
});
