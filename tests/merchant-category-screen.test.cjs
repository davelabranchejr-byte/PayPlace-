const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const code = babel.transformSync(fs.readFileSync(path.join(__dirname, '../src/MerchantCategories.js'), 'utf8'), {
  configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
}).code;
async function fixture() {
  const logic = await import('../src/merchant-categories.mjs');
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, Date, Math, Intl, console, require: name => {
    if (name === './MascotTouchable') return { MascotTouchable: 'TouchableOpacity', MascotPressable: 'Pressable' };
    if (name === './Encouragement') return { EncouragementSpot: () => null };
    if (name === 'react') return React;
    if (name === 'react-native') return { ...Object.fromEntries(['KeyboardAvoidingView', 'Modal', 'SafeAreaView', 'ScrollView', 'TouchableOpacity', 'View'].map(n => [n, n])), Platform: { OS: 'ios' }, StyleSheet: { create: v => v } };
    if (name === './Privacy') return { Text: 'Text', TextInput: 'TextInput' };
    if (name === './FittedArtwork') return { __esModule: true, default: 'FittedArtwork' };
    if (name === './merchant-categories.mjs') return logic;
    if (name.startsWith('../assets/')) return { uri: name };
    throw new Error('Unexpected import ' + name);
  } });
  let state = logic.sampleCategoryState(), renderer, fail = false;
  const render = () => React.createElement(module.exports.default, { visible: true, sample: false, value: state, onClose() {}, onChange: async next => { if (fail) throw new Error('Could not save. Try again.'); state = next; renderer.update(render()); } });
  await act(() => { renderer = create(render()); });
  return { renderer, logic, get state() { return state; }, setFail: value => { fail = value; } };
}
const button = (r, label) => r.root.findAllByType('TouchableOpacity').find(n => n.props.accessibilityLabel === label);
const texts = r => r.root.findAllByType('Text').map(n => n.children.join('')).join('\n');
test('actual sheet corrects a purchase, remembers the rule, shows selected state and undoes it', async () => {
  const f = await fixture(); const r = f.renderer;
  try {
    await act(() => button(r, 'Change category for Costco, Shopping, Sample checking, $130.00').props.onPress());
    assert.equal(r.root.findAllByType('FittedArtwork').length, 4);
    await act(() => button(r, 'Choose Groceries').props.onPress());
    assert.equal(button(r, 'Choose Groceries').props.accessibilityState.selected, true);
    await act(() => button(r, 'Remember across my accounts').props.onPress());
    await act(() => r.root.findByProps({ accessibilityRole: 'checkbox' }).props.onPress());
    await act(async () => button(r, 'Save my choice').props.onPress());
    assert.equal(f.state.rules.length, 1);
    assert.equal(f.state.rules[0].accountId, null);
    assert.match(texts(r), /Costco → Groceries from now on/);
    await act(() => button(r, 'Remembered categories').props.onPress());
    assert.ok(button(r, 'Change Costco category'));
    await act(async () => button(r, 'Undo').props.onPress());
    assert.equal(f.state.rules.length, 0);
  } finally { await act(() => r.unmount()); }
});
test('failed persistence retains the draft and choices; a retry saves exactly once', async () => {
  const f = await fixture(); const r = f.renderer;
  try {
    await act(() => button(r, 'Change category for Costco, Shopping, Sample checking, $130.00').props.onPress());
    await act(() => button(r, 'Choose Clothing').props.onPress());
    f.setFail(true);
    await act(async () => button(r, 'Save my choice').props.onPress());
    assert.match(texts(r), /Could not save/);
    assert.equal(button(r, 'Choose Clothing').props.accessibilityState.selected, true);
    assert.equal(f.state.overrides.length, 0);
    f.setFail(false);
    await act(async () => button(r, 'Save my choice').props.onPress());
    assert.equal(f.state.overrides.length, 1);
    assert.equal(button(r, 'Save my choice'), undefined);
  } finally { await act(() => r.unmount()); }
});
test('split editor rejects mismatched totals, then keeps the exact categories and cents', async () => {
  const f = await fixture(); const r = f.renderer;
  const input = label => r.root.findByProps({ accessibilityLabel: label });
  try {
    await act(() => button(r, 'Change category for Costco, Shopping, Sample checking, $130.00').props.onPress());
    await act(() => button(r, 'Split this purchase').props.onPress());
    await act(() => input('Split 1 amount').props.onChangeText('100.00'));
    await act(() => input('Split 2 amount').props.onChangeText('29.99'));
    await act(async () => button(r, 'Save my choice').props.onPress());
    assert.match(texts(r), /add up/);
    assert.equal(f.state.overrides.length, 0);
    await act(() => input('Split 2 amount').props.onChangeText('30.00'));
    await act(async () => button(r, 'Save my choice').props.onPress());
    assert.equal(f.state.overrides.length, 1, texts(r));
    assert.equal(f.state.overrides[0].splits[1].amountCents, 3000);
    assert.equal(f.state.rules.length, 0);
  } finally { await act(() => r.unmount()); }
});
