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
    'Pressable', 'KeyboardAvoidingView', 'ActivityIndicator', 'Switch'].map(name => [name, name]));
  const Image = props => React.createElement('Image', props);
  Image.resolveAssetSource = () => ({ width: 1536, height: 1024 });
  // Native Modal does not mount hidden content.
  const Modal = ({ visible, children, ...props }) => visible ? React.createElement('Modal', props, children) : null;
  Object.assign(ui, { Image, Modal, Platform: { OS: 'ios', select: values => values.ios ?? values.default }, AppState: appState,
    StyleSheet: { create: value => value, absoluteFillObject: { position: 'absolute' } },
    BackHandler: { addEventListener: () => ({ remove() {} }) }, Alert: { alert() {} }, Linking: { openURL: async () => {}, openSettings: async () => {} },
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
      if (name.endsWith('/useAnnieCare')) return { __esModule: true, default: () => ({supported:true,error:false}) };
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
    assert.equal(button('Open The Clubhouse'), undefined, 'finances must stay unmounted before authentication');
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => button('Checking device authentication').props.onPress());
    assert.equal(harness.authCalls(), 1);
    await act(async () => { harness.completeAuthentication({ success: false, error: 'user_cancel' }); await pending; });
    assert.equal(button('Open The Clubhouse'), undefined);
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('background'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    assert.equal(button('Open The Clubhouse'), undefined, 'background authentication cannot expose finances');
    await act(() => harness.setAppState('active'));
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('inactive'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => harness.setAppState('active'));
    assert.ok(button('Open The Clubhouse'), 'the neighborhood renders after unlock');
    const steps = renderer.root.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(t => t.props.children === 'One small step'));
    await act(() => steps.props.onPress());
    assert.ok(button('Open task: Review Power'));
    await act(() => button('Complete task: Review Power').props.onPress());
    assert.ok(harness.finance().smallSteps.done.includes('bill-power'));
    assert.equal(harness.finance().bills[0].status, 'Upcoming', 'completing a review must not mark a bill paid');
    await act(() => button('Open task: Review Power').props.onPress());
    const homeNav = renderer.root.find(node => node.type?.name === 'NeighborhoodNav');
    await act(() => homeNav.props.switchTab('Home'));
    const destinations = models.get(path.join(root, 'src/neighborhood-destinations.mjs')).NEIGHBORHOOD_DESTINATIONS;
    for (const { id, label } of destinations) {
      await act(() => button(`Open ${label}`).props.onPress());
      const selected = button(`Open ${label}`);
      assert.equal(selected.props.accessibilityState.selected, true);
      if (id === 'Home') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 0, 'Home no longer duplicates the mirror');
      if (id === 'Bobbie') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 1, 'the working mirror lives inside Bobbie’s building');
      await act(() => button(`How ${label} works`).props.onPress());
      assert.ok(renderer.root.findAllByType('Text').some(node => [].concat(node.props.children).join('') === `${label}: a place to start`), 'each building opens its own instructions');
      await act(() => button('Close tab instructions').props.onPress());
    }
    await act(() => button('Open Em’s Pet Spa').props.onPress());
    const beforeSpa = harness.finance();
    await act(() => button('Next spa scene').props.onPress());
    assert.ok(renderer.root.findAllByType('Text').some(node => node.props.children === 'Westley’s top-secret makeover'));
    await act(() => renderer.root.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(t => t.props.children === 'Keep Westley’s secret')).props.onPress());
    assert.ok(renderer.root.findAllByType('Text').some(node => String(node.props.children).includes('Daddy will never suspect')));
    await act(() => button('Previous spa scene').props.onPress());
    await act(() => button('Hide neighborhood tabs').props.onPress());
    assert.equal(button('Open Home'), undefined);
    await act(() => button('Show neighborhood tabs').props.onPress());
    assert.ok(button('Open Home'));
    assert.deepEqual(harness.finance(), beforeSpa, 'spa interactions never change money records');
    await act(() => button('Open Annie’s House').props.onPress());
    await act(() => renderer.root.findAllByType('Pressable').find(node => node.props.testID === 'family-portrait-westley').props.onPress());
    assert.ok(button('Back to Annie’s House'));
    await act(() => button('Back to Annie’s House').props.onPress());
    await act(() => button('Open The Clubhouse').props.onPress());
    const hub = () => renderer.root.find(node => node.type?.name === 'PremiumResilienceHub');
    const press = async label => { assert.ok(button(label), label); await act(() => button(label).props.onPress()); };
    const toggle = async (label, value) => {
      const target = renderer.root.findAllByType('Switch').find(node => node.props.accessibilityLabel === label);
      assert.ok(target, label); await act(() => target.props.onValueChange(value));
    };
    const input = async (label, value) => {
      const target = renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === label);
      assert.ok(target, label); await act(() => target.props.onChangeText(value));
    };
    const nav = async title => press(`Open ${destinations.find(item => item.id === title).label}`);
    assert.equal(hub().props.embedded, true);
    for (const title of ['Round Up & Save', 'Life Happens Fund', 'Bill Shock Mode', 'Help, I’m Falling Behind', 'Automatic Money Watch', 'Credit Center']) {
      await press(`Open ${title}`);
      assert.equal(button('Open Round Up & Save'), undefined, 'feature opens a separate screen');
      await press('Hide instructions');
      assert.ok(button('Show instructions'), 'users can make room for controls after reading the steps');
      await press('Show instructions');
      await press('Back to Premium');
    }
    await press('Account connections & beta setup');
    await press('Connect sample accounts');
    await press('Back to Premium');
    await press('Open Round Up & Save');
    assert.equal(button('Simulate next purchase batch').props.disabled, true);
    await toggle('Enable sample round-ups', true);
    await input('Weekly round-up cap ($)', 'bad');
    await press('Save round-up cap');
    assert.equal(harness.finance().premiumResilience, undefined, 'invalid caps are not saved');
    await input('Weekly round-up cap ($)', '1.50');
    await press('Save round-up cap');
    await press('Round-up multiplier 2 times');
    await press('Simulate next purchase batch');
    assert.equal(harness.finance().premiumBeta.roundUpSaved, 1.5, 'the batch respects the saved cap');
    assert.equal(button('Simulate next purchase batch').props.disabled, true, 'a reached cap has an explicit stop');
    await toggle('Enable sample round-ups', false);
    assert.equal(button('Simulate next purchase batch').props.disabled, true);
    await press('Back to Premium');
    await press('Open Life Happens Fund');
    await input('Life Happens target ($)', '120.00');
    await input('Contribution per payday ($)', '50.00');
    await press('Save fund preferences');
    await toggle('Enable sample payday savings', true);
    await press('Simulate next payday');
    assert.equal(harness.finance().premiumBeta.sampleFund, 120, 'sample savings stop at the goal');
    assert.equal(button('Simulate next payday').props.disabled, true, 'a reached savings goal disables another contribution');
    assert.equal(harness.finance().premiumResilience.lifeHappensBalance, 0, 'sample savings do not change the saved real cushion');
    await press('Back to Premium');
    await press('Open Bill Shock Mode');
    await toggle('Use sample budget for this plan', true);
    await input('Unexpected expense ($)', '300.25');
    await press('Save Gentlest recovery plan');
    assert.deepEqual(harness.finance().premiumBeta.savedRecovery, { choice: 'gentlest', expense: 300.25 });
    await press('Back to Premium');
    await press('Open Credit Center');
    await press('Refresh sample credit score');
    assert.equal(harness.finance().premiumBeta.creditRefreshes, 1);
    await press('Back to Premium');
    await press('Open Automatic Money Watch');
    await press('Refresh sample watch feed');
    await press('Open Subscription Detective');
    assert.equal(renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.visible, true);
    await act(() => renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.onClose());
    assert.ok(button('Refresh sample watch feed'), 'closing Detective returns to the same premium feature');
    await press('Back to Premium');
    await press('Account connections & beta setup');
    await press('View live bank-linking availability');
    assert.equal(renderer.root.find(node => node.type?.name === 'BankConnections').props.visible, true);
    await act(() => renderer.root.find(node => node.type?.name === 'BankConnections').props.onClose());
    await press('Back to Premium');
    await nav('Home');
    const creditCard = renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel?.startsWith('Credit Score:'));
    await act(() => creditCard.props.onPress());
    assert.ok(button('Refresh sample credit score'), 'Home credit button goes directly to Credit Center');
    await nav('Premium');
    assert.ok(button('Open Round Up & Save'), 'Premium tab always opens the feature hub');
    await act(() => renderer.unmount());
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await nav('Premium');
    assert.equal(hub().props.betaState.sampleFund, 120);
    assert.equal(hub().props.betaState.roundUpEnabled, false);
    assert.equal(hub().props.premiumState.roundUpCap, 1.5);
    assert.equal(hub().props.betaState.creditRefreshes, 1, 'sample activity survives reopening');
    await press('Account connections & beta setup');
    await press('Disconnect sample accounts');
    assert.equal(harness.finance().premiumBeta.fundEnabled, false);
    await press('Reset sample activity');
    assert.equal(harness.finance().premiumBeta.sampleFund, 100);
    assert.equal(harness.finance().premiumResilience.roundUpCap, 1.5, 'reset keeps saved preferences');
    await press('Back to Premium');
    await press('Open Round Up & Save');
    assert.equal(button('Simulate next purchase batch').props.disabled, true);
    assert.ok(renderer.root.findAllByType('Text').some(node => typeof node.props.children === 'string' && node.props.children.includes('First connect sample accounts below')), 'disabled simulation explains its missing setup nearby');
    await press('Connect sample accounts');
    assert.ok(button('Simulate next purchase batch'), 'inline connection stays on the feature screen');
    assert.equal(button('Simulate next purchase batch').props.disabled, true, 'connection does not silently enable round-ups');
    await press('Turn on sample round-ups');
    assert.equal(button('Simulate next purchase batch').props.disabled, false);
    await press('Simulate next purchase batch');
    assert.equal(button('Simulate next purchase batch').props.disabled, true);
    await press('Start a new sample week');
    assert.equal(button('Simulate next purchase batch').props.disabled, false, 'resetting the week resolves the cap blocker');
    await press('Back to Premium');
    await press('Open Help, I’m Falling Behind');
    await press('Review my bills');
    assert.equal(renderer.root.findAll(node => node.type?.name === 'PremiumResilienceHub').length, 0);
    assert.equal(harness.finance().balance, 300, 'all beta flows leave real cash unchanged');
    assert.equal(harness.finance().bills[0].amount, '120.00', 'planning does not pay or change saved bills');
  } finally { await act(() => renderer.unmount()); }
});
