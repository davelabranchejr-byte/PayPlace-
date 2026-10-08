const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');

global.IS_REACT_ACT_ENVIRONMENT = true;
const source = fs.readFileSync(require('node:path').join(__dirname, '../App.js'), 'utf8');
// Exercise the actual budget form without importing native security or image assets.
function section(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}
const code = babel.transformSync([
  section('function money(', 'function parseDateSafe('),
  section('function BudgetScreen(', 'function DebtScreen('),
  section('function InputField(', 'function EmptyCard('),
].join('\n'), { configFile: false, babelrc: false,
  plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]],
}).code;
const sandbox = {
  React, useState: React.useState, useEffect: React.useEffect,
  ...Object.fromEntries(['View', 'Text', 'TextInput', 'ScrollView', 'TouchableOpacity',
    'SectionTitle', 'SafeMiniCard', 'CharacterArtwork', 'Ionicons'].map(name => [name, name])),
  styles: {}, palette: {}, approvedClothedCharacterArtwork: {}, portraits: { together: {} }, artStudioArtwork: {},
  scheduleSettings: () => ({ kind: 'biweekly' }), module: { exports: {} },
};
vm.runInNewContext(code + '\nmodule.exports = { BudgetScreen, cleanNumber };', sandbox);
const { BudgetScreen, cleanNumber } = sandbox.module.exports;

test('budget cents remain editable, saved and usable after reopening', async () => {
  const { mirrorBudget } = await import('../src/smart-mirror.mjs');
  const { createVaultStorage, FINANCE_KEY } = await import('../src/vault-storage.mjs');
  const records = new Map();
  let key = null;
  const adapters = {
    storage: { getItem: async k => records.get(k) ?? null,
      setItem: async (k, v) => records.set(k, v), removeItem: async k => records.delete(k) },
    readKey: async () => key, writeKey: async next => { key = next; },
    randomBytes: length => new Uint8Array(require('node:crypto').randomBytes(length)),
  };
  let finance = { balance: 1900, nextPaycheck: 2000, allowance: 20, buffer: 100,
    daysUntilPayday: 10, creditScore: 720, bills: [{ amount: '23.15' }], debts: [] };
  let renderer;
  const render = () => React.createElement(BudgetScreen, {
    finance, upcomingTotal: mirrorBudget(finance).bills, safeToSpend: mirrorBudget(finance).available,
    updateNumber: (field, text) => {
      finance = { ...finance, [field]: cleanNumber(text) };
      renderer.update(render());
    }, updateText: () => {}, resetDemoData: () => {},
  });
  const input = label => renderer.root.findAllByType('TextInput')
    .find(item => item.props.accessibilityLabel === label);
  await act(() => { renderer = create(render()); });
  try {
    for (const [label, key] of [['Current bank balance', 'balance'], ['Next paycheck amount', 'nextPaycheck'],
      ['Daily allowance', 'allowance'], ['Emergency buffer', 'buffer']]) {
      assert.equal(input(label).props.keyboardType, 'decimal-pad');
      for (const draft of ['', '1', '12', '123', '123.', '123.0', '123.05']) {
        await act(() => input(label).props.onChangeText(draft));
        assert.equal(input(label).props.value, draft, `${label} keeps ${JSON.stringify(draft)}`);
      }
      assert.equal(finance[key], 123.05);
      for (const invalid of ['123.456', '123..05', 'abc']) {
        await act(() => input(label).props.onChangeText(invalid));
        assert.equal(input(label).props.value, '123.05');
        assert.equal(finance[key], 123.05);
      }
      for (const draft of ['', '.', '.0', '.05', '123.1', '123.10']) {
        await act(() => input(label).props.onChangeText(draft));
        assert.equal(input(label).props.value, draft);
      }
      await act(() => input(label).props.onBlur());
      assert.equal(input(label).props.value, '123.10');
      assert.equal(finance[key], 123.1);
    }
    // Whole-number controls keep their existing behavior and keyboard.
    assert.equal(input('Days until payday').props.keyboardType, 'number-pad');
    assert.equal(input('Current credit score').props.keyboardType, 'number-pad');
    await act(() => input('Current bank balance').props.onChangeText('123.45'));
    await act(() => input('Emergency buffer').props.onChangeText('10.10'));
    await act(() => renderer.unmount());
    // Use the same encrypted persistence path as the app, then reopen the vault.
    await createVaultStorage(adapters).setItem(FINANCE_KEY, JSON.stringify(finance));
    finance = JSON.parse(await createVaultStorage(adapters).getItem(FINANCE_KEY));
    await act(() => { renderer = create(render()); });
    assert.equal(input('Current bank balance').props.value, '123.45');
    assert.equal(input('Next paycheck amount').props.value, '123.10');
    assert.equal(input('Emergency buffer').props.value, '10.10');
    assert.equal(finance.balance, 123.45);
    assert.equal(mirrorBudget(finance).available, 90.20);
    // External balance updates and reset data refresh the editable value.
    finance = { ...finance, balance: 345.67 };
    await act(() => renderer.update(render()));
    assert.equal(input('Current bank balance').props.value, '345.67');
  } finally {
    await act(() => renderer.unmount());
  }
});
