const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');

function nativeSharing({ available = true, fail = false } = {}) {
  const calls = [];
  const mocks = {
    'expo-asset': { Asset: { fromModule: source => ({ downloadAsync: async () => ({ localUri: `file:///original-${source}.mp4` }) }) } },
    'expo-sharing': { isAvailableAsync: async () => available, shareAsync: async (uri, options) => { calls.push(['sheet', uri, options]); if (fail) throw new Error('Share failed'); } },
    'expo-file-system/legacy': { cacheDirectory: 'file:///cache/', copyAsync: async options => calls.push(['copy', options]), deleteAsync: async uri => calls.push(['cleanup', uri]) },
  };
  const code = babel.transformSync(fs.readFileSync(require.resolve('../src/per-view-sharing.native.js'), 'utf8'), { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => mocks[name] });
  return { share: module.exports.sharePerViewVideo, calls };
}

test('sharing sends only the selected MP4 and never treats sheet dismissal as a posted video', async () => {
  const { share, calls } = nativeSharing();
  const result = await share(12, 'bobbie-mirror');
  assert.equal(result.status, 'returned');
  assert.equal(calls[0][1].from, 'file:///original-12.mp4');
  assert.equal(calls[1][1], 'file:///cache/PayPlacePerView-bobbie-mirror.mp4');
  assert.equal(calls[1][2].mimeType, 'video/mp4');
  assert.equal(calls[2][0], 'cleanup');
});

test('unsupported sharing and errors never report completion and clean only the share copy', async () => {
  const unavailable = nativeSharing({ available: false });
  await assert.rejects(unavailable.share(1, 'daddy-episode-1'), /unavailable/);
  assert.equal(unavailable.calls.length, 0);
  const failed = nativeSharing({ fail: true });
  await assert.rejects(failed.share(1, 'daddy-episode-1'), /Share failed/);
  assert.equal(failed.calls.at(-1)[1], 'file:///cache/PayPlacePerView-daddy-episode-1.mp4');
});
