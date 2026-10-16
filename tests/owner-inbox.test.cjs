const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), React = require('react'), babel = require('@babel/core');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
test('owner inbox verifies a code, shows consent, manages questions, clears private data in background, and signs out', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/OwnerInbox.js'), 'utf8');
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'] }).code;
  const ui = Object.fromEntries(['ActivityIndicator','ScrollView','Text','TextInput','TouchableOpacity','View'].map(name => [name,name]));
  const listeners = new Set(), timers = new Map(); let timerId = 0;
  ui.Platform = { OS: 'ios' }; ui.StyleSheet = { create: value => value }; ui.AppState = { currentState: 'active', addEventListener(name, fn) { listeners.add(fn); return { remove: () => listeners.delete(fn) }; } };
  const sandbox = { exports: {}, console, Date, setInterval: fn => { const id = ++timerId; timers.set(id, fn); return id; }, clearInterval: id => timers.delete(id), setTimeout: () => ++timerId, clearTimeout() {}, require: name => name === 'react' ? React : name === 'react-native' ? ui : name.endsWith('/QuestionGlass') ? 'QuestionGlass' : name.endsWith('owner-inbox-api.mjs') ? { createOwnerInboxApi: () => () => {} } : name.endsWith('owner-session') ? { ownerSessionStore: {} } : { EMAIL_SERVICE_ORIGIN: 'https://payplace.example' } };
  vm.runInNewContext(code, sandbox);
  let signedIn = false, saved = null, status = 'new', renderer;
  const calls = [], question = { id: 'receipt-1', stageName: 'Chapo', question: 'Where are my snacks?', featureConsent: false, createdAt: Date.now(), topic: 'Spending & saving' };
  const api = async (route, data, authenticated = true) => {
    calls.push({ route, data, authenticated });
    if (route === 'request-code') return { challengeId: 'challenge', expiresAt: Date.now() + 600000, resendAfter: 60 };
    if (route === 'verify') { signedIn = true; return { sessionToken: 'a'.repeat(64), expiresAt: Date.now() + 600000 }; }
    if (!signedIn) { const error = new Error('Verify your owner email.'); error.signIn = true; throw error; }
    if (route === 'question-status') { status = data.status; return { id: data.id, status }; }
    if (route === 'logout') { signedIn = false; return { signedOut: true }; }
    return { counts: { unread: status === 'new' ? 1 : 0, total: 1, archived: status === 'archived' ? 1 : 0 }, questions: [ { ...question, status } ], nextOffset: null };
  };
  const store = { write: async (token, expiresAt) => { saved = { token, expiresAt }; }, clear: async () => { saved = null; } };
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  const field = label => renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === label);
  await act(async () => { renderer = create(React.createElement(sandbox.exports.default, { api, sessionStore: store })); });
  try {
    assert.ok(field('Owner email')); assert.equal(renderer.root.findAllByType('ActivityIndicator').length, 0);
    assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Where are my snacks/);
    await act(() => field('Owner email').props.onChangeText('owner@example.com'));
    await act(async () => button('Send owner sign-in code').props.onPress());
    assert.equal(calls.at(-1).authenticated, false);
    await act(() => field('Owner security code').props.onChangeText('ABCDEFGH'));
    await act(async () => button('Unlock owner inbox').props.onPress());
    assert.equal(button('Approve for Bobbie’s glass').props.disabled, true);
    assert.ok(saved); assert.match(JSON.stringify(renderer.toJSON()), /1 new/); assert.match(JSON.stringify(renderer.toJSON()), /Permission to feature: NO/);
    await act(async () => button('Mark read').props.onPress());
    assert.equal(status, 'read'); assert.match(JSON.stringify(renderer.toJSON()), /0 new/); assert.match(JSON.stringify(renderer.toJSON()), /Permission to feature: NO/);
    await act(() => { ui.AppState.currentState = 'background'; for (const fn of listeners) fn('background'); });
    assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Where are my snacks/);
    await act(async () => { ui.AppState.currentState = 'active'; for (const fn of listeners) fn('active'); });
    assert.match(JSON.stringify(renderer.toJSON()), /Where are my snacks/);
    await act(async () => button('Sign out of owner inbox').props.onPress());
    assert.equal(saved, null); assert.ok(field('Owner email')); assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Where are my snacks/);
  } finally { await act(() => renderer.unmount()); }
  assert.equal(listeners.size, 0); assert.equal(timers.size, 0);
});
