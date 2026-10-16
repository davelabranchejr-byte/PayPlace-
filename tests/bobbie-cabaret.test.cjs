const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const React = require('react');
const { create, act } = require('react-test-renderer');
const babel = require('@babel/core');
global.IS_REACT_ACT_ENVIRONMENT = true;
test('cabaret retains failed questions, blocks duplicate taps, and clears only after confirmed acceptance', async () => {
  const model = await import('../src/bobbie-cabaret.mjs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/BobbieCabaret.js'), 'utf8');
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }], require('@babel/plugin-transform-modules-commonjs')] }).code;
  const ui = Object.fromEntries(['KeyboardAvoidingView','Modal','SafeAreaView','ScrollView','Switch','Text','TextInput','TouchableOpacity','View'].map(name => [name,name]));
  ui.StyleSheet = { create: value => value }; ui.Platform = { OS: 'ios' }; ui.Linking = { openURL: async () => {} };
  const sandbox = { exports: {}, console, fetch: () => {}, require: name => {
    if (name === 'react') return React;
    if (name === 'react-native') return ui;
    if (name.endsWith('bobbie-cabaret.mjs')) return model;
    if (name.endsWith('email-api.mjs')) return { createEmailApi: () => () => {}, EMAIL_SERVICE_ORIGIN: 'https://payplace.example' };
    if (name.endsWith('.jpeg')) return 1;
    return 'FittedArtwork';
  } };
  vm.runInNewContext(code,sandbox);
  let renderer, calls = [], fail = true, finish;
  const submitQuestion = async (path,payload) => { calls.push({path,payload}); if(fail)throw new Error('Offline, please retry.'); return new Promise(resolve=>{finish=resolve;}); };
  await act(()=>{renderer=create(React.createElement(sandbox.exports.default,{visible:true,onClose(){},submitQuestion}));});
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node=>node.props.accessibilityLabel===label);
  const field = label => renderer.root.findAllByType('TextInput').find(node=>node.props.accessibilityLabel===label);
  try {
    assert.equal(field('Your question'),undefined);
    await act(()=>button('Ask Bobbie').props.onPress());
    assert.equal(renderer.root.findByType('Switch').props.value,false);
    await act(async()=>button('Send to Bobbie’s mailbag').props.onPress());
    assert.equal(calls.length,0);
    await act(()=>field('Your question').props.onChangeText('How can I save a little money each week?'));
    await act(async()=>button('Send to Bobbie’s mailbag').props.onPress());
    assert.equal(field('Your question').props.value,'How can I save a little money each week?');
    assert.match(JSON.stringify(renderer.toJSON()),/Offline, please retry/);
    assert.equal(calls[0].payload.featureConsent,false); assert.equal(calls[0].payload.stageName,'Anonymous neighbor');
    fail=false; let request;
    await act(()=>{request=button('Send to Bobbie’s mailbag').props.onPress();});
    await act(()=>button('Sending your question…').props.onPress());
    assert.equal(calls.length,2);
    await act(async()=>{finish({accepted:true,id:'test-receipt'});await request;});
    assert.match(JSON.stringify(renderer.toJSON()),/private mailbag/);
    await act(()=>button('Ask Bobbie').props.onPress());
    assert.equal(field('Your question').props.value,'');
  } finally { await act(()=>renderer.unmount()); }
});
