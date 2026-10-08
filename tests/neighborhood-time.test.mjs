import test from 'node:test';
import assert from 'node:assert/strict';
import { isNeighborhoodNight } from '../src/neighborhood-time.mjs';

test('neighborhood uses local time at day and night boundaries', () => {
  for (const [hour, minute, expected] of [[0, 0, true], [5, 59, true], [6, 0, false], [12, 0, false], [19, 59, false], [20, 0, true], [23, 59, true]]) {
    assert.equal(isNeighborhoodNight(new Date(2026, 9, 8, hour, minute)), expected);
  }
});
