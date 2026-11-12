import test from 'node:test';
import assert from 'node:assert/strict';
import { isNeighborhoodNight, neighborhoodSeasonalCameos, neighborhoodWelcomeTheme } from '../src/neighborhood-time.mjs';

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

test('seasonal cameos follow local holiday windows, movable dates, and darkness', () => {
  const cameos = (year, month, day, hour = 12) =>
    neighborhoodSeasonalCameos(new Date(year, month - 1, day, hour));
  assert.deepEqual(cameos(2026, 12, 19, 21), []);
  assert.deepEqual(cameos(2026, 12, 24), []);
  assert.deepEqual(cameos(2026, 12, 24, 21), ['santa']);
  assert.deepEqual(cameos(2026, 12, 26, 21), []);
  assert.deepEqual(cameos(2026, 3, 28), []);
  assert.deepEqual(cameos(2026, 3, 29), ['bunny']);
  assert.deepEqual(cameos(2026, 4, 6), ['bunny']);
  assert.deepEqual(cameos(2026, 4, 7), []);
  assert.deepEqual(cameos(2027, 3, 28), ['bunny']);
  assert.deepEqual(cameos(2026, 11, 22), []);
  assert.deepEqual(cameos(2026, 11, 23), ['turkey']);
  assert.deepEqual(cameos(2026, 11, 29), ['turkey']);
  assert.deepEqual(cameos(2024, 12, 1), ['turkey']);
  assert.deepEqual(cameos(2024, 12, 2), []);
  assert.deepEqual(cameos(2026, 10, 24, 21), []);
  assert.deepEqual(cameos(2026, 10, 31), []);
  assert.deepEqual(cameos(2026, 10, 31, 21), ['witches', 'cashper']);
  assert.deepEqual(cameos(2026, 11, 1, 0), []);
});
