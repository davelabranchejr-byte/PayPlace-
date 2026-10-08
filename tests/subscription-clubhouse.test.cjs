const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const React = require('react');
const { create, act } = require('react-test-renderer');
const babel = require('@babel/core');
global.IS_REACT_ACT_ENVIRONMENT = true;

test('Clubhouse supports add/edit cents, review decisions and beta disclosure without a purchase control', async () => {
  const model = await import('../src/subscription-detective.mjs');
  const { parseAmount } = await import('../src/smart-mirror.mjs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/SubscriptionDetective.js'), 'utf8');
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }], require('@babel/plugin-transform-modules-commonjs')] }).code;
  const ui = Object.fromEntries(['Image', 'KeyboardAvoidingView', 'Modal', 'SafeAreaView', 'ScrollView', 'Text', 'TextInput', 'TouchableOpacity', 'View'].map(name => [name, name]));
  ui.Image = { resolveAssetSource: () => ({ width: 1536, height: 1024 }) }; ui.StyleSheet = { create: value => value }; ui.Platform = { OS: 'ios' };
  const sandbox = { exports: {}, console, Date, Math, require: name => {
    if (name === 'react') return React;
    if (name === 'react-native') return ui;
    if (name === '@expo/vector-icons') return { Ionicons: 'Ionicons' };
    if (name.endsWith('subscription-detective.mjs')) return model;
    if (name.endsWith('smart-mirror.mjs')) return { parseAmount };
    if (name.endsWith('useBillReminders')) return { requestBillReminderPermission: async () => true };
    if (name.endsWith('alert')) return { alert: () => {} };
    if (name.endsWith('.png')) return 1;
    return 'CharacterArtwork';
  } };
  vm.runInNewContext(code, sandbox);
  const Clubhouse = sandbox.exports.default;
  let finance = { balance: 100, bills: [], debts: [], subscriptions: [] }, renderer;
  const render = () => React.createElement(Clubhouse, { visible: true, finance, onClose() {}, onBills() {}, reminderStatus: { supported: true, count: 0 }, onRemindersChange() {}, onAction(action) { finance = model.updateSubscription(finance, action); renderer.update(render()); return true; } });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(item => item.props.accessibilityLabel === label);
  const field = label => renderer.root.findAllByType('TextInput').find(item => item.props.accessibilityLabel === label);
  await act(() => { renderer = create(render()); });
  try {
    assert.match(JSON.stringify(renderer.toJSON()), /Available without charge during beta/);
    assert.equal(button('Buy Premium'), undefined);
    await act(() => button('Add a subscription or trial').props.onPress());
    await act(() => field('Subscription name').props.onChangeText('My app'));
    for (const value of ['9', '9.', '9.0', '9.05']) {
      await act(() => field('Recurring price (after trial, if any)').props.onChangeText(value));
      assert.equal(field('Recurring price (after trial, if any)').props.value, value);
    }
    await act(() => field('Next renewal (YYYY-MM-DD)').props.onChangeText('2026-11-08'));
    await act(() => button('Save this case').props.onPress());
    assert.equal(finance.subscriptions[0].amount, 9.05); assert.equal(finance.balance, 100);
    await act(() => button('Review it').props.onPress());
    assert.equal(finance.subscriptions[0].status, 'Review');
    await act(() => button('Edit My app').props.onPress());
    assert.equal(field('Subscription name').props.value, 'My app');
    await act(() => field('Recurring price (after trial, if any)').props.onChangeText('10.15'));
    await act(() => button('Save this case').props.onPress());
    assert.equal(finance.subscriptions.length, 1); assert.equal(finance.subscriptions[0].amount, 10.15);
  } finally { await act(() => renderer.unmount()); }
});
