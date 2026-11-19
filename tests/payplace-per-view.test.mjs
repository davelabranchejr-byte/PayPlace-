import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { PER_VIEW_VIDEOS, normalizePerView, togglePerViewFavorite, recordPerViewProgress, recordPerViewWatch, perViewResumeAt, perViewRows } from '../src/payplace-per-view.mjs';

test('the starting collection has playable local media and natural poster frames', () => {
  assert.equal(new Set(PER_VIEW_VIDEOS.map(video => video.id)).size, 7);
  for (const video of PER_VIEW_VIDEOS) {
    assert.ok(existsSync(new URL(`../assets/per-view/${video.file}.mp4`, import.meta.url)));
    assert.ok(existsSync(new URL(`../assets/per-view/${video.file}.jpg`, import.meta.url)));
    assert.ok(video.ratio > 0 && video.ratio <= 1);
  }
});
test('favorites survive JSON storage, deduplicate, and ignore obsolete titles', () => {
  let state = togglePerViewFavorite({}, 'chapo-purple-pans');
  state = normalizePerView(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(state.favorites, ['chapo-purple-pans']);
  assert.deepEqual(normalizePerView({ favorites: ['chapo-purple-pans', 'gone', 'chapo-purple-pans'] }).favorites, state.favorites);
  assert.deepEqual(togglePerViewFavorite(state, 'chapo-purple-pans').favorites, []);
  assert.deepEqual(togglePerViewFavorite(state, '__proto__'), state);
});
test('continue watching restores the last position and removes a finished video', () => {
  let state = recordPerViewProgress({}, 'daddy-episode-1', 17, 66, 10);
  state = recordPerViewProgress(state, 'bobbie-mirror', 8, 31, 20);
  assert.equal(perViewResumeAt(JSON.parse(JSON.stringify(state)), 'daddy-episode-1'), 17);
  assert.deepEqual(perViewRows(state)[0].videos.map(video => video.id), ['bobbie-mirror', 'daddy-episode-1']);
  state = recordPerViewProgress(state, 'bobbie-mirror', 31, 31, 30);
  assert.equal(perViewResumeAt(state, 'bobbie-mirror'), 0);
  assert.deepEqual(perViewRows(state)[0].videos.map(video => video.id), ['daddy-episode-1']);
});
test('invalid watch progress cannot add titles or create a broken seek target', () => {
  const state = normalizePerView({ progress: { bogus: { seconds: 99 }, 'daddy-episode-1': { seconds: Infinity }, 'bobbie-mirror': { seconds: -1 } } });
  assert.deepEqual(state.progress, {});
  assert.deepEqual(recordPerViewProgress(state, 'daddy-episode-1', NaN, 66), state);
  const clamped = recordPerViewProgress(state, 'daddy-episode-1', 500, 66);
  assert.equal(clamped.progress['daddy-episode-1'].seconds, 66);
  assert.equal(clamped.progress['daddy-episode-1'].completed, true);
});
test('character search and category filters also work inside favorites', () => {
  const favorites = togglePerViewFavorite({}, 'bobbie-mirror');
  assert.deepEqual(perViewRows(favorites, 'BOBBIE', 'favorites')[0].videos.map(video => video.id), ['bobbie-mirror']);
  assert.equal(perViewRows(favorites, 'Chapo', 'favorites')[0].videos.length, 0);
  assert.equal(perViewRows({}, '', 'series')[0].videos.length, 3);
  assert.equal(perViewRows({}, '', 'commercials')[0].videos.length, 4);
  assert.equal(perViewRows({}, 'unmatched')[0].videos.length, 0);
});

test('streaming rows use real personal counts and retain honest empty states', () => {
  const initial = perViewRows({});
  assert.deepEqual(initial.slice(0, 3).map(row => row.title), ['Continue Watching', 'Recommended Shows', 'Most Viewed']);
  assert.equal(initial[2].videos.length, 0);
  let state = recordPerViewWatch({}, 'daddy-episode-1');
  state = recordPerViewWatch(state, 'bobbie-mirror');
  state = recordPerViewWatch(state, 'bobbie-mirror');
  const popular = perViewRows(JSON.parse(JSON.stringify(state))).find(row => row.id === 'most-viewed');
  assert.deepEqual(popular.videos.map(video => video.id), ['bobbie-mirror', 'daddy-episode-1']);
  assert.equal(popular.subtitle, 'Your most-watched videos');
  assert.deepEqual(normalizePerView({ views: { bogus: 4, 'daddy-episode-1': Infinity, 'bobbie-mirror': -1 } }).views, {});
  assert.deepEqual(recordPerViewWatch(state, 'bogus'), state);
  const recommended = perViewRows(togglePerViewFavorite(state, 'pawrats-money-trees')).find(row => row.id === 'recommended');
  assert.equal(recommended.videos[0].id, 'pawrats-money-trees');
});

test('Westley’s Modern Life is a TV show with credits, full portrait framing, search and resume', () => {
  const id='westleys-modern-life-episode-1';
  const shows=perViewRows({},'Westley','series')[0];
  assert.equal(perViewRows({},'', 'series')[0].title,'TV Shows');
  assert.equal(shows.title,'Search results');
  assert.deepEqual(shows.videos.map(v=>v.id),[id]);
  assert.equal(shows.videos[0].duration,126);
  assert.equal(shows.videos[0].ratio,512/910);
  assert.ok(perViewRows({}).find(row=>row.id==='recommended').videos.some(v=>v.id===id));
  const saved=JSON.parse(JSON.stringify(recordPerViewProgress(togglePerViewFavorite({},id),id,45,126,10)));
  assert.equal(perViewResumeAt(saved,id),45);
  assert.ok(perViewRows(saved,'Westley','favorites')[0].videos.some(v=>v.id===id));
});
