const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), React = require('react'), babel = require('@babel/core');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
test('glass hides the choice until the server draw, reuses a failed draw ID, blocks duplicate taps, and hides in background', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/QuestionGlass.js'), 'utf8');
  const compiled = babel.transformSync(source, { configFile: false, babelrc: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs'] }).code;
  const ui = Object.fromEntries(['ActivityIndicator','ScrollView','Text','TouchableOpacity','View'].map(name => [name,name]));
  ui.StyleSheet = { create: value => value }; ui.Animated = { View: 'AnimatedView', Value: class { setValue() {} interpolate() { return 0; } }, timing: () => ({ start() {} }) };
  let ids = 0;
  const sandbox = { exports: {}, require: name => name === 'react' ? React : name === 'react-native' ? ui : name === 'expo-crypto' ? { randomUUID: () => 'request-' + ++ids } : name.endsWith('.png') ? 1 : 'FittedArtwork' };
  vm.runInNewContext(compiled, sandbox);
  let renderer, finish, fail = true, draws = 0; const calls = [];
  const api = async (route, data) => { calls.push({ route, data }); if (fail) throw new Error('Connection interrupted.'); return new Promise(resolve => { finish = resolve; }); };
  const props = { api, count: 2, visible: true, onBack() {}, onAuthError() {}, onDraw() { draws++; } };
  await act(() => { renderer = create(React.createElement(sandbox.exports.default, props)); });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel === label);
  try {
    assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Surprise chosen question/);
    await act(async () => button('Let Bobbie choose a question').props.onPress());
    assert.equal(calls[0].route, 'glass-draw');
    fail = false; let pending;
    await act(() => { pending = button('Retry the same draw').props.onPress(); });
    await act(() => button('Let Bobbie choose a question').props.onPress());
    assert.equal(calls.length, 2); assert.equal(calls[0].data.requestId, calls[1].data.requestId);
    assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Surprise chosen question/);
    await act(async () => { finish({ question: { id: 'a1-question', question: 'Surprise chosen question', stageName: 'Neighbor', topic: 'Saving' } }); await pending; });
    assert.match(JSON.stringify(renderer.toJSON()), /Surprise chosen question/); assert.equal(draws, 1);
    await act(() => renderer.update(React.createElement(sandbox.exports.default, { ...props, visible: false })));
    assert.doesNotMatch(JSON.stringify(renderer.toJSON()), /Surprise chosen question/);
  } finally { await act(() => renderer.unmount()); }
});
