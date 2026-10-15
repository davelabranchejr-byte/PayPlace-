import test from 'node:test';
import assert from 'node:assert/strict';
import { isNeighborhoodNight, neighborhoodWelcomeTheme } from '../src/neighborhood-time.mjs';

test('neighborhood uses local time at day and night boundaries', () => {
  for (const [hour, minute, expected] of [[0, 0, true], [6, 59, true], [7, 0, false], [12, 0, false], [18, 29, false], [18, 30, true], [23, 59, true]]) {
    assert.equal(isNeighborhoodNight(new Date(2026, 9, 8, hour, minute)), expected);
  }
});

test('daylight follows seasonal local-clock hours', () => {
  assert.equal(isNeighborhoodNight(new Date(2026, 0, 15, 17)), true);
  assert.equal(isNeighborhoodNight(new Date(2026, 6, 15, 17)), false);
  assert.equal(isNeighborhoodNight(new Date(2026, 6, 15, 20, 29)), false);
  assert.equal(isNeighborhoodNight(new Date(2026, 6, 15, 20, 30)), true);
});

test('welcome artwork covers all months and ends holiday themes promptly', () => {
  const expected=['winter','winter','spring','spring','spring','summer','summer','summer','autumn','halloween','autumn','winter-holidays'];
  expected.forEach((theme,month) => assert.equal(neighborhoodWelcomeTheme(new Date(2026,month,15)),theme));
  assert.equal(neighborhoodWelcomeTheme(new Date(2026,9,31,23,59)), 'halloween');
  assert.equal(neighborhoodWelcomeTheme(new Date(2026,10,1,0,0)), 'autumn');
  assert.equal(neighborhoodWelcomeTheme(new Date(2026,11,31,23,59)), 'winter-holidays');
  assert.equal(neighborhoodWelcomeTheme(new Date(2027,0,1,0,0)), 'winter');
});
