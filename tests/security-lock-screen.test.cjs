const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

function load(file, dependencies) {
  const code = babel.transformSync(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), {
    configFile: false, babelrc: false,
    plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'],
  }).code;
  const sandbox = { module: { exports: {} }, exports: {},
    require: name => name === 'react' ? React : dependencies[name],
    setInterval: () => 1, clearInterval: () => {}, setTimeout, clearTimeout,
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(code, sandbox);
  return sandbox.module.exports.default;
}

test('approved artwork and real button stay aligned and reachable on different screen sizes', async () => {
  const layout = await import('../src/lock-screen-layout.mjs');
  const component = load('SecurityLockScreen.js', {
    'react-native': { Image: 'Image', SafeAreaView: 'SafeAreaView', Text: 'Text', TouchableOpacity: 'TouchableOpacity', View: 'View',
      StyleSheet: { create: v => v, absoluteFillObject: { position: 'absolute' } } },
    'expo-status-bar': { StatusBar: 'StatusBar' }, './lock-screen-layout.mjs': layout,
    '../assets/characters/security-screen-approved.png': 'approved-artwork',
  });
  let taps = 0, renderer;
  const props = { hidden: false, ready: true, busy: false, error: '', onUnlock: () => taps++ };
  await act(() => { renderer = create(React.createElement(component, props)); });
  try {
    for (const [width, height] of [[320, 480], [393, 759], [430, 838], [768, 1024]]) {
      const stage = renderer.root.findAllByType('View').find(v => v.props.onLayout);
      await act(() => stage.props.onLayout({ nativeEvent: { layout: { width, height } } }));
      const frame = layout.fitLockArtwork(width, height);
      // An absolute-positioned React Native Image still inherits its asset's
      // intrinsic dimensions unless width/height are explicitly overridden.
      // The original regression enlarged the 941 x 1672 asset on a phone.
      const artwork = renderer.root.findAllByType('Image').find(v => v.props.resizeMode === 'contain');
      const imageStyle = Object.assign({}, ...artwork.props.style);
      assert.ok(Math.abs(imageStyle.width - frame.width) < 1e-10, 'image width must match its fitted frame');
      assert.ok(Math.abs(imageStyle.height - frame.height) < 1e-10, 'image height must match its fitted frame');
      const background = renderer.root.findAllByType('Image').find(v => v.props.resizeMode === 'cover');
      const backgroundStyle = Object.assign({}, ...background.props.style);
      assert.equal(backgroundStyle.width, '100%', 'background cannot use its intrinsic width');
      assert.equal(backgroundStyle.height, '100%', 'background cannot use its intrinsic height');
      const button = renderer.root.findByType('TouchableOpacity');
      const bounds = button.props.style[1];
      assert.ok(frame.width <= width + 0.01 && frame.height <= height + 0.01);
      assert.ok(bounds.height >= 35, 'button remains touchable on compact screens');
      assert.ok(bounds.top + bounds.height <= frame.height);
      assert.ok(Math.abs(bounds.left / frame.width - layout.UNLOCK_BOUNDS.left) < 1e-10);
      assert.equal(button.props.accessibilityLabel, 'Unlock PayPlace');
      await act(() => button.props.onPress());
    }
    assert.equal(taps, 4);
    await act(() => renderer.update(React.createElement(component, { ...props, busy: true })));
    assert.equal(renderer.root.findByType('TouchableOpacity').props.disabled, true);
    await act(() => renderer.update(React.createElement(component, { ...props, hidden: true })));
    assert.equal(renderer.root.findAllByType('TouchableOpacity').length, 0);
  } finally { await act(() => renderer.unmount()); }
});

test('button opens device authentication; pending, cancelled and failed attempts never reveal finances', async () => {
  const policy = await import('../src/security-policy.mjs');
  let resolveAuth, calls = 0, options;
  const component = load('AppSecurity.js', {
    'react-native': { View: 'View', Modal: 'Modal', Platform: { OS: 'ios' },
      AppState: { currentState: 'active', addEventListener: () => ({ remove() {} }) } },
    'expo-secure-store': { getItemAsync: async () => 'enabled', setItemAsync: async () => {} },
    'expo-local-authentication': { SecurityLevel: { SECRET: 1 }, getEnrolledLevelAsync: async () => 2,
      authenticateAsync: opts => { calls++; options = opts; return new Promise(resolve => { resolveAuth = resolve; }); } },
    './SecurityLockScreen': 'SecurityLockScreen', './security-policy.mjs': policy,
  });
  let renderer, pending;
  await act(async () => { renderer = create(React.createElement(component, {}, React.createElement('FinancialDetails'))); });
  const screen = () => renderer.root.findByType('SecurityLockScreen');
  try {
    assert.equal(renderer.root.findAllByType('FinancialDetails').length, 0);
    await act(() => { pending = screen().props.onUnlock(); });
    assert.equal(screen().props.busy, true);
    await act(() => screen().props.onUnlock());
    assert.equal(calls, 1, 'rapid second tap cannot start another authentication');
    assert.equal(options.disableDeviceFallback, false);
    assert.equal(options.fallbackLabel, 'Use device passcode');
    await act(async () => { resolveAuth({ success: false, error: 'user_cancel' }); await pending; });
    assert.match(screen().props.error, /stays locked/);
    assert.equal(renderer.root.findAllByType('FinancialDetails').length, 0);
    await act(() => { pending = screen().props.onUnlock(); });
    await act(async () => { resolveAuth({ success: false, error: 'authentication_failed' }); await pending; });
    assert.equal(renderer.root.findAllByType('FinancialDetails').length, 0);
    await act(() => { pending = screen().props.onUnlock(); });
    await act(async () => { resolveAuth({ success: true }); await pending; });
    assert.equal(renderer.root.findAllByType('FinancialDetails').length, 1);
    assert.equal(renderer.root.findByType('Modal').props.visible, false);
  } finally { await act(() => renderer.unmount()); }
});
