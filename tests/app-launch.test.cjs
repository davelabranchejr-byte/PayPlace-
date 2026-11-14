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

function textContent(children) {
  return React.Children.toArray(children).map(child =>
    React.isValidElement(child) ? textContent(child.props.children) : String(child)
  ).join('');
}

test.before(async () => {
  for (const file of fs.readdirSync(path.join(root, 'src')).filter(name => name.endsWith('.mjs'))) {
    models.set(path.join(root, 'src', file), await import(path.join(root, 'src', file)));
  }
});

// Execute the real app and its components. Only native/device services are mocked.
function appHarness(savedFinance = {}, profile = { name: 'Dave', email: 'd@example.test', emailVerified: true, completed: true }, scanner = {}, viewport = { width: 375, height: 812, fontScale: 1 }) {
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
    useWindowDimensions: () => viewport,
    StyleSheet: { create: value => value, flatten: function flatten(value) { return Array.isArray(value) ? Object.assign({}, ...value.map(flatten)) : value || {}; }, absoluteFillObject: { position: 'absolute' } },
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
      if (name.endsWith('/bill-import')) return {supportsBillImport:true,importBillDocuments:scanner.importDocuments || (async()=>null),importBillBatch:scanner.importBatch || (async()=>null)};
      if (name.endsWith('/monthly-calendar-print')) return { printCalendar: async () => {} };
      if (name.endsWith('/bill-photo')) return { supportsBillPhoto:true, scanBillPhoto:scanner.scanPhoto || (async () => null) };
      if (name === '@expo/vector-icons') return { Ionicons: 'Ionicons' };
      if (name === 'expo-status-bar') return { StatusBar: 'StatusBar' };
      if (name === 'expo-video') return { VideoView: 'VideoView', useVideoPlayer: (_, setup) => {
        const [player] = React.useState(() => {
          const instance = { replaceAsync: async () => {}, play() {}, pause() {}, addListener: () => ({ remove() {} }) };
          setup?.(instance); return instance;
        });
        return player;
      } };
      if (name === 'expo-crypto') return { getRandomBytes: count => new Uint8Array(count) };
      if (name === 'expo-screen-orientation') return { lockAsync: async () => {}, OrientationLock: { DEFAULT: 0, PORTRAIT_UP: 3 } };
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
        setItems: async values => { Object.entries(values).forEach(([key, value]) => records.set(key, value)); },
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
      URL, URLSearchParams, AbortController, fetch: scanner.weatherRequest || (() => { throw new Error('Unexpected network request'); }),
      setInterval: () => 1, clearInterval() {}, setTimeout, clearTimeout,
    }, { filename: file });
    return module.exports;
  }
  return { App: load(path.join(root, 'App.js')).default,
    Scanner: load(path.join(root, 'src/BillScanner.js')).default,
    Billiam: load(path.join(root, 'src/BilliamHome.js')).default,
    Household: load(path.join(root, 'src/HouseholdPlan.js')).default,
    Mirror: load(path.join(root, 'src/BobbieSmartMirror.js')).default, records, alerts, openedURLs,
    finance: () => JSON.parse(records.get(vaultModel.FINANCE_KEY)),
    artworkId: relativePath => imageIds.get(path.join(root, relativePath)),
    authCalls: () => authCalls, completeAuthentication: result => resolveAuth(result),
    setAppState: state => { appState.currentState = state; listeners.forEach(fn => fn(state)); },
  };
}

test('banking demo shares categories, spending, recurring detection and savings while Facebook opens the supplied community', async () => {
  const harness = appHarness({ balance: 87, bills: [], debts: [] });
  let renderer, pending;
  const button = label => renderer.root.findAll(n => ['TouchableOpacity', 'Pressable'].includes(n.type)).find(n => n.props.accessibilityLabel === label);
  const press = async label => { assert.ok(button(label), label); await act(async () => button(label).props.onPress()); };
  const input = async (label, value) => { const field = renderer.root.findAllByType('TextInput').find(n => n.props.accessibilityLabel === label); assert.ok(field, label); await act(() => field.props.onChangeText(value)); };
  const hub = () => renderer.root.find(n => n.type?.name === 'PremiumResilienceHub');
  try {
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    const personal = JSON.stringify(harness.finance());
    await press('Visit Daddy’s House from the map');
    await press('Open Daddy’s laptop to email him');
    assert.ok(button('Open Daddy’s owner inbox'));
    await press('Open an email draft instead');
    assert.equal(harness.openedURLs.at(-1), 'mailto:annieoaktree@payplace.app?subject=Hello%20Daddy%20%E2%80%94%20PayPlace');
    await press('Close Daddy’s laptop');
    await press('Open Daddy’s suggestion box');
    assert.ok(button('Close beta feedback'));
    await press('Close beta feedback');
    assert.equal(button('Close beta feedback'), undefined);
    await press('Join the Neighborhood on Facebook');
    assert.equal(harness.openedURLs.at(-1), 'https://www.facebook.com/share/1FRdYmPwum/?mibextid=wwXIfr');
    await press('Open Bills & Banking'); await press('Banking & subscriptions'); await press('Open Banking Demo'); await press('Try Bobbie’s banking demo'); await input('Demo username', 'Bobbie'); await input('Demo password', 'litterbox'); await press('Open Bobbie’s banking demo');
    assert.equal(hub().props.finance.bankActivity.source, 'demo');
    const importedIds=hub().props.finance.categorization.transactions.map(t=>t.id);
    assert.ok(button('View connected demo accounts'));
    await press('View connected demo accounts'); await press('Back to Banking Demo');
    await press('View connected demo accounts'); await press('Back to Banking Demo');
    assert.deepEqual(hub().props.finance.categorization.transactions.map(t=>t.id),importedIds,'viewing already loaded demo data never imports it twice');
    const bankingCategories = button('Open purchases and remembered categories')
      .find(node => node.type?.name === 'FittedArtwork');
    assert.equal(bankingCategories.props.source, harness.artworkId('assets/characters/feature-purchase-categories-bobbie.png'));
    await press('Open purchases and remembered categories');
    await press('Change category for Costco, Shopping, Sample checking, $130.00');
    await press('Choose Groceries'); await press('Remember for this account'); await press('Save my choice'); await press('← Back to my neighborhood');
    await press('Open Automatic Money Watch');
    assert.ok(renderer.root.findAllByType('Text').some(n => textContent(n.props.children).includes('Pawtify')));
    await press('Open Subscription Detective'); await press('Review detected CatFlix'); await press('Save this case');
    assert.equal(hub().props.finance.subscriptions.length, 1);
    assert.ok(hub().props.finance.subscriptions[0].detectionKey);
    assert.equal(button('Review detected CatFlix'), undefined, 'accepted clues do not appear twice');
    await press('Close Detective Clubhouse');
    await press('Back to Bills and Banking');
    await press('Banking & subscriptions');
    assert.equal(button('Plaid bank-linking availability'), undefined, 'a fictional plan cannot open bank linking');
    await press('Open Banking Demo'); await press('Open Round Up & Save');
    await press('Turn on sample round-ups'); await press('Simulate next purchase batch');
    const sample = hub().props.finance;
    assert.ok(sample.balance < 320);
    assert.ok(sample.premiumBeta.sampleFund > 100);
    const model = models.get(path.join(root, 'src/merchant-categories.mjs'));
    const costco = sample.categorization.transactions.find(t => t.id === 'demo-costco-1');
    assert.equal(model.purchaseCategory(sample.categorization, costco).category, 'Groceries');
    assert.equal(JSON.stringify(harness.finance()), personal, 'demo data never enters the stored personal plan');
    await press('Return to my personal plan');
    assert.equal(harness.finance().balance, 87);
  } finally { if (renderer) await act(() => renderer.unmount()); }
});

test('onboarding saves the chosen plan and payoff method with the verified profile', async () => {
  const vault = models.get(path.join(root, 'src/vault-storage.mjs'));
  const harness = appHarness({ bills: [], debts: [{ id: 'larger', balance: 500 }, { id: 'small', balance: 35 }] }, {
    name: 'Dave', email: 'd@example.test', emailVerified: true, completed: false,
    onboardingProgress: { version: 1, stage: 'questions', stepIndex: 7 },
  });
  let renderer, pending;
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node =>
    node.props.accessibilityLabel === label || textContent(node.props.children) === label);
  const press = async label => { assert.ok(button(label), label); await act(async () => button(label).props.onPress()); };
  try {
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await press('Mixed. Pay off one small balance, then focus on the highest interest rate.');
    await press('Next');
    await press('Plus. $4.99/month · Debt payoff tools, micropayments and printable calendar');
    await press('Meet Annie');
    const enter = renderer.root.findAllByType('TouchableOpacity').find(node => textContent(node.props.children).includes('Enter the neighborhood'));
    await act(async () => enter.props.onPress());
    assert.equal(harness.finance().payoffMode, 'mixed');
    assert.equal(harness.finance().mixedQuickWinId, 'small');
    assert.equal(JSON.parse(harness.records.get(vault.PROFILE_KEY)).planPreference, 'plus');
    await press('Open neighborhood menu');
    await press('Open PayPlace plans');
    assert.equal(button('Plus').props.accessibilityState.selected, true);
  } finally { if (renderer) await act(() => renderer.unmount()); }
});

test('Annie’s illustrated shelves, Daddy story and natural spa reading survive checkout and relaunch', async () => {
  const harness = appHarness({balance:321.45, bills:[], debts:[]});
  let renderer, pending;
  const button = label => renderer.root.findAll(node => ['TouchableOpacity','Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  const press = async label => {assert.ok(button(label), label); await act(() => button(label).props.onPress());};
  const unlock = async () => {
    await act(async () => {renderer = create(React.createElement(harness.App));});
    await act(() => {pending = button('Unlock PayPlace').props.onPress();});
    await act(async () => {harness.completeAuthentication({success:true}); await pending;});
  };
  const shelf = () => renderer.root.findByProps({testID:'library-shelf-artwork'}).props.source;
  const slot = () => renderer.root.findByProps({testID:'library-slot-A1'});
  const id = 'before-you-call-me-difficult';
  try {
    await unlock();
    await press('Visit Annie’s House from the map'); await press('Visit Annie’s Neighborhood Library');
    const stocked = shelf(), originalTarget = slot().props.style({pressed:false});
    assert.equal(slot().findAllByType('Image').length, 0, 'hit target is transparent; the shelf is one complete illustration');
    await press('Read Everyone Belongs Here by Daddy');
    assert.ok(renderer.root.findAllByType('Text').some(n => n.props.children === 'Money without shame.'));
    assert.ok(renderer.root.findAllByType('Text').some(n => typeof n.props.children === 'string' && n.props.children.includes('Your balance is a number. It is not a measure of your worth.')));
    await press('Back to the library shelves');
    await press('Take a closer look at the library');
    assert.equal(renderer.root.findAll(node=>node.type==='Pressable'&&node.props.testID==='library-slot-A1').length, 2, 'enlarged shelves retain working book targets');
    await press('Back to Annie’s library');
    await act(() => slot().props.onPress());
    await press('Choose Bobbie as reader');
    const borrow = button('Borrow for Bobbie');
    await act(() => {borrow.props.onPress(); borrow.props.onPress();});
    assert.equal(harness.finance().neighborhoodLibrary.loans[id].reader, 'bobbie');
    assert.equal(harness.finance().neighborhoodLibrary.history.length, 1, 'duplicate tap cannot duplicate loan');
    await press('Back to Annie’s library');
    const away = shelf();
    assert.notEqual(away, stocked, 'checkout selects the painted wooden-gap scene');
    assert.deepEqual(slot().props.style({pressed:false}), originalTarget, 'the book and its gap keep the exact same coordinates');
    await press('Open Home'); await press('Visit Bobbie’s Boutique from the map');
    assert.ok(renderer.root.findAllByType('Text').some(node => node.props.children === 'High maintenance, not high and mighty.'));
    const readingScene = renderer.root.findByProps({testID:'library-reading-scene-bobbie'});
    const paintedBook = readingScene.props.source;
    assert.equal(readingScene.findAllByType('Image').length, 1, 'character and held book are one painted scene');
    await press('Bobbie is reading Before You Call Me Difficult. Open book details');
    await press('View Emma’s book on Amazon');
    assert.equal(harness.openedURLs.at(-1), 'https://a.co/d/09P0VmeL');
    await press('Back to reading');
    await press('Open Home'); await press('Open neighborhood menu'); await press('Open Em’s Pet Spa');
    await press('Open Em’s scrapbook'); await press('Open Spa-day memories'); for (let i=0;i<3;i++) await press('Next spa scene');
    const spaBook = button('Open Emma’s book Bobbie is reading at the spa');
    assert.ok(spaBook, 'Bobbie’s borrowed book stays available in the past-visit scrapbook');
    assert.equal(spaBook.findAllByType('Image').find(n=>n.props.source===paintedBook)?.props.source, paintedBook, 'the spa displays the same naturally held book artwork');
    await press('Open Emma’s book Bobbie is reading at the spa');
    await press('Back to Em’s Pet Spa');
    await act(() => renderer.unmount());
    await unlock();
    assert.equal(harness.finance().neighborhoodLibrary.loans[id].reader, 'bobbie');
    await press('Open neighborhood menu'); await press('Open Em’s Pet Spa');
    await press('Open the library book Bobbie borrowed');
    await press('Return to shelf A1'); await press('Back to Em’s Pet Spa');
    assert.equal(button('Open Emma’s book Bobbie is reading at the spa'), undefined, 'return restores the magazine spa scene');
    await press('Open Home'); await press('Visit Annie’s House from the map'); await press('Visit Annie’s Neighborhood Library');
    assert.equal(shelf(), stocked, 'return restores the same fully stocked shelf');
    assert.deepEqual(slot().props.style({pressed:false}), originalTarget);
    assert.equal(harness.finance().neighborhoodLibrary.history.length, 2);
    assert.equal(harness.finance().balance, 321.45);
  } finally {if (renderer) await act(() => renderer.unmount());}
});


test('an existing Daddy checkout shows the couch reading scene after unlock and relaunch, then returns to A1', async () => {
  const {checkoutBook} = models.get(path.join(root, 'src/neighborhood-library.mjs'));
  const id = 'before-you-call-me-difficult';
  const savedLibrary = checkoutBook(undefined, id, 'daddy');
  const harness = appHarness({balance:88.21,bills:[],debts:[],neighborhoodLibrary:savedLibrary});
  let renderer, pending;
  const button = label => renderer.root.findAll(n => ['TouchableOpacity', 'Pressable'].includes(n.type)).find(n => n.props.accessibilityLabel === label);
  const press = async label => {assert.ok(button(label), label); await act(() => button(label).props.onPress());};
  const openLibrary = async () => {
    await act(async () => {renderer = create(React.createElement(harness.App));});
    await act(() => {pending = button('Unlock PayPlace').props.onPress();});
    await act(async () => {harness.completeAuthentication({success:true}); await pending;});
    await press('Visit Annie’s House from the map'); await press('Visit Annie’s Neighborhood Library');
  };
  try {
    await openLibrary();
    const scene = renderer.root.findByProps({testID:'library-reading-scene-daddy'});
    assert.ok(scene.props.source, 'saved Daddy loans must have actual artwork');
    assert.equal(scene.findAllByType('Image').length, 1, 'the held book and pet pile are one complete scene');
    assert.match(scene.props.accessibilityLabel, /Daddy reclining on Annie’s couch/);
    assert.match(scene.props.accessibilityLabel, /Bobbie, Westley, Tate and Chapo/);
    assertIllustrationFits(scene);
    const away = renderer.root.findByProps({testID:'library-shelf-artwork'}).props.source;
    const target = renderer.root.findByProps({testID:'library-slot-A1'}).props.style({pressed:false});
    await press('Daddy is reading Before You Call Me Difficult. Open book details');
    await press('Back to Annie’s library');
    await act(() => renderer.unmount());
    await openLibrary();
    assert.ok(renderer.root.findByProps({testID:'library-reading-scene-daddy'}));
    assert.equal(harness.finance().neighborhoodLibrary.loans[id].reader, 'daddy');
    await press('Daddy is reading Before You Call Me Difficult. Open book details');
    await press('Return to shelf A1'); await press('Back to Annie’s library');
    assert.equal(renderer.root.findAllByProps({testID:'library-reading-scene-daddy'}).length, 0);
    assert.notEqual(renderer.root.findByProps({testID:'library-shelf-artwork'}).props.source, away);
    assert.deepEqual(renderer.root.findByProps({testID:'library-slot-A1'}).props.style({pressed:false}), target);
    assert.equal(harness.finance().balance, 88.21);
  } finally {if (renderer) await act(() => renderer.unmount());}
});

function assertIllustrationFits(illustration) {
  const image = illustration.findAllByType('Image').find(n=>n.props.style?.width==='100%'&&n.props.style?.height==='100%');
  assert.equal(image.props.resizeMode, 'contain');
  assert.equal(image.props.style.width, '100%');
  assert.equal(image.props.style.height, '100%');
  assert.equal(image.props.style.position, undefined, 'native intrinsic dimensions must not override an absolute-positioned image');
  const frame = illustration.findAllByType('View')[0];
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
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  try {
    assert.equal(button('Open Bills & Banking'), undefined, 'finances must stay unmounted before authentication');
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => button('Checking device authentication').props.onPress());
    assert.equal(harness.authCalls(), 1);
    await act(async () => { harness.completeAuthentication({ success: false, error: 'user_cancel' }); await pending; });
    assert.equal(button('Open Bills & Banking'), undefined);
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('background'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    assert.equal(button('Open Bills & Banking'), undefined, 'background authentication cannot expose finances');
    await act(() => harness.setAppState('active'));
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(() => harness.setAppState('inactive'));
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => harness.setAppState('active'));
    const map = renderer.root.find(node => node.type?.name === 'LivingNeighborhood');
    assert.equal(map.props.showTreehouses, true);
    assert.equal(map.props.mapOnly, true);
    assert.equal(button('Open Home'), undefined, 'the map opens without the tab bar');
    const skipWelcome = button('Skip welcome and explore Home');
    if (skipWelcome) await act(() => skipWelcome.props.onPress());
    const rotationCue = () => renderer.root.findAllByType('Pressable')
      .find(node => node.props.testID === 'map-rotation-cue');
    assert.ok(rotationCue(), 'portrait has a dedicated full-map cue');
    assert.ok(rotationCue().findAllByType('AnimatedView')
      .some(node => node.props.testID === 'map-rotation-firefly' && node.props.style.at(-1).opacity === 0.95),
      'the arrow is still visible with Reduce Motion');
    await act(() => rotationCue().props.onPress());
    assert.equal(map.props.fullMap, true);
    assert.equal(rotationCue(), undefined);
    await act(() => button('Explore the map by swiping').props.onPress());
    assert.equal(map.props.fullMap, false);
    assert.ok(rotationCue());
    const shortcut = renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel?.startsWith('Safe to Spend,'));
    const artwork = shortcut.find(node => node.type === 'View' && node.props.testID === 'map-safe-to-spend-artwork');
    await act(() => artwork.props.onLayout({ nativeEvent: { layout: { width: 128, height: 128 / 1.5 } } }));
    const shortcutImage = shortcut.findByType('Image');
    assert.equal(shortcutImage.props.resizeMode, 'cover');
    assert.equal(shortcutImage.props.source, harness.artworkId('assets/characters/money-mood-family-budget.jpg'));
    assert.equal(shortcutImage.props.style.width, 128);
    assert.equal(shortcutImage.props.style.height, 128 / 1.5);
    await act(() => shortcut.props.onPress());
    const finances = renderer.root.find(node => node.type?.name === 'MyFinancesScreen');
    assert.ok(finances.findByProps({testID:'home-safe-to-spend'}));
    assert.equal(renderer.root.findAllByType('TouchableOpacity').filter(n=>n.props.accessibilityRole==='tab').length,4);
    assert.equal(finances.findAll(node => node.type?.name === 'SeasonalWelcome').length, 0);
    await act(() => button('Welcome & beta feedback').props.onPress());
    assert.equal(finances.findAll(node => node.type?.name === 'SeasonalWelcome').length, 1);
    await act(() => button('Welcome & beta feedback').props.onPress());
    const priorDemo=JSON.stringify(harness.finance());
    await act(()=>button('Open Bills & Banking').props.onPress());
    await act(()=>button('Banking & subscriptions').props.onPress());
    await act(()=>button('Open Banking Demo').props.onPress());
    await act(()=>button('Try Bobbie’s banking demo').props.onPress());
    assert.ok(button('Open Bobbie’s banking demo'),'Bills & Banking opens the demo without changing account setup');
    for(const [label,value] of [['Demo username','Bobbie'],['Demo password','litterbox']]) await act(()=>renderer.root.findAllByType('TextInput').find(node=>node.props.accessibilityLabel===label).props.onChangeText(value));
    await act(()=>button('Open Bobbie’s banking demo').props.onPress());
    assert.equal(JSON.stringify(harness.finance()),priorDemo,'starting the Home demo preserves the personal vault');
    await act(()=>button('Return to my personal plan').props.onPress());
    assert.equal(JSON.stringify(harness.finance()),priorDemo);
    await act(()=>button('Open neighborhood menu').props.onPress());
    await act(()=>button('Open My Finances').props.onPress());
    const steps = renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === 'Open One small step');
    await act(() => steps.props.onPress());
    assert.ok(button('Open task: Review Power'));
    await act(() => button('Complete task: Review Power').props.onPress());
    assert.ok(harness.finance().smallSteps.done.includes('bill-power'));
    assert.equal(harness.finance().bills[0].status, 'Upcoming', 'completing a review must not mark a bill paid');
    await act(() => button('Open task: Review Power').props.onPress());
    const destinations = models.get(path.join(root, 'src/neighborhood-destinations.mjs')).NEIGHBORHOOD_DESTINATIONS;
    const neighbors=models.get(path.join(root, 'src/neighborhood-destinations.mjs')).NEIGHBOR_DESTINATIONS;
    const openDestination = async (id, label) => {
      if (button('Open neighborhood menu')) await act(() => button('Open neighborhood menu').props.onPress());
      if (neighbors.some(place => place.id === id)) {
        if (!button('Close neighborhood menu')) await act(() => button('Open Home').props.onPress());
        if (button('Open neighborhood menu')) await act(() => button('Open neighborhood menu').props.onPress());
      }
      if (['Billiam', 'BankingDemo', 'Debt'].includes(id)) {
        await act(() => button('Open Bills & Banking').props.onPress());
        const group = id === 'BankingDemo' ? 'Banking & subscriptions' : 'Bill tools, debt & payments';
        const section = button(group);
        if (!section.props.accessibilityState.expanded) await act(() => section.props.onPress());
      }
      const target = {Bills:'Bills & Banking',Billiam:'Billiam’s bill tools',BankingDemo:'Banking Demo',Debt:'My debt plan'}[id] || label;
      await act(() => button(`Open ${target}`).props.onPress());
    };
    for (const { id, label } of destinations) {
      await openDestination(id,label);
      if (id === 'Home') await act(() => button('Open neighborhood menu').props.onPress());
      const selected = button(neighbors.some(place=>place.id===id)?'Open Home':['Bills','Billiam','BankingDemo','Debt'].includes(id)?'Open Bills & Banking':`Open ${label}`);
      assert.equal(selected.props.accessibilityState.selected, true);
      if (id === 'Home') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 0, 'Home no longer duplicates the mirror');
      if (id === 'Bobbie') assert.equal(renderer.root.findAll(node => node.type?.name === 'BobbieSmartMirror').length, 1, 'the working mirror lives inside Bobbie’s building');
      if (id === 'Tate') assert.ok(renderer.root.findAllByType('View').some(node => node.props.testID === 'neighbor-room-artwork'));
      await act(() => button(`How ${label} works`).props.onPress());
      assert.ok(renderer.root.findAllByType('Text').some(node => [].concat(node.props.children).join('') === `${label}: a place to start`), 'each building opens its own instructions');
      await act(() => button('Close tab instructions').props.onPress());
    }
    await openDestination('Spa','Em’s Pet Spa');
    assert.ok(button('Back to Neighborhood'),'character visits keep a clear return path');
    const spaScreen = renderer.root.find(node => node.type?.name === 'PetSpa');
    assert.equal(spaScreen.findAllByType('ScrollView').filter(view => view.props.horizontal).length, 0);
    await act(()=>button('Open current spa stay').props.onPress());
    for (let scene = 0; scene < 5; scene++) {
      assertIllustrationFits(renderer.root.find(node => node.type?.name === 'ContainedIllustration'));
      await act(() => button('Next spa scene').props.onPress());
    }
    await act(()=>button('Back to the spa room').props.onPress());
    await act(()=>button('Open Em’s scrapbook').props.onPress());
    await act(()=>button('Open Spa-day memories').props.onPress());
    const beforeSpa = harness.finance();
    await act(() => button('Next spa scene').props.onPress());
    assert.ok(renderer.root.findAllByType('Text').some(node => node.props.children === 'Westley’s top-secret makeover'));
    await act(() => renderer.root.findAllByType('TouchableOpacity').find(node => node.findAllByType('Text').some(t => t.props.children === 'Keep Westley’s secret')).props.onPress());
    assert.ok(renderer.root.findAllByType('Text').some(node => String(node.props.children).includes('Daddy will never suspect')));
    await act(() => button('Previous spa scene').props.onPress());
    assert.equal(button('Hide neighborhood tabs'), undefined, 'the four primary tabs stay visible');
    assert.ok(button('Open Home'));
    assert.deepEqual(harness.finance(), beforeSpa, 'spa interactions never change money records');
    await openDestination('Annie','Annie’s House');
    await act(()=>button('Open the family wall').props.onPress());
    const portraitTargets=renderer.root.findAllByType('Pressable').filter(node=>node.props.testID?.startsWith('family-portrait-'));
    assert.equal(portraitTargets.length,6);
    for(const portrait of portraitTargets){
      assert.equal(portrait.findAllByType('Image').length,0,'portrait tap regions must never cover a face with button artwork');
      assert.equal(portrait.findAllByType('View').length,0,'portrait tap regions must stay free of decorative button rims');
      for(const pressed of [false,true])assert.equal(Object.assign({}, ...portrait.props.style({pressed}).flat(Infinity).filter(Boolean)).position,'absolute');
    }
    await act(() => renderer.root.findAllByType('Pressable').find(node => node.props.testID === 'family-portrait-westley').props.onPress());
    assert.ok(button('Back to Annie’s House'));
    await act(() => button('Back to Annie’s House').props.onPress());
    await act(() => button('Open Bills & Banking').props.onPress());
    await act(() => button('Banking & subscriptions').props.onPress());
    await act(() => button('Open Banking Demo').props.onPress());
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
    const nav = async title => {
      if (button('Open neighborhood menu')) await press('Open neighborhood menu');
      const tool = {BankingDemo:'Banking Demo',Billiam:'Billiam’s bill tools',Debt:'My debt plan'}[title];
      if (tool) {
        await press('Open Bills & Banking');
        await press(title === 'BankingDemo' ? 'Banking & subscriptions' : 'Bill tools, debt & payments');
        await press(`Open ${tool}`);
      } else {
        await press(`Open ${title === 'Bills' ? 'Bills & Banking' : destinations.find(item=>item.id===title).label}`);
      }
    };
    assert.equal(hub().props.embedded, true);
    for (const title of ['Round Up & Save', 'Life Happens Fund', 'Bill Shock Mode', 'Help, I’m Falling Behind', 'Automatic Money Watch', 'Credit Center']) {
      await press(`Open ${title}`);
      assert.equal(button('Open Round Up & Save'), undefined, 'feature opens a separate screen');
      await press('Hide instructions');
      assert.ok(button('Show instructions'), 'users can make room for controls after reading the steps');
      await press('Show instructions');
      await press('Back to Banking Demo');
    }
    await press('Account connections & beta setup');
    await press('Connect sample accounts');
    await press('Back to Banking Demo');
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
    await press('Back to Banking Demo');
    await press('Open Life Happens Fund');
    await input('Life Happens target ($)', '120.00');
    await input('Contribution per payday ($)', '50.00');
    await press('Save fund preferences');
    await toggle('Enable sample payday savings', true);
    await press('Simulate next payday');
    assert.equal(harness.finance().premiumBeta.sampleFund, 120, 'sample savings stop at the goal');
    assert.equal(button('Simulate next payday').props.disabled, true, 'a reached savings goal disables another contribution');
    assert.equal(harness.finance().premiumResilience.lifeHappensBalance, 0, 'sample savings do not change the saved real cushion');
    await press('Back to Banking Demo');
    await press('Open Bill Shock Mode');
    await toggle('Use sample budget for this plan', true);
    await input('Unexpected expense ($)', '300.25');
    await press('Save Gentlest recovery plan');
    assert.deepEqual(harness.finance().premiumBeta.savedRecovery, { choice: 'gentlest', expense: 300.25 });
    await press('Back to Banking Demo');
    await press('Open Credit Center');
    await press('Refresh sample credit score');
    assert.equal(harness.finance().premiumBeta.creditRefreshes, 1);
    await press('Back to Banking Demo');
    await press('Open Automatic Money Watch');
    await press('Refresh sample watch feed');
    await press('Open Subscription Detective');
    assert.equal(renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.visible, false);
    assert.match(harness.alerts.at(-1)[0], /Paid Premium/);
    assert.match(harness.alerts.at(-1)[1], /add your subscriptions as bills/);
    await act(() => harness.alerts.at(-1)[2].find(action => action.text === 'Open my bills').onPress());
    assert.ok(button('Add a bill'), 'regular users can manually enter subscription bills');
    await press('Banking & subscriptions');
    await press('Open Banking Demo');
    await press('Account connections & beta setup');
    assert.equal(button('Plaid bank-linking availability'), undefined, 'sample banking does not offer a live connection');
    assert.equal(button('View live bank-linking availability'), undefined, 'the demo account page is sample-only');
    await press('Back to Bills and Banking');
    await press('Banking & subscriptions');
    await press('Plaid bank-linking availability');
    assert.equal(renderer.root.find(node => node.type?.name === 'BankConnections').props.visible, true);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'PremiumResilienceHub').length, 0, 'bank linking does not open the demo');
    await act(() => renderer.root.find(node => node.type?.name === 'BankConnections').props.onClose());
    await nav('Home');
    assert.equal(renderer.root.findAllByType('TouchableOpacity').some(node=>node.props.accessibilityLabel?.startsWith('Credit Score:')),false,'Home no longer duplicates the credit dashboard');
    await nav('BankingDemo');await press('Open Credit Center');
    assert.ok(button('Refresh sample credit score'));
    await input('Current credit score','730');assert.equal(harness.finance().creditScore,730,'credit editing stays with its dashboard');
    await nav('BankingDemo');
    assert.ok(button('Open Round Up & Save'), 'the Banking Demo always opens the feature hub');
    await act(() => renderer.unmount());
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await nav('BankingDemo');
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
    await press('Back to Banking Demo');
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
    await press('Back to Banking Demo');
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
  const button=label=>renderer.root.findAll(n=>['TouchableOpacity','Pressable'].includes(n.type)).find(n=>n.props.accessibilityLabel===label);
  const press=async label=>{assert.ok(button(label),label);await act(()=>button(label).props.onPress());};
  const input=async(label,text)=>{const n=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel===label);assert.ok(n,label);await act(()=>n.props.onChangeText(text));};
  try {
    await act(async()=>{renderer=create(React.createElement(harness.App));});
    await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
    await act(async()=>{harness.completeAuthentication({success:true});await pending;});
    for (const [tab,group,title] of [
      ['Budget','Paydays & savings','Until next payday'],
      ['Bills & Banking','Bill tools, debt & payments','Undo & payment history'],
      ['My Finances','Payday details & getting started','Your first win with Annie'],
      ['Home','Annie’s porch & quiet tools','Quiet Mode'],
    ]) {
      if (button('Open neighborhood menu')) await press('Open neighborhood menu');
      await press(`Open ${tab}`);
      if (tab === 'Home') await press('Open neighborhood menu');
      await press(group);
      await press(`Open ${title}`);
      await press('Back to neighborhood');
    }
    if (button('Open neighborhood menu')) await press('Open neighborhood menu');
    await press('Open Bills & Banking');
    const paidButton=renderer.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(t=>t.props.children==='Record payment'));
    await act(()=>paidButton.props.onPress());
    assert.equal(harness.finance().paymentHistory[0].kind,'recorded');
    assert.deepEqual(Array.from(harness.finance().quiltMilestones), ['firstBill','paidBill','plannedPayday']);
    await press('Bill tools, debt & payments');await press('Open Undo & payment history');
    await press('Correct amount for Power');await input('Corrected payment amount','15.05');await press('Save payment correction');
    assert.equal(harness.finance().bills[0].amount,'15.05');
    await press('Undo record change for Power');assert.equal(harness.finance().bills[0].amount,'20.05');assert.equal(harness.finance().balance,321.45);
    await press('Back to neighborhood');await press('Open My Finances');await press('Payday details & getting started');await press('Open Your first win with Annie');await press('Explore the sample neighborhood');
    assert.equal(harness.finance().balance,321.45);assert.equal(harness.finance().bills[0].id,'p');
    await press('Open neighborhood menu');
    await press('Open Budget');
    await act(()=>renderer.root.find(n=>n.type?.name==='BudgetScreen').props.resetDemoData());
    assert.equal(harness.finance().balance,321.45);assert.equal(harness.finance().bills[0].id,'p');
    await press('Return to my personal plan');await press('Open neighborhood menu');await press('Annie’s porch & quiet tools');await press('Open Quiet Mode');
    await press('Hide dollar amounts');await press('Reduce neighborhood animation');await press('Pause Annie’s weekly and absence check-ins');
    await input('Reminder time (24-hour HH:MM, local time)','02:45');await press('Save reminder time');
    assert.equal(harness.finance().quietMode.hour,2);assert.equal(harness.finance().quietMode.minute,45);
    await press('Back to neighborhood');
    if (button('Open neighborhood menu')) await press('Open neighborhood menu');
    await press('Open Em’s Pet Spa');
    assert.equal(renderer.root.find(node=>node.type?.name==='PetSpa').props.reduceAnimation,true,'spa obeys Quiet Mode animation preference');
    await press('Open My Finances');
    const nativeTexts=renderer.root.findAllByType('Text').map(n=>textContent(n.props.children)).join(' ');
    assert.doesNotMatch(nativeTexts,/\$321\.45|\$20\.05/);assert.match(nativeTexts,/\$•••/);
    await press('Payday details & getting started'); await press('Open Until next payday');
    const balanceInput=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel==='Current bank balance');assert.equal(balanceInput.props.secureTextEntry,true);
    await press('Back to neighborhood');
    await act(()=>renderer.unmount());
    await act(async()=>{renderer=create(React.createElement(harness.App));});
    await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
    await act(async()=>{harness.completeAuthentication({success:true});await pending;});
    assert.equal(harness.finance().quietMode.hideAmounts,true);assert.equal(harness.finance().paymentHistory.length,3);
  }finally{if(renderer)await act(()=>renderer.unmount());}
});

test('plan tabs keep primary navigation visible and open working tools without paid access in beta', async () => {
  const harness = appHarness({ balance: 87, quietMode: { hideAmounts: true },
    savingsGoals: [{ id: 'trip', name: 'Weekend trip', savedCents: 2000, targetCents: 10000 }] }, undefined, {}, {
    width: 320, height: 568, fontScale: 1.6,
  });
  let renderer, pending;
  const nodes = (type, predicate) => renderer.root.findAllByType(type).filter(predicate);
  const button = label => nodes('TouchableOpacity', node => node.props.accessibilityLabel === label)[0];
  const press = async label => {
    assert.ok(button(label), label);
    await act(() => button(label).props.onPress());
  };
  const pressCalendarButton = async label => {
    const target = nodes('Pressable', node =>
      node.props.accessibilityRole === 'button' &&
      node.findAllByType('Text').some(text => textContent(text.props.children) === label))[0];
    assert.ok(target, label);
    await act(() => target.props.onPress());
  };
  const texts = () => nodes('Text', () => true).map(node => textContent(node.props.children)).join(' ');
  const calendar = () => renderer.root.find(node => node.type?.name === 'MonthlyPaymentCalendar');

  try {
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await press('Open neighborhood menu');
    const directory = nodes('ScrollView', node => node.props.testID === 'neighborhood-destinations')[0];
    assert.equal(directory.props.horizontal, true);
    const cabaret = button('Open Bobbie’s Cabaret Show');
    const cabaretArt = cabaret.find(node => node.type?.name === 'FittedArtwork');
    assert.equal(cabaretArt.props.source, harness.artworkId('assets/characters/home-cabaret-bobbie.png'));
    assert.equal(cabaretArt.props.resizeMode, 'cover');
    assert.ok(button('Open Chapo’s Kitchen').findAllByType('Text').every(node => node.props.numberOfLines === undefined));
    await press('Open Chapo’s Kitchen');
    assert.equal(button('Open Home').props.accessibilityState.selected, true);
    await press('Back to Neighborhood');
    assert.equal(button('Open Chapo’s Kitchen'), undefined, 'returning opens the map');
    await press('Open neighborhood menu');
    await press('Open PayPlace plans');
    for (const label of ['Open Home', 'Open My Finances', 'Open Budget', 'Open Bills & Banking']) {
      const tab = button(label);
      assert.equal(tab.props.accessibilityRole, 'tab');
      assert.ok(tab.findAllByType('Text').every(text => text.props.numberOfLines === undefined),
        'large text may wrap instead of truncating the destination');
    }
    assert.equal(button('Basic').props.accessibilityState.selected, true);
    for (const [tier, artwork] of [
      ['Basic', 'plan-basic-daddy.png'], ['Plus', 'plan-plus-tate.png'],
      ['Premium', 'plan-premium-queen-bobbie.png'],
    ]) {
      const image = button(tier).findByType('Image');
      assert.equal(image.props.source, harness.artworkId(`assets/characters/${artwork}`));
      assert.ok(image.props.style.some(style => style.width === '100%'));
    }
    assert.match(texts(), /Start wherever you are. No shame./);
    assert.ok(button('Try free Banking Demo from Plans'));
    assert.match(texts(), /\$0\.99/);
    await press('Open Monthly calendar from Plans');
    assert.equal(calendar().props.canPrint, false);
    await pressCalendarButton('Close monthly calendar');

    await press('Plus');
    assert.equal(button('Plus').props.accessibilityState.selected, true);
    assert.match(texts(), /\$4\.99/);
    assert.match(texts(), /Small bites\. Big wins\./);
    const saved = JSON.stringify(harness.finance());
    await press('Open Money outlook from Plans');
    const outlook = renderer.root.find(node => node.type?.name === 'MoneyOutlook');
    const outlookText = () => outlook.findAllByType('Text').map(node => textContent(node.props.children)).join(' ');
    assert.match(outlookText(), /Estimated money left at the end of/);
    assert.doesNotMatch(outlookText(), /\$87\.00/);
    assert.match(outlookText(), /\$•••/);
    const month = new Date().toLocaleDateString('en-US', { month: 'long' });
    await press(`Spending in ${month}`);
    assert.match(outlookText(), /No purchases recorded this month/);
    await press('Savings per paycheck');
    await press('8 paychecks');
    assert.equal(button('8 paychecks').props.accessibilityState.selected, true);
    assert.match(outlookText(), /Weekend trip/);
    assert.doesNotMatch(outlookText(), /\$10\.00/);
    assert.equal(JSON.stringify(harness.finance()), saved, 'looking ahead does not write any financial data');
    await press('Close money outlook');
    await press('Open Printable monthly calendar from Plans');
    assert.equal(calendar().props.canPrint, true);
    await pressCalendarButton('Close monthly calendar');
    await press('Open Snowball, Mixed and Avalanche from Plans');
    assert.ok(button('Snowball: Quick wins first'), 'the payoff shortcut opens the strategies immediately');
    assert.equal(button('Open Bills & Banking').props.accessibilityState.selected, true);

    await press('Open PayPlace plans');
    assert.equal(button('Plus').props.accessibilityState.selected, true, 'the previous plan tab is remembered');
    await press('Premium');
    assert.match(texts(), /\$19\.99/);
    assert.match(texts(), /High maintenance, not high and mighty\./);
    assert.match(texts(), /Connected account insights/);
    assert.match(texts(), /Live bank sync and automatic subscription finding are planned/);
    assert.equal(button('Open Plaid bank sync from Plans'), undefined);
    assert.equal(button('Try free Banking Demo from Plans'), undefined);
    assert.equal(button('Try Subscription Detective with sample data from Plans'), undefined);
    const personal = JSON.stringify(harness.finance());
    await press('Basic');
    await press('Try free Banking Demo from Plans');
    await press('Open Automatic Money Watch');
    await press('Open Subscription Detective');
    assert.equal(renderer.root.find(node => node.type?.name === 'SubscriptionDetective').props.visible, true);
    await press('Close Detective Clubhouse');
    assert.match(texts(), /SAMPLE NEIGHBORHOOD/);
    assert.equal(JSON.stringify(harness.finance()), personal);
    await press('Return to my personal plan');
    assert.ok(button('Open neighborhood menu'));
  } finally {
    if (renderer) await act(() => renderer.unmount());
  }
});

test('an unverified new neighbor can explore samples and safely return to account setup', async()=>{
 const harness=appHarness({balance:0,bills:[],debts:[]},{name:'',completed:false});let renderer,pending;
 const button=label=>renderer.root.findAll(n=>['TouchableOpacity','Pressable'].includes(n.type)).find(n=>n.props.accessibilityLabel===label);
 try{
   await act(async()=>{renderer=create(React.createElement(harness.App));});
   await act(()=>{pending=button('Unlock PayPlace').props.onPress();});
   await act(async()=>{harness.completeAuthentication({success:true});await pending;});
   assert.ok(button('Explore sample neighborhood before setup'));
   await act(()=>button('Explore sample neighborhood before setup').props.onPress());
   await act(()=>button('Open neighborhood menu').props.onPress());
   await act(()=>button('Open My Finances').props.onPress());
   await act(()=>button('Payday details & getting started').props.onPress());assert.ok(button('Open Until next payday'));
   assert.equal(harness.finance().balance,0);assert.deepEqual(harness.finance().bills,[]);
   await act(()=>button('Return to my personal plan').props.onPress());
   assert.ok(button('Explore sample neighborhood before setup'));
   assert.equal(button('Open Until next payday'),undefined,'samples do not bypass personal account verification');
 }finally{if(renderer)await act(()=>renderer.unmount());}
});

test('Bobbie banking demo works without verification or network and leaves personal finances intact', async () => {
 const harness=appHarness({balance:87,bills:[],debts:[]},{name:'',completed:false});let renderer,pending;
 const button=label=>renderer.root.findAll(n=>['TouchableOpacity','Pressable'].includes(n.type)).find(n=>n.props.accessibilityLabel===label);
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
  await press('Back to Banking Demo');await press('Open Life Happens Fund');
  await press('Turn on sample payday savings');await press('Simulate next payday');
  assert.ok(hub().props.betaState.sampleFund>100);
  await press('Back to Banking Demo');await press('Open Credit Center');await press('Refresh sample credit score');
  assert.equal(hub().props.betaState.creditRefreshes,1);
  await press('Back to Banking Demo');await press('Open Automatic Money Watch');await press('Refresh sample watch feed');
  assert.equal(hub().props.betaState.watchRefreshes,1);
  await press('Back to Banking Demo');await press('Account connections & beta setup');await press('Disconnect sample accounts');
  assert.equal(hub().props.betaState.sampleConnected,false);
  assert.equal(hub().props.betaState.roundUpEnabled,false);
  await input('Demo username','bobbie');await input('Demo password','litterbox');await press('Open Bobbie’s banking demo');
  assert.equal(hub().props.betaState.sampleConnected,true);
  await press('Reset demo banking data');assert.equal(hub().props.betaState.creditRefreshes,0);
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
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  try {
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({ success: true }); await pending; });
    await act(() => button('Open neighborhood menu').props.onPress());
    await act(() => button('Open Security & backup').props.onPress());
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
  const weatherRequests = [];
  const harness = appHarness({ balance: 1900, firstWinComplete: true,
    bills: [{ id:'rent', name:'Rent', amount:'500', status:'Upcoming', due:'2026-10-23' }],
    debts: [{ id:'card', name:'Card', balance:600, apr:20, minimum:25 }], quietMode:{reduceAnimation:true} }, undefined, { weatherRequest: async url => {
      weatherRequests.push(url);
      return { ok: false };
    } });
  let renderer, pending;
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  const press = async label => { assert.ok(button(label), label); await act(() => button(label).props.onPress()); };
  const input = label => renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === label);
  try {
    await act(async () => { renderer = create(React.createElement(harness.App)); });
    await act(() => { pending = button('Unlock PayPlace').props.onPress(); });
    await act(async () => { harness.completeAuthentication({success:true}); await pending; });
    assert.equal(renderer.root.findAll(node => node.type?.name === 'SeasonalWelcome').length, 0);
    await press('Open neighborhood menu');
    await press('Open My Finances');
    const approvedLogo = harness.artworkId('assets/branding/payplace-icon.png');
    assert.deepEqual(button('How My Finances works').findAllByType('Image').map(image => image.props.source), [
      harness.artworkId('assets/characters/feature-how-home-works-daddy.png'), approvedLogo,
    ]);
    for (const [title, file] of [
      ['Review my bills', 'finances-bills-westley.jpg'],
      ['One small step', 'finances-step-tate.jpg'],
      ['Payoff methods', 'finances-payoff-bobbie.jpg'],
      ['Budget', 'finances-budget-chapo.jpg'],
    ]) {
      const expected = harness.artworkId(`assets/characters/${file}`);
      const tile = renderer.root.find(node => node.type === 'View' && node.props.testID === 'home-shortcuts')
        .find(node => node.type === 'TouchableOpacity' && node.props.accessibilityLabel === `Open ${title}`);
      const frame = tile.find(node => node.type === 'View' && typeof node.props.onLayout === 'function');
      await act(() => frame.props.onLayout({ nativeEvent: { layout: { width: 164, height: 164 } } }));
      assert.equal(tile.findByType('Image').props.source, expected);
      assert.equal(tile.findByType('Image').props.style.width, 164);
      assert.equal(renderer.root.findAllByType('Image').filter(image => image.props.source === expected).length, 1);
    }
    await press('Open Home');
    for (const label of ['Bobbie’s Cabaret', 'Daddy’s House', 'Em’s Pet Spa']) {
      const destination = button(`Visit ${label} from the map`);
      assert.equal(destination.findAllByType('Image').length, 0, 'the landmark is painted into the panorama');
    }
    await press('Visit Bobbie’s Cabaret from the map');
    assert.ok(button('Watch the Show — Meowgarita & Money'));
    await press('Back to the neighborhood');
    await press('Open neighborhood menu');
    await press('Open My Finances');
    await press('Open Payoff methods');
    assert.ok(button('Snowball: Quick wins first'));
    assert.ok(button('Mixed: Best of both'));
    assert.ok(button('Avalanche: Save more on interest'));
    await press('Micropayments: small extra payments');
    const tracker = renderer.root.find(node => node.type?.name === 'Micropayments' && node.props.visible);
    assert.equal(tracker.findAllByType('Image').length, 0, 'the logging screen has no full-width decorative hero');
    await press('Back to my plan');
    await press('Back to My Finances');
    assert.equal(button('Open security and backup settings').findAllByType('Image').length, 0);
    await press('Open Bills & Banking');
    assert.ok(renderer.root.find(node => node.type?.name === 'BillRow' && node.props.bill.id === 'rent'));
    assert.equal(button('Open My debt plan'), undefined);
    assert.equal(button('Open Banking Demo'), undefined);
    for (const [label, file] of [
      ['Add a bill', 'bills-add-billiam.jpg'],
      ['Open Monthly payment calendar', 'bills-calendar-billiam.jpg'],
    ]) {
      const tile = button(label);
      const frame = tile.find(node => node.type === 'View' && typeof node.props.onLayout === 'function');
      await act(() => frame.props.onLayout({ nativeEvent: { layout: { width: 164, height: 164 } } }));
      const image = tile.findByType('Image');
      assert.equal(image.props.source, harness.artworkId(`assets/characters/${file}`));
      assert.equal(image.props.style.width, 164);
      assert.equal(image.props.style.height, 164);
    }
    await press('Open Monthly payment calendar');
    const calendar = renderer.root.find(node => node.type?.name === 'MonthlyPaymentCalendar');
    assert.equal(calendar.props.canPrint, true);
    const pressCalendar = label => act(() => calendar.findAllByType('Pressable')
      .find(node => node.findAllByType('Text').some(text => text.props.children === label)).props.onPress());
    await pressCalendar('Add grooming appointment');
    await act(() => input('Pet name').props.onChangeText('Westley'));
    await act(() => input('Date (YYYY-MM-DD)').props.onChangeText('2026-10-05'));
    await pressCalendar('Save appointment');
    assert.equal(harness.finance().groomingAppointments[0].pet, 'Westley');
    const appointmentCell = calendar.findAllByType('View').find(node => node.props.accessibilityLabel?.includes('Grooming appointment'));
    assert.ok(appointmentCell.findAllByType('Image').some(image => image.props.source === harness.artworkId('assets/characters/calendar-grooming-9.png')));
    await pressCalendar('Edit grooming appointment on 2026-10-05');
    await act(() => input('Time (HH:MM, optional)').props.onChangeText('10:30'));
    await pressCalendar('Save appointment');
    assert.equal(harness.finance().groomingAppointments[0].time, '10:30');
    await pressCalendar('Close monthly calendar');
    const micropaymentShortcut = () => button('Micropayments: small extra payments');
    const measureArt = async (tile, width = 280) => {
      const frame = tile.find(node => node.type === 'View' && typeof node.props.onLayout === 'function');
      await act(() => frame.props.onLayout({ nativeEvent: { layout: { width, height: width / 1.5 } } }));
      const image = tile.findByType('Image');
      assert.equal(image.props.style.width, width);
      assert.equal(image.props.resizeMode, 'cover');
      return image.props.source;
    };
    assert.equal(micropaymentShortcut(), undefined);
    await press('Bill tools, debt & payments');
    const billMicro = harness.artworkId('assets/characters/bills-micropayments-billiam.jpg');
    assert.equal(await measureArt(micropaymentShortcut()), billMicro);
    for (const [label, file] of [
      ['Open Billiam’s bill tools', 'billiam-canonical.png'],
      ['Open My debt plan', 'snapshot-debt-plan.png'],
      ['Open Undo & payment history', 'feature-payment-history.png'],
    ]) assert.equal(await measureArt(button(label), 164), harness.artworkId(`assets/characters/${file}`));
    await press('Banking & subscriptions');
    for (const [label, file] of [
      ['Open Banking Demo', 'banking-demo-tile.jpg'],
      ['Open Subscription Detective', 'subscription-detective-bobbie-tile.jpg'],
    ]) assert.equal(await measureArt(button(label), 164), harness.artworkId(`assets/characters/${file}`));
    await press('Banking & subscriptions');
    assert.equal(input('Bill name'), undefined);
    await press('Add a bill');
    const methodNodes = renderer.root.findAll(node => node.type === 'TouchableOpacity' || node.type?.name === 'BilliamShortcut');
    const scanIndex = methodNodes.findIndex(node => node.type?.name === 'BilliamShortcut');
    const manualIndex = methodNodes.findIndex(node => node.type === 'TouchableOpacity' && node.props.onPress?.name === 'submitBill');
    const westleyIndex = methodNodes.findIndex(node => node.type === 'TouchableOpacity' && node.props.onPress?.name === 'importDemoBills');
    assert.ok(manualIndex < scanIndex && scanIndex < westleyIndex, 'Tate, Billiam, then Westley');
    assert.equal(await measureArt(button('Try sample bill review')),
      harness.artworkId('assets/characters/sample-bills-westley-mailman.png'));
    await act(() => input('Bill name').props.onChangeText('Internet draft'));
    await press('Close add a bill');
    assert.equal(input('Bill name'), undefined);
    await press('Add a bill');
    assert.equal(input('Bill name').props.value, 'Internet draft', 'closing the form keeps the draft');
    await act(() => renderer.root.findByType('Modal').props.onRequestClose());
    assert.equal(input('Bill name'), undefined, 'native dismiss closes the add sheet');
    await press('Open My debt plan');
    assert.equal(button('Back to Bills and Banking').findAllByType('Image').length, 0);
    assert.equal(input('Debt name'), undefined);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'DebtBuddyScene').length, 0);
    await press('Add a debt');
    assert.ok(input('Debt name'));
    await press('Close add a debt');
    await press('Payoff strategy & guidance');
    const debtHelp = harness.artworkId('assets/characters/feature-how-debt-works.png');
    assert.equal(button('How Debt works').findByType('Image').props.source, debtHelp);
    const debtMicro = harness.artworkId('assets/characters/feature-micropayments-westley.png');
    assert.equal(await measureArt(micropaymentShortcut()), debtMicro);
    assert.notEqual(debtMicro,billMicro);
    assert.equal(renderer.root.find(node => node.type?.name === 'DebtBuddyScene').findAllByType('Image').length, 0);

    const artworkByMethod = {
      snowball: '857054EA-5272-487D-BDD7-1F4ABE1F9DCA.png',
      mixed: 'debt-mixed-snowplow.png',
      avalanche: 'IMG_3610.png',
    };
    const strategy = method => renderer.root.findAllByType('TouchableOpacity')
      .find(node => node.props.testID === `payoff-method-${method}`);
    for (const [method, artwork] of Object.entries(artworkByMethod)) {
      assert.equal(await measureArt(strategy(method)), harness.artworkId(`assets/characters/${artwork}`));
      await act(() => strategy(method).props.onPress());
      assert.equal(strategy(method).props.accessibilityState.selected, true);
      assert.equal(harness.finance().payoffMode, method);
    }
    await press('Payoff strategy & guidance');
    await press('Open Budget');
    const budgetCategories = button('Open purchases and remembered categories')
      .find(node => node.type?.name === 'FittedArtwork');
    assert.equal(budgetCategories.props.source, harness.artworkId('assets/characters/feature-purchase-categories-daddy.png'));
    assert.equal(input('Current bank balance'), undefined);
    await press('Edit money info');
    assert.ok(input('Current bank balance'));
    await press('Edit money info');
    assert.equal(input('Current bank balance'), undefined);
    assert.equal(button('Open Savings Goals'), undefined);
    await press('Paydays & savings');
    await press('Open Money outlook');
    await press('Close money outlook');
    await press('Open Extra Paycheck Calendar');
    await press('Close extra paycheck calendar');
    assert.ok(button('Open Savings Goals'));
    await press('Open Home');
    await press('Open neighborhood menu');
    const directory = renderer.root.findAllByType('ScrollView').find(node => node.props.testID === 'neighborhood-destinations');
    assert.equal(directory.props.horizontal,true);
    const tiles = directory.findAllByType('TouchableOpacity');
    assert.deepEqual(tiles.map(tile => tile.props.accessibilityLabel), [
      'Open Em’s Pet Spa', 'Open Calm Garden', 'Open Annie’s House', 'Open Bobbie’s Boutique',
      'Open Westley’s Den', 'Open Tate’s Hangout', 'Open Chapo’s Kitchen', 'Open Daddy’s House',
    ]);
    const art = tiles.map(tile => tile.find(node => ['CharacterArtwork', 'FittedArtwork'].includes(node.type?.name)).props.source);
    assert.equal(new Set(art.map(source => JSON.stringify(source))).size, tiles.length);
    assert.equal(button('Visit the mascots'), undefined);
    assert.equal(button('Join the Neighborhood on Facebook'), undefined);
    await press('Close neighborhood menu');
    await press('Visit Em’s Pet Spa from the map');
    assert.ok(button('Open grooming appointments'));
    await press('Back to Neighborhood');
    await press('Visit Chapo’s Kitchen from the map');
    assert.ok(renderer.root.find(node => node.type?.name === 'NeighborRoom'));
    await press('Back to Neighborhood');
    await press('Tap the mailbox to visit Billiam');
    assert.equal(button('Open Home').props.accessibilityState.selected,true);
    await press('Back to Neighborhood');
    await press('Open neighborhood menu');
    await press('Open Home');
    await press('Tap the mailbox to visit Billiam');
    assert.ok(renderer.root.find(node => node.type?.name === 'BilliamHome'));
    assert.equal(button('Open Home').props.accessibilityState.selected, true);
    await press('Back to Neighborhood');
    await press('Tap the bridge to visit Calm Garden');
    const calm = renderer.root.find(node => node.type?.name === 'CalmScreen');
    await press('Open Annie stories');
    await press('Show me another story');
    const quoteFrame = calm.findByProps({testID:'calm-garden-quote-frame'});
    const caption = calm.findByProps({testID:'calm-garden-quote-caption'});
    await act(() => quoteFrame.props.onLayout({nativeEvent:{layout:{height:350}}}));
    await act(() => caption.props.onLayout({nativeEvent:{layout:{height:72}}}));
    assert.match(textContent(caption.findAllByType('Text').map(node => node.props.children)), /Rest is not falling behind/);
    assert.equal(caption.props.style.at(-1).marginTop,-72);
    await act(() => caption.props.onLayout({nativeEvent:{layout:{height:160}}}));
    assert.equal(caption.props.style.at(-1).marginTop,-77,'larger text can extend below the clear foreground');
    await press('Back to Neighborhood');
    await press('Open neighborhood menu');

    await press('Around town');
    assert.ok(renderer.root.findAllByType('Pressable').some(node => node.props.accessibilityLabel?.startsWith('Billiam, Mail carrier.')));
    await press('Around town');
    await press('Neighborhood weather');
    assert.deepEqual(weatherRequests, [], 'weather stays local until a ZIP is explicitly enabled');
    const weatherInput = input('U.S. ZIP code for neighborhood weather');
    await act(() => weatherInput.props.onChangeText('02108'));
    const weatherButton = title => renderer.root.findAllByType('Pressable')
      .find(node => node.findAllByType('Text').some(text => text.props.children === title));
    await act(async () => weatherButton('Use ZIP for weather').props.onPress());
    assert.deepEqual(weatherRequests, ['https://api.zippopotam.us/us/02108']);
    assert.equal(harness.finance().neighborhoodWeatherZip, '02108');
    assert.ok(renderer.root.findAllByType('Text').some(node => textContent(node.props.children).includes('Local weather unavailable')));
    await act(() => weatherButton('Use seasonal weather').props.onPress());
    assert.equal(harness.finance().neighborhoodWeatherZip, '');
    await press('Neighborhood weather');
    const neighborhoodTab = button('Open Home');
    const neighborhoodTabArt = neighborhoodTab.findByType('Image').props.source;
    assert.equal(neighborhoodTabArt, harness.artworkId('assets/characters/nav-neighborhood-homes.png'));
    assert.notEqual(neighborhoodTabArt, harness.artworkId('assets/characters/neighborhood-panorama-day.png'));
    assert.equal(renderer.root.findAll(node => node.type?.name === 'NeighborhoodWelcome').length, 0);
    assert.equal(renderer.root.findAll(node => node.type?.name === 'NeighborCare').length, 0);
    await press('Annie’s porch & quiet tools');
    await press('Annie’s porch & today’s poster');
    assert.ok(renderer.root.find(node => node.type?.name === 'NeighborhoodWelcome'));
    await press('Annie’s porch & today’s poster');
    await press('A little care from Annie');
    assert.ok(renderer.root.find(node => node.type?.name === 'NeighborCare'));
    assert.equal(renderer.root.findAll(n=>n.type==='TouchableOpacity'&&n.props.accessibilityRole==='tab').length, 4);
  } finally { if (renderer) await act(() => renderer.unmount()); }
});

test('Billiam contains the full artwork, reviews before saving and prevents duplicate saves', async () => {
  const harness = appHarness({}, undefined, {scanPhoto:async () => 'City Water\nAmount Due: $25.00\nDue date: 2026-11-20'});
  let renderer;
  const saved = [];
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  const press = async label => { assert.ok(button(label),label); await act(() => button(label).props.onPress()); };
  try {
    await act(async () => {renderer = create(React.createElement(harness.Scanner, {bills:[], onAdd:bill => {saved.push(bill); return true;}}));});
    const frame = renderer.root.findAllByType('View').find(node => node.props.testID === 'billiam-scanner-artwork');
    for (const width of [248,318,358]) {
      const height = width / 1.5;
      await act(() => frame.props.onLayout({nativeEvent:{layout:{width,height}}}));
      const image = renderer.root.findByProps({testID:'billiam-scanner-artwork-image'});
      assert.equal(image.props.resizeMode,'contain');
      assert.equal(image.props.style.width,width); assert.equal(image.props.style.height,height);
    }
    await press('Billiam’s bill scanning');
    await press('Choose a bill photo');
    assert.equal(saved.length,0,'OCR must not automatically add a bill');
    const amount = renderer.root.findAllByType('TextInput').find(node => node.props.accessibilityLabel === 'Scanned amount');
    await act(() => amount.props.onChangeText('30.50'));
    const save = button('Add reviewed bill');
    await act(() => {save.props.onPress(); save.props.onPress();});
    assert.equal(saved.length,1); assert.equal(saved[0].amount,'30.50');
    await press('Choose a bill photo');
    await press('Cancel bill scan');
    assert.equal(saved.length,1);
  } finally {await act(() => renderer.unmount());}
});

test('Billiam duplicate review requires an explicit separate-bill confirmation', async () => {
  const harness = appHarness({}, undefined, {scanPhoto:async () => 'City Water\nAmount Due: $25.00\nDue date: 2026-11-20'});
  let renderer, saves=0;
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  const press = async label => {await act(() => button(label).props.onPress());};
  try {
    await act(async () => {renderer=create(React.createElement(harness.Scanner,{bills:[{name:'City Water',amount:25,due:'2026-11-20'}],onAdd:() => {saves++;return true;}}));});
    await press('Billiam’s bill scanning'); await press('Take a bill photo');
    assert.equal(button('Add reviewed bill').props.disabled,true);
    await press('Add reviewed bill'); assert.equal(saves,0);
    await press('This is a separate bill');
    assert.equal(button('Add reviewed bill').props.disabled,false);
    await press('Add reviewed bill'); assert.equal(saves,1);
  } finally {await act(() => renderer.unmount());}
});

test('canceling or leaving a pending Billiam scan never saves the result', async () => {
  let finish;
  const harness = appHarness({},undefined,{scanPhoto:() => new Promise(resolve => {finish=resolve;})});
  let renderer, pending, saves=0;
  const button = label => renderer.root.findAll(node => ['TouchableOpacity', 'Pressable'].includes(node.type)).find(node => node.props.accessibilityLabel === label);
  try {
    await act(async () => {renderer=create(React.createElement(harness.Scanner,{onAdd:() => {saves++;}}));});
    await act(() => button('Billiam’s bill scanning').props.onPress());
    await act(() => {pending=button('Choose a bill photo').props.onPress();});
    await act(() => button('Cancel bill scan').props.onPress());
    await act(async () => {finish('City Water\nAmount Due: $25.00\nDue date: 2026-11-20');await pending;});
    assert.equal(renderer.root.findAllByType('TextInput').length,0); assert.equal(saves,0);
  } finally {await act(() => renderer.unmount());}
});

test('Billiam mailbox opens seven room stations and their original bounded artwork',async()=>{
  const harness=appHarness();let renderer;
  try{
    await act(async()=>{renderer=create(React.createElement(harness.Billiam,{finance:{bills:[]},onAdd:()=>true,onUpdate:()=>true,onTemplates:()=>{},onHousehold:()=>{}}));});
    const tasks=renderer.root.findAllByType('Pressable').filter(n=>n.props.accessibilityLabel?.startsWith('Billiam: '));
    const ids=['scan','import','batch','compare','recurring','breakdown','household'];
    assert.equal(tasks.length,ids.length);
    assert.deepEqual(tasks.map(task => task.findByType('Text').props.children),
      ['Scan a bill','Import files','Batch scan','Compare bills','Recurring bills','Bill breakdown','Household plan']);
    for(const [index,id] of ids.entries()){
      await act(()=>tasks[index].props.onPress());
      const artworkId = id === 'scan' ? 'billiam-scanner-artwork' : `billiam-${id}-artwork`;
      const { width, height } = id === 'scan' ? {width:330,height:220} : {width:88,height:88};
      const frame=renderer.root.findAllByType('View').find(n=>n.props.testID===artworkId);
      await act(()=>frame.props.onLayout({nativeEvent:{layout:{width,height}}}));
      const img=renderer.root.findByProps({testID:`${artworkId}-image`});
      assert.equal(img.props.resizeMode,'contain');
      assert.equal(img.props.style.width,width);
      assert.equal(img.props.style.height,height);
      const sheet=renderer.root.find(n=>n.type?.name==='EntrySheet'&&n.props.visible);
      if (id === 'scan') assert.equal(sheet.findAllByType('Image').filter(node => node.props.source === img.props.source).length,1);
      await act(()=>sheet.props.onClose());
    }
  }finally{await act(()=>renderer.unmount());}
});

test('Billiam imports a stack with editable per-bill review, skip and no automatic saves',async()=>{
  const harness=appHarness({},undefined,{importBatch:async()=>[
    {label:'Bill 1',draft:{name:'Water',amount:'12.34',due:'2026-12-20',breakdown:{lateFees:'0.00'}}},
    {label:'Bill 2',error:'Unreadable photo'},
    {label:'Bill 3',draft:{name:'Internet',amount:'50.00',due:'2026-12-21',breakdown:{}}}
  ]});let renderer,saved=[];
  const button=label=>renderer.root.findAll(n=>['TouchableOpacity','Pressable'].includes(n.type)).find(n=>n.props.accessibilityLabel===label);
  const press=async label=>{assert.ok(button(label),label);await act(()=>button(label).props.onPress());};
  try{
    await act(async()=>{renderer=create(React.createElement(harness.Billiam,{finance:{bills:[]},onAdd:b=>{saved.push(b);return true;},onUpdate:()=>true,onTemplates:()=>{},onHousehold:()=>{}}));});
    await press('Billiam: Review a stack of bills');await press('Choose bill photo stack');
    assert.equal(saved.length,0);
    const amount=renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel==='Scanned amount');
    await act(()=>amount.props.onChangeText('15.00'));
    const save=button('Add reviewed bill');await act(()=>{save.props.onPress();save.props.onPress();});
    assert.equal(saved.length,1);assert.equal(saved[0].amount,'15.00');
    await press('Skip unreadable bill');await press('Skip this bill');assert.equal(saved.length,1);
    assert.ok(button('Choose bill photo stack'));
  }finally{await act(()=>renderer.unmount());}
});

test('Billiam household defaults to private, saves assignments, and previews selected bills only',async()=>{
  const harness=appHarness();let renderer,value,finance={bills:[{id:'water',name:'Water',amount:'50.01',due:'2026-12-20'},{id:'secret',name:'Secret Bill',amount:'40.00',due:'2026-12-22'}]};
  const render=()=>React.createElement(harness.Household,{bills:finance.bills,value,onChange:next=>{value=next;renderer.update(render());}});
  const button=label=>renderer.root.findAll(n=>['TouchableOpacity','Pressable'].includes(n.type)).find(n=>n.props.accessibilityLabel===label);
  const input=label=>renderer.root.findAllByType('TextInput').find(n=>n.props.accessibilityLabel===label);
  const press=async label=>{assert.ok(button(label),label);await act(()=>button(label).props.onPress());};
  try{
    await act(async()=>{renderer=create(render());});
    assert.equal(button('Share Water with household').props.accessibilityState.checked,false);
    assert.equal(button('Create encrypted household share file').props.disabled,true);
    await press('Save household name');
    await act(()=>input('New household member').props.onChangeText('Roommate'));await press('Add household member');
    await press('Split Water equally');assert.equal(value.assignments.water.split.reduce((sum,p)=>sum+p.cents,0),5001);
    await press('Share Water with household');await press('Preview selected household bills');
    assert.equal(button('Create encrypted household share file').props.disabled,false);
    assert.equal(value.assignments.secret,undefined);
    await press('Share Water with household');
    assert.equal(button('Create encrypted household share file').props.disabled,true,'changing selection invalidates the preview');
  }finally{await act(()=>renderer.unmount());}
});
