const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '..');
const models = new Map();

test.before(async () => {
  for (const file of fs.readdirSync(path.join(root, 'src')).filter(name => name.endsWith('.mjs'))) {
    models.set(path.join(root, 'src', file), await import(path.join(root, 'src', file)));
  }
});

// Execute the real app and its components. Only native/device services are mocked.
function appHarness(savedFinance = {}) {
  const vaultModel = models.get(path.join(root, 'src/vault-storage.mjs'));
  const records = new Map([
    [vaultModel.PROFILE_KEY, JSON.stringify({ name: 'Dave', email: 'd@example.test', emailVerified: true, completed: true })],
    [vaultModel.FINANCE_KEY, JSON.stringify(savedFinance)],
  ]);
  const listeners = new Set();
  const appState = { currentState: 'active', addEventListener: (_, fn) => {
    listeners.add(fn); return { remove: () => listeners.delete(fn) };
  } };
  let resolveAuth, authCalls = 0;
  const ui = Object.fromEntries(['View', 'Text', 'TextInput', 'SafeAreaView', 'ScrollView', 'TouchableOpacity',
    'Pressable', 'KeyboardAvoidingView', 'ActivityIndicator'].map(name => [name, name]));
  const Image = props => React.createElement('Image', props);
  Image.resolveAssetSource = () => ({ width: 1536, height: 1024 });
  // Native Modal does not mount hidden content.
  const Modal = ({ visible, children, ...props }) => visible ? React.createElement('Modal', props, children) : null;
  Object.assign(ui, { Image, Modal, Platform: { OS: 'ios', select: values => values.ios ?? values.default }, AppState: appState,
    StyleSheet: { create: value => value, absoluteFillObject: { position: 'absolute' } },
    Alert: { alert() {} }, Linking: { openURL: async () => {}, openSettings: async () => {} },
    AccessibilityInfo: { isReduceMotionEnabled: async () => true, addEventListener: () => ({ remove() {} }) },
    Animated: { Value: class { setValue() {} interpolate() { return 0; } }, Text: 'AnimatedText' },
  });
  const cache = new Map();
  function load(file) {
    if (models.has(file)) return models.get(file);
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = babel.transformSync(fs.readFileSync(file, 'utf8'), {
      configFile: false, babelrc: false,
      plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
    }).code;
    function dependency(name) {
      if (name === 'react') return React;
      if (name === 'react-native') return ui;
      if (name === '@expo/vector-icons') return { Ionicons: 'Ionicons' };
      if (name === 'expo-status-bar') return { StatusBar: 'StatusBar' };
      if (name === 'expo-crypto') return { getRandomBytes: count => new Uint8Array(count) };
      if (name === 'expo-secure-store') return { getItemAsync: async () => 'enabled', setItemAsync: async () => {} };
      if (name === 'expo-local-authentication') return { SecurityLevel: { SECRET: 1 }, getEnrolledLevelAsync: async () => 2,
        authenticateAsync: () => { authCalls++; return new Promise(resolve => { resolveAuth = resolve; }); } };
      if (/\.(png|jpg|jpeg)$/.test(name)) return 1;
      if (name.endsWith('/secure-storage')) return {
        getItem: async key => records.get(key) ?? null,
        setItem: async (key, value) => records.set(key, value),
        removeItem: async key => records.delete(key),
        replaceAll: async values => { records.clear(); Object.entries(values).forEach(([key, value]) => records.set(key, value)); },
      };
      if (name.endsWith('/useBillReminders')) return { __esModule: true,
        default: () => ({ supported: true, count: 0 }), requestBillReminderPermission: async () => true };
      if (name.endsWith('/useSubscriptionReminders')) return { __esModule: true, default: () => ({ supported: true, count: 0 }) };
      if (name.endsWith('/backup-files')) return { pickBackupFile: async () => {}, saveBackupFile: async () => {} };
      if (name.startsWith('.')) {
        const target = path.resolve(path.dirname(file), name);
        return load(fs.existsSync(target) ? target : `${target}.js`);
      }
      throw new Error(`Unmocked device dependency: ${name}`);
    }
    vm.runInNewContext(code, { module, exports: module.exports, require: dependency, console, Date, Math,
      URL, URLSearchParams, fetch: () => { throw new Error('Unexpected network request'); },
      setInterval: () => 1, clearInterval() {}, setTimeout, clearTimeout,
    }, { filename: file });
    return module.exports;
  }
  return { App: load(path.join(root, 'App.js')).default, records,
    finance: () => JSON.parse(records.get(vaultModel.FINANCE_KEY)),
    authCalls: () => authCalls, completeAuthentication: result => resolveAuth(result),
    setAppState: state => { appState.currentState = state; listeners.forEach(fn => fn(state)); },
  };
}

test('a returning neighbor unlocks, enters Home and opens every Premium panel without a render crash', async () => {
  const harness = appHarness({ balance: 300, nextPaycheck: 500,
    bills: [{ id: 'power', name: 'Power', amount: '120.00', dueDate: '2026-10-01', status: 'Upcoming', category: 'utilities' }], debts: [] });
  let renderer, pending;
  await act(async () => { renderer = create(React.createElement(harness.App)); });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  try {
    assert.equal(button('Open PayPlace Premium'), undefined, 'finances must stay unmounted before authentication');
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => button('Checking device authentication').props.onPress());
    assert.equal(harness.authCalls(), 1);
    await act(async () => { harness.completeAuthentication({ success: false, error: 'user_cancel' }); await pending; });
    assert.equal(button('Open PayPlace Premium'), undefined);
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('background'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    assert.equal(button('Open PayPlace Premium'), undefined, 'background authentication cannot expose finances');
    await act(() => harness.setAppState('active'));
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('inactive'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => harness.setAppState('active'));
    assert.ok(button('Open PayPlace Premium'), 'the neighborhood renders after unlock');
    for (const title of ['Bills', 'Budget', 'Debt', 'Calm', 'Home']) {
      const nav = renderer.root.find(node => node.type?.name === 'BottomNav');
      const target = nav.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(text => text.props.children === title));
      await act(() => target.props.onPress());
    }
    await act(() => button('Open PayPlace Premium').props.onPress());
    const hub = renderer.root.find(node => node.type?.name === 'PremiumResilienceHub');
    assert.equal(hub.props.visible, true);
    for (const title of ['Round Up & Save', 'Life Happens Fund', 'Bill Shock Mode', "Help, I'm Falling Behind", 'Credit Center']) {
      const card = hub.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(text => text.props.children === title));
      assert.ok(card, `${title} is reachable`);
      await act(() => card.props.onPress());
    }
    await act(() => hub.props.onPremiumStateChange({ ...hub.props.premiumState, lifeHappensBalance: 125, rebuildMode: true }));
    assert.equal(harness.finance().premiumResilience.lifeHappensBalance, 125, 'Premium settings use the saved finance vault');
    await act(() => hub.props.onOpenSubscriptions());
    assert.equal(renderer.root.findAll(node => node.type?.name === 'PremiumResilienceHub').length, 0);
    assert.equal(renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.visible, true);
    await act(() => renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.onClose());
    await act(() => button('Open PayPlace Premium').props.onPress());
    await act(() => renderer.root.find(node => node.type?.name === 'PremiumResilienceHub').props.onOpenBankConnections());
    assert.equal(renderer.root.find(node => node.type?.name === 'BankConnections').props.visible, true);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'PremiumResilienceHub').length, 0);
    await act(() => renderer.root.find(node => node.type?.name === 'BankConnections').props.onClose());
    await act(() => renderer.unmount());
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => button('Open PayPlace Premium').props.onPress());
    assert.equal(renderer.root.find(node => node.type?.name === 'PremiumResilienceHub').props.premiumState.lifeHappensBalance, 125);
    await act(() => button('Close PayPlace Premium').props.onPress());
    assert.ok(button('Open PayPlace Premium'), 'closing Premium returns to Home');
    assert.equal(harness.finance().balance, 300, 'planning never changes real cash');
  } finally { await act(() => renderer.unmount()); }
});
