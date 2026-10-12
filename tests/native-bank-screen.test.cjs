const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
function fixture() {
  const calls = [], configs = [];
  let connected = false;
  const bank = { id: 'bank-test', institution: 'Test bank', accounts: [{ id: 'checking', name: 'Checking', available: 123, current: 150, currency: 'USD', mask: '1234' }], checkedAt: new Date().toISOString() };
  const api = async (path, options) => {
    calls.push({ path, options });
    if (path === 'banking-auth/status') return { sandboxEnabled: true };
    if (path === 'banking/status') return { configured: true, environment: 'sandbox', connections: connected ? [bank] : [] };
    if (path === 'banking/link-token') return { link_token: 'link-sandbox-test', session_id: 'link-session' };
    if (path === 'banking/exchange') { connected = true; return { connected: true }; }
    throw new Error('Unexpected bank request');
  };
  const code = babel.transformSync(fs.readFileSync(require('node:path').join(__dirname, '../src/BankConnections.native.js'), 'utf8'), { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'] }).code;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: name => {
    if (name === 'react') return React;
    if (name === 'react-native') return { ActivityIndicator: 'ActivityIndicator', Modal: 'Modal', ScrollView: 'ScrollView', TouchableOpacity: 'TouchableOpacity', View: 'View', StyleSheet: { create: v => v }, Platform: { OS: 'ios' } };
    if (name === './Privacy') return { Text: 'Text', TextInput: 'TextInput' };
    if (name === './alert') return { __esModule: true, default: { alert() {} } };
    if (name === './native-banking-api.mjs') return { createNativeBankApi: () => api };
    if (name === './bank-session.native') return { bankSessionStore: { read: async () => ({ token: 'a'.repeat(64), expiresAt: Date.now() + 100000 }), clear: async () => {} } };
    if (name === 'react-native-plaid-link-sdk') return { createPlaidLinkSession: async config => { configs.push(config); return { open: async fullScreen => assert.equal(fullScreen, true) }; } };
    throw new Error('Unexpected dependency ' + name);
  }, Date, Intl, console });
  return { Screen: module.exports.default, calls, configs };
}
const button = (renderer, title) => renderer.root.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(t => t.children.join('') === title));
test('native Link exchanges only its public token on success and Sandbox data never updates the personal plan', async () => {
  const f = fixture(); let renderer, balanceChanges = 0;
  await act(async () => { renderer = create(React.createElement(f.Screen, { visible: true, onClose() {}, onUseBalance() { balanceChanges++; } })); });
  try {
    let pending;
    await act(async () => { pending = button(renderer, 'Connect a Sandbox test bank').props.onPress(); });
    assert.equal(f.configs.length, 1); assert.equal(typeof f.configs[0].onEvent, 'function');
    assert.equal(f.calls.find(c => c.path === 'banking/link-token').options.data.platform, 'ios');
    await act(async () => { await f.configs[0].onSuccess({ publicToken: 'public-test' }); await pending; });
    const exchange = f.calls.find(c => c.path === 'banking/exchange'); assert.equal(exchange.options.data.public_token, 'public-test'); assert.equal(exchange.options.data.session_id, 'link-session');
    assert.ok(renderer.root.findAllByType('Text').some(node => node.children.join('').includes('$123.00')));
    assert.equal(balanceChanges, 0); assert.equal(button(renderer, 'Use in my plan'), undefined);
  } finally { await act(() => renderer.unmount()); }
});
test('cancelled native Link does not exchange, and duplicate taps cannot create a second session', async () => {
  const f = fixture(); let renderer;
  await act(async () => { renderer = create(React.createElement(f.Screen, { visible: true, onClose() {} })); });
  try {
    let pending;
    await act(async () => { const press = button(renderer, 'Connect a Sandbox test bank').props.onPress; pending = press(); await press(); });
    assert.equal(f.configs.length, 1);
    await act(async () => { f.configs[0].onExit({}); await pending; });
    assert.equal(f.calls.filter(c => c.path === 'banking/exchange').length, 0);
    assert.equal(button(renderer, 'Connect a Sandbox test bank').props.disabled, false);
  } finally { await act(() => renderer.unmount()); }
});
