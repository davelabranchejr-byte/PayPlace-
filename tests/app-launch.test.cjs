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
function appHarness(savedFinance = {}, profile = { name: 'Dave', email: 'd@example.test', emailVerified: true, completed: true }) {
  const vaultModel = models.get(path.join(root, 'src/vault-storage.mjs'));
  const records = new Map([
    [vaultModel.PROFILE_KEY, JSON.stringify(profile)],
    [vaultModel.FINANCE_KEY, JSON.stringify(savedFinance)],
  ]);
  const listeners = new Set();
  const alerts = [], openedURLs = [];
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
    BackHandler: { addEventListener: () => ({ remove() {} }) }, Alert: { alert: (...args) => alerts.push(args) }, Linking: { openURL: async url => openedURLs.push(url), openSettings: async () => {} },
    AccessibilityInfo: { isReduceMotionEnabled: async () => true, addEventListener: () => ({ remove() {} }) },
    Animated: { Value: class { setValue() {} interpolate() { return 0; } }, Text: 'AnimatedText', View: 'AnimatedView', Image },
  });
  const cache = new Map();
  const imageIds = new Map();
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
      if (/\.(png|jpg|jpeg)$/.test(name)) {
        const asset = path.resolve(path.dirname(file), name);
        if (!imageIds.has(asset)) imageIds.set(asset, imageIds.size + 1);
        return imageIds.get(asset);
      }
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
      if (name.endsWith('/device-deletion')) return { clearDeviceRecords: async storage => storage.replaceAll({}) };
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
  return { App: load(path.join(root, 'App.js')).default,
    Mirror: load(path.join(root, 'src/BobbieSmartMirror.js')).default, records, alerts, openedURLs,
    finance: () => JSON.parse(records.get(vaultModel.FINANCE_KEY)),
    authCalls: () => authCalls, completeAuthentication: result => resolveAuth(result),
    setAppState: state => { appState.currentState = state; listeners.forEach(fn => fn(state)); },
  };
}

function assertIllustrationFits(illustration) {
  const image = illustration.findByType('Image');
  assert.equal(image.props.resizeMode, 'contain');
  assert.equal(image.props.style.width, '100%');
  assert.equal(image.props.style.height, '100%');
  assert.equal(image.props.style.position, undefined, 'native intrinsic dimensions must not override an absolute-positioned image');
  const frame = illustration.findByType('View');
  const style = Object.assign({}, ...frame.props.style);
  assert.equal(style.width, '100%');
  assert.equal(style.overflow, 'hidden');
  assert.ok(style.aspectRatio > 0, 'the enclosing frame has a resolved height');
}

test('Smart Mirror keeps all four panels inside the measured phone viewport after resizing', async () => {
  const harness = appHarness();
  let renderer;
  await act(async () => { renderer = create(React.createElement(harness.Mirror, {
    finance: { balance: 300, bills: [], debts: [] }, onAction: () => true, onBudget: () => {},
  })); });
  const byId = id => renderer.root.findAll(node => node.props.testID === id && typeof node.type === 'string')[0];
  const flatten = style => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));
  try {
    await act(() => byId('bobbie-smart-mirror').props.onPress());
    for (const width of [320, 353, 393, 430, 568, 844]) {
      await act(() => byId('smart-mirror-scroll').props.onLayout({ nativeEvent: { layout: { width } } }));
      for (const tab of ['check', 'treat', 'balance', 'looks']) {
        await act(() => byId(`mirror-tab-${tab}`).props.onPress());
        const scroll = byId('smart-mirror-scroll');
        assert.equal(flatten(scroll.props.contentContainerStyle).width, width,
          'vertical scroll content must have the viewport width, rather than an intrinsic image width');
        assert.equal(scroll.props.horizontal, undefined);
        const content = flatten(byId('smart-mirror-content').props.style);
        assert.equal(content.width, '100%');
        assert.ok(content.maxWidth <= 600, 'wide screens keep readable content');
        assert.equal(flatten(byId('smart-mirror-panel').props.style).width, '100%');
        assertIllustrationFits(renderer.root.findAll(n => n.type?.name === 'ContainedIllustration')[0]);
        assert.equal(renderer.root.findAllByType('TouchableOpacity').filter(n => n.props.accessibilityRole === 'tab').length, 4);
        assert.ok(renderer.root.findAllByType('TextInput').every(n => !n.props.style?.width || n.props.style.width === '100%'));
      }
    }
    await act(() => byId('mirror-tab-check').props.onPress());
    const field = label => renderer.root.findAllByType('TextInput').find(n => n.props.accessibilityLabel === label);
    await act(() => field('Full cost, including tax and fees').props.onChangeText('25.00'));
    const ask = renderer.root.findAllByType('TouchableOpacity').find(n => n.findAllByType('Text').some(t => t.props.children === 'Ask the mirror'));
    await act(() => ask.props.onPress());
    assert.ok(renderer.root.findAllByType('Text').some(n => n.props.children === 'There’s room in your current plan.'));
    await act(() => byId('close-smart-mirror').props.onPress());
    assert.equal(renderer.root.findAllByType('ScrollView').length, 0);
  } finally { await act(() => renderer.unmount()); }
});

test('a returning neighbor unlocks, enters Home and opens every Premium panel without a render crash', async () => {
  const harness = appHarness({ balance: 300, nextPaycheck: 500,
    bills: [{ id: 'power', name: 'Power', amount: '120.00', dueDate: '2026-10-01', status: 'Upcoming', category: 'utilities' }], debts: [] });
  let renderer, pending;
  await act(async () => { renderer = create(React.createElement(harness.App)); });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  try {
    assert.equal(button('Open Plaid Banking'), undefined, 'finances must stay unmounted before authentication');
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => button('Checking device authentication').props.onPress());
    assert.equal(harness.authCalls(), 1);
    await act(async () => { harness.completeAuthentication({ success: false, error: 'user_cancel' }); await pending; });
    assert.equal(button('Open Plaid Banking'), undefined);
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('background'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    assert.equal(button('Open Plaid Banking'), undefined, 'background authentication cannot expose finances');
    await act(() => harness.setAppState('active'));
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('inactive'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => harness.setAppState('active'));
    assert.ok(button('Open Plaid Banking'), 'the neighborhood renders after unlock');
    assert.ok(button('Try Bobbie’s banking demo'), 'the demo has a prominent Home entrance');
    assert.equal(renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='tab').length,6,'all six primary destinations fit in one row');
    assert.equal(button('Open Extra Paycheck Calendar'),undefined,'payday tools have one home in Budget');
    assert.equal(button('Open Subscription Detective'),undefined,'manual subscriptions live in Bills');
    const home=renderer.root.find(node=>node.type?.name==='HomeScreen');
    assert.equal(home.findByType('ScrollView').children[0].type.name,'SeasonalWelcome','Annie welcomes visitors before the banking section');
    assert.equal(home.findByType('ScrollView').children[1].type.name,'BankWelcomeCard','the banking demo follows the welcome scene');
    assert.equal(renderer.root.findAll(node=>node.type?.name==='LivingNeighborhood').length,0,'the panorama is absent from Home and its shared header');
    await act(()=>button('Open Neighborhood').props.onPress());
    assert.equal(renderer.root.findAll(node=>node.type?.name==='LivingNeighborhood').length,1,'Neighborhood has exactly one animated panorama');
    assert.ok(renderer.root.findAllByType('ScrollView').some(node=>node.children[0]?.type?.name==='LivingNeighborhood'),'the panorama is at the top of the Neighborhood page');
    await act(()=>button('Open Home').props.onPress());
    assert.equal(renderer.root.findAll(node=>node.type?.name==='LivingNeighborhood').length,0,'the panorama unmounts when leaving Neighborhood');
    const priorDemo=JSON.stringify(harness.finance());
    await act(()=>button('Try Bobbie’s banking demo').props.onPress());
    assert.ok(button('Open Bobbie’s banking demo'),'Home opens the demo directly without account setup');
    for(const [label,value] of [['Demo username','Bobbie'],['Demo password','litterbox']]) await act(()=>renderer.root.findAllByType('TextInput').find(node=>node.props.accessibilityLabel===label).props.onChangeText(value));
    await act(()=>button('Open Bobbie’s banking demo').props.onPress());
    assert.equal(JSON.stringify(harness.finance()),priorDemo,'starting the Home demo preserves the personal vault');
    await act(()=>button('Return to my personal plan').props.onPress());
    assert.equal(JSON.stringify(harness.finance()),priorDemo);
    const steps = renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === 'Open One small step');
    await act(() => steps.props.onPress());
    assert.ok(button('Open task: Review Power'));
    await act(() => button('Complete task: Review Power').props.onPress());
    assert.ok(harness.finance().smallSteps.done.includes('bill-power'));
    assert.equal(harness.finance().bills[0].status, 'Upcoming', 'completing a review must not mark a bill paid');
    await act(() => button('Open task: Review Power').props.onPress());
    const homeNav = renderer.root.find(node => node.type?.name === 'NeighborhoodNav');
    await act(() => homeNav.props.switchTab('Home'));
    const destinations = models.get(path.join(root, 'src/neighborhood-destinations.mjs')).NEIGHBORHOOD_DESTINATIONS;
    const neighbors=models.get(path.join(root, 'src/neighborhood-destinations.mjs')).NEIGHBOR_DESTINATIONS;
    const openDestination=async(id,label)=>{if(neighbors.some(place=>place.id===id))await act(()=>button('Open Neighborhood').props.onPress());await act(()=>button(`Open ${label}`).props.onPress());};
    for (const { id, label } of destinations) {
      await openDestination(id,label);
      const selected = button(neighbors.some(place=>place.id===id)?'Open Neighborhood':`Open ${label}`);
      assert.equal(selected.props.accessibilityState.selected, true);
      if (id === 'Home') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 0, 'Home no longer duplicates the mirror');
      if (id === 'Bobbie') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 1, 'the working mirror lives inside Bobbie’s building');
      if (id === 'Tate') assertIllustrationFits(renderer.root.find(node => node.type?.name === 'ContainedIllustration'));
      await act(() => button(`How ${label} works`).props.onPress());
      assert.ok(renderer.root.findAllByType('Text').some(node => [].concat(node.props.children).join('') === `${label}: a place to start`), 'each building opens its own instructions');
      await act(() => button('Close tab instructions').props.onPress());
    }
    await openDestination('Spa','Em’s Pet Spa');
    assert.ok(button('Back to Neighborhood'),'character visits keep a clear return path');
    for (let scene = 0; scene < 5; scene++) {
      assertIllustrationFits(renderer.root.find(node => node.type?.name === 'ContainedIllustration'));
      await act(() => button('Next spa scene').props.onPress());
    }
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
    await openDestination('Annie','Annie’s House');
    await act(() => renderer.root.findAllByType('Pressable').find(node => node.props.testID === 'family-portrait-westley').props.onPress());
    assert.ok(button('Back to Annie’s House'));
    await act(() => button('Back to Annie’s House').props.onPress());
    await act(() => button('Open Plaid Banking').props.onPress());
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
      await press('Back to Plaid Banking');
    }
    await press('Account connections & beta setup');
    await press('Connect sample accounts');
    await press('Back to Plaid Banking');
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
    await press('Back to Plaid Banking');
    await press('Open Life Happens Fund');
    await input('Life Happens target ($)', '120.00');
    await input('Contribution per payday ($)', '50.00');
    await press('Save fund preferences');
    await toggle('Enable sample payday savings', true);
    await press('Simulate next payday');
    assert.equal(harness.finance().premiumBeta.sampleFund, 120, 'sample savings stop at the goal');
    assert.equal(button('Simulate next payday').props.disabled, true, 'a reached savings goal disables another contribution');
    assert.equal(harness.finance().premiumResilience.lifeHappensBalance, 0, 'sample savings do not change the saved real cushion');
    await press('Back to Plaid Banking');
    await press('Open Bill Shock Mode');
    await toggle('Use sample budget for this plan', true);
    await input('Unexpected expense ($)', '300.25');
    await press('Save Gentlest recovery plan');
    assert.deepEqual(harness.finance().premiumBeta.savedRecovery, { choice: 'gentlest', expense: 300.25 });
    await press('Back to Plaid Banking');
    await press('Open Credit Center');
    await press('Refresh sample credit score');
    assert.equal(harness.finance().premiumBeta.creditRefreshes, 1);
    await press('Back to Plaid Banking');
    await press('Open Automatic Money Watch');
    await press('Refresh sample watch feed');
    await press('Open Subscription Detective');
    assert.equal(renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.visible, true);
    await act(() => renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.onClose());
    assert.ok(button('Refresh sample watch feed'), 'closing Detective returns to the same premium feature');
    await press('Back to Plaid Banking');
    await press('Account connections & beta setup');
    await press('View live bank-linking availability');
    assert.equal(renderer.root.find(node => node.type?.name === 'BankConnections').props.visible, true);
    await act(() => renderer.root.find(node => node.type?.name === 'BankConnections').props.onClose());
    await press('Back to Plaid Banking');
    await nav('Home');
    assert.equal(renderer.root.findAllByType('TouchableOpacity').some(node=>node.props.accessibilityLabel?.startsWith('Credit Score:')),false,'Home no longer duplicates the credit dashboard');
    await nav('Premium');await press('Open Credit Center');
    assert.ok(button('Refresh sample credit score'));
    await input('Current credit score','730');assert.equal(harness.finance().creditScore,730,'credit editing stays with its dashboard');
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
    await press('Back to Plaid Banking');
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
    await press('Back to Plaid Banking');
    await press('Open Help, I’m Falling Behind');
    await press('Review my bills');
    assert.equal(renderer.root.findAll(node => node.type?.name === 'PremiumResilienceHub').length, 0);
    assert.equal(harness.finance().balance, 300, 'all beta flows leave real cash unchanged');
    assert.equal(harness.finance().bills[0].amount, '120.00', 'planning does not pay or change saved bills');
  } finally { await act(() => renderer.unmount()); }
});

test('launch features open, payment corrections persist, sample stays separate and Quiet Mode masks totals', async () => {
  const payday=new Date();payday.setDate(payday.getDate()+8);
  const date=models.get(path.join(root,'src/launch-essentials.mjs')).localDate(payday);
  const harness=appHarness({balance:321.45,nextPaycheckDate:date,firstWinComplete:true,bills:[{id:'p',name:'Power',amount:'20.05',dueDate:date,status:'Upcoming'}],debts:[]});
  let renderer,pending;
  const button=label=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===label);
  const press=async label=>{assert.ok(button(label),label);await act(()=>button(label).props.onPress());};
  const input=async(label,text)=>{const n=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel===label);assert.ok(n,label);await act(()=>n.props.onChangeText(text));};
  try {
    await act(async()=>{renderer=create(React.createElement(harness.App));});
    await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
    await act(async()=>{harness.completeAuthentication({success:true});await pending;});
    for(const [tab,title] of [['Budget','Until next payday'],['Bills','Undo & payment history'],['Home','Your first win with Annie'],['Neighborhood','Quiet Mode']]){await press(`Open ${tab}`);await press(`Open ${title}`);await press('Back to neighborhood');}
    await press('Open Bills');
    const paidButton=renderer.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(t=>t.props.children==='Record payment'));
    await act(()=>paidButton.props.onPress());
    assert.equal(harness.finance().paymentHistory[0].kind,'recorded');
    await press('Open Bills');await press('Open Undo & payment history');
    await press('Correct amount for Power');await input('Corrected payment amount','15.05');await press('Save payment correction');
    assert.equal(harness.finance().bills[0].amount,'15.05');
    await press('Undo record change for Power');assert.equal(harness.finance().bills[0].amount,'20.05');assert.equal(harness.finance().balance,321.45);
    await press('Back to neighborhood');await press('Open Home');await press('Open Your first win with Annie');await press('Explore the sample neighborhood');
    assert.equal(harness.finance().balance,321.45);assert.equal(harness.finance().bills[0].id,'p');
    await press('Open Budget');
    await act(()=>renderer.root.find(n=>n.type?.name==='BudgetScreen').props.resetDemoData());
    assert.equal(harness.finance().balance,321.45);assert.equal(harness.finance().bills[0].id,'p');
    await press('Return to my personal plan');await press('Open Neighborhood');await press('Open Quiet Mode');
    await press('Hide dollar amounts');await press('Reduce neighborhood animation');await press('Pause Annie’s weekly and absence check-ins');
    await input('Reminder time (24-hour HH:MM, local time)','02:45');await press('Save reminder time');
    assert.equal(harness.finance().quietMode.hour,2);assert.equal(harness.finance().quietMode.minute,45);
    await press('Back to neighborhood');
    await press('Open Neighborhood');await press('Open Em’s Pet Spa');
    assert.equal(renderer.root.find(node=>node.type?.name==='PetSpa').props.reduceAnimation,true,'spa obeys Quiet Mode animation preference');
    await press('Open Home');
    const nativeTexts=renderer.root.findAllByType('Text').map(n=>JSON.stringify(n.props.children)).join(' ');
    assert.doesNotMatch(nativeTexts,/\$321\.45|\$20\.05/);assert.match(nativeTexts,/\$•••/);
    await press('Open Until next payday');
    const balanceInput=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel==='Current bank balance');assert.equal(balanceInput.props.secureTextEntry,true);
    await press('Back to neighborhood');
    await act(()=>renderer.unmount());
    await act(async()=>{renderer=create(React.createElement(harness.App));});
    await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
    await act(async()=>{harness.completeAuthentication({success:true});await pending;});
    assert.equal(harness.finance().quietMode.hideAmounts,true);assert.equal(harness.finance().paymentHistory.length,3);
  }finally{if(renderer)await act(()=>renderer.unmount());}
});

test('an unverified new neighbor can explore samples and safely return to account setup', async()=>{
 const harness=appHarness({balance:0,bills:[],debts:[]},{name:'',completed:false});let renderer,pending;
 const button=label=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===label);
 try{
   await act(async()=>{renderer=create(React.createElement(harness.App));});
   await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
   await act(async()=>{harness.completeAuthentication({success:true});await pending;});
   assert.ok(button('Explore sample neighborhood before setup'));
   await act(()=>button('Explore sample neighborhood before setup').props.onPress());
   assert.ok(button('Open Until next payday'));
   assert.equal(harness.finance().balance,0);assert.deepEqual(harness.finance().bills,[]);
   await act(()=>button('Return to my personal plan').props.onPress());
   assert.ok(button('Explore sample neighborhood before setup'));
   assert.equal(button('Open Until next payday'),undefined,'samples do not bypass personal account verification');
 }finally{if(renderer)await act(()=>renderer.unmount());}
});

test('Bobbie banking demo works without verification or network and leaves personal finances intact', async () => {
 const harness=appHarness({balance:87,bills:[],debts:[]},{name:'',completed:false});let renderer,pending;
 const button=label=>renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel===label);
 const press=async label=>{assert.ok(button(label),label);await act(()=>button(label).props.onPress());};
 const input=async(label,value)=>{const field=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel===label);assert.ok(field,label);await act(()=>field.props.onChangeText(value));};
 const hub=()=>renderer.root.find(n=>n.type?.name==='PremiumResilienceHub');
 try {
  await act(async()=>{renderer=create(React.createElement(harness.App));});
  await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
  await act(async()=>{harness.completeAuthentication({success:true});await pending;});
  const personalBefore=JSON.stringify(harness.finance());
  await press('Try Bobbie’s banking demo before setup');
  await input('Demo username','Bobbie');await input('Demo password','wrong');
  await press('Open Bobbie’s banking demo');
  assert.ok(button('Back to Annie from banking demo'));
  assert.equal(renderer.root.findAll(n=>n.type?.name==='PremiumResilienceHub').length,0);
  await input('Demo username',' Bobbie ');await input('Demo password','litterbox');
  await press('Open Bobbie’s banking demo');
  assert.equal(hub().props.betaState.sampleConnected,true);
  assert.equal(hub().props.betaState.useSamplePlan,true);
  assert.equal(renderer.root.findAllByType('TextInput').some(n=>n.props.value==='litterbox'),false,'demo password is cleared');
  await press('Open Round Up & Save');
  await press('Turn on sample round-ups');await press('Simulate next purchase batch');
  assert.ok(hub().props.betaState.roundUpSaved>0);
  await press('Back to Plaid Banking');await press('Open Life Happens Fund');
  await press('Turn on sample payday savings');await press('Simulate next payday');
  assert.ok(hub().props.betaState.sampleFund>100);
  await press('Back to Plaid Banking');await press('Open Credit Center');await press('Refresh sample credit score');
  assert.equal(hub().props.betaState.creditRefreshes,1);
  await press('Back to Plaid Banking');await press('Open Automatic Money Watch');await press('Refresh sample watch feed');
  assert.equal(hub().props.betaState.watchRefreshes,1);
  await press('Back to Plaid Banking');await press('Account connections & beta setup');await press('Disconnect sample accounts');
  assert.equal(hub().props.betaState.sampleConnected,false);
  assert.equal(hub().props.betaState.roundUpEnabled,false);
  await input('Demo username','bobbie');await input('Demo password','litterbox');await press('Open Bobbie’s banking demo');
  assert.equal(hub().props.betaState.sampleConnected,true);
  await press('Reset sample activity');assert.equal(hub().props.betaState.creditRefreshes,0);
  assert.equal(JSON.stringify(harness.finance()),personalBefore,'all demo operations leave the stored personal plan unchanged');
  await press('Return to my personal plan');
  assert.ok(button('Try Bobbie’s banking demo before setup'));
  assert.equal(renderer.root.findAll(n=>n.type?.name==='PremiumResilienceHub').length,0,'demo login never verifies a real profile');
 } finally {if(renderer)await act(()=>renderer.unmount());}
});

test('privacy links open the public policy and confirmed device deletion does not resurrect the saved profile or finances', async () => {
  const harness = appHarness({ balance: 987, bills: [{ id: 'private-bill', name: 'Secret Bill', amount: '87', status: 'Upcoming' }], debts: [] }, { name: 'Private Neighbor', email: 'private@example.test', emailVerified: true, completed: true });
  let renderer, pending;
  await act(async () => { renderer = create(React.createElement(harness.App)); });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  try {
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => button('Open security and backup settings').props.onPress());
    await act(async () => button('Privacy Policy').props.onPress());
    assert.equal(harness.openedURLs.at(-1), 'https://payplace-dave.davelabranchejr.chatgpt.site/privacy');
    await act(() => button('Delete this device data only').props.onPress());
    const confirmation = harness.alerts.at(-1)[2].find(action => action.style === 'destructive');
    await act(() => { pending = confirmation.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    const saved = [...harness.records.values()].join(' ');
    assert.doesNotMatch(saved, /Secret Bill|Private Neighbor|private@example/);
    assert.ok(button('Open privacy and data deletion'), 'deletion returns to the welcome screen with privacy controls');
    await act(() => harness.setAppState('active'));
    assert.doesNotMatch([...harness.records.values()].join(' '), /Secret Bill|private@example/);
  } finally { await act(() => renderer.unmount()); }
});

test('compact money pages keep entries visible and open forms and neighborhood extras on demand', async () => {
  const harness = appHarness({ balance: 1900, firstWinComplete: true,
    bills: [{ id:'rent', name:'Rent', amount:'500', status:'Upcoming', due:'2026-10-23' }],
    debts: [{ id:'card', name:'Card', balance:600, apr:20, minimum:25 }], quietMode:{reduceAnimation:true} });
  let renderer, pending;
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  const press = async label => { assert.ok(button(label), label); await act(() => button(label).props.onPress()); };
  const input = label => renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === label);
  try {
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({success:true}); await pending; });
    assert.ok(renderer.root.find(node => node.type?.name === 'SeasonalWelcome'), 'gentle welcome remains on Home');
    await press('Open Bills');
    assert.ok(renderer.root.find(node => node.type?.name === 'BillRow' && node.props.bill.id === 'rent'));
    assert.equal(input('Bill name'), undefined);
    await press('Add a bill');
    await act(() => input('Bill name').props.onChangeText('Internet draft'));
    await press('Close add a bill');
    assert.equal(input('Bill name'), undefined);
    await press('Add a bill');
    assert.equal(input('Bill name').props.value, 'Internet draft', 'closing the form keeps the draft');
    await act(() => renderer.root.findByType('Modal').props.onRequestClose());
    assert.equal(input('Bill name'), undefined, 'native dismiss closes the add sheet');
    await press('Open Debt');
    assert.equal(input('Debt name'), undefined);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'DebtBuddyScene').length, 0);
    await press('Add a debt');
    assert.ok(input('Debt name'));
    await press('Close add a debt');
    await press('Payoff strategy & guidance');
    assert.ok(renderer.root.find(node => node.type?.name === 'DebtBuddyScene'));
    await press('Payoff strategy & guidance');
    await press('Open Budget');
    assert.equal(input('Current bank balance'), undefined);
    await press('Edit money info');
    assert.ok(input('Current bank balance'));
    await press('Edit money info');
    assert.equal(input('Current bank balance'), undefined);
    await press('Open Neighborhood');
    assert.ok(renderer.root.find(node => node.type?.name === 'LivingNeighborhood'));
    assert.ok(button('Open Em’s Pet Spa'));
    assert.equal(renderer.root.findAll(node => node.type?.name === 'NeighborhoodWelcome').length, 0);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'NeighborCare').length, 0);
    await press('Annie’s porch & today’s poster');
    assert.ok(renderer.root.find(node => node.type?.name === 'NeighborhoodWelcome'));
    await press('Annie’s porch & today’s poster');
    await press('A little care from Annie');
    assert.ok(renderer.root.find(node => node.type?.name === 'NeighborCare'));
    assert.equal(renderer.root.findAllByProps({accessibilityRole:'tab'}).length, 6);
  } finally { if (renderer) await act(() => renderer.unmount()); }
});
