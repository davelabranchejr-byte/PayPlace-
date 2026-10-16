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
    if (name.endsWith('/CabaretVideo')) return 'CabaretVideo';
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
    await act(()=>button('Watch the Show — Meowgarita & Money').props.onPress());
    assert.equal(renderer.root.findAllByType('CabaretVideo').length,1);
    assert.equal(field('Your question'),undefined);
    await act(()=>renderer.root.findByType('Modal').props.onRequestClose());
    assert.equal(renderer.root.findAllByType('CabaretVideo').length,0);
    assert.equal(field('Your question').props.value,'How can I save a little money each week?');
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

test('native player contains the full frame, pauses in background, retries failures, and releases on exit', async () => {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/CabaretVideo.js'), 'utf8');
  const code = babel.transformSync(source, { configFile: false, babelrc: false, plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }], require('@babel/plugin-transform-modules-commonjs')] }).code;
  const ui = Object.fromEntries(['ActivityIndicator','Text','TouchableOpacity','View'].map(name=>[name,name]));
  ui.StyleSheet={create:value=>value};
  const players=[], appListeners=new Set();
  ui.AppState={currentState:'active',addEventListener(name,fn){appListeners.add(fn);return{remove(){appListeners.delete(fn);}};}};
  const video={VideoView:'VideoView',useVideoPlayer(initial,setup){
    assert.equal(initial,null);
    const [player]=React.useState(()=>{
      const instance={plays:0,pauses:0,released:false,listeners:new Map(),play(){this.plays++;},pause(){this.pauses++;},addListener(name,fn){this.listeners.set(name,fn);return{remove:()=>this.listeners.delete(name)};},replaceAsync(source){this.source=source;return new Promise(resolve=>{this.finish=resolve;});}};
      setup(instance);players.push(instance);return instance;
    });
    React.useEffect(()=>()=>{player.released=true;},[player]);return player;
  }};
  const sandbox={exports:{},console,require:name=>name==='react'?React:name==='react-native'?ui:name==='expo-video'?video:{EMAIL_SERVICE_ORIGIN:'https://payplace.example'}};
  vm.runInNewContext(code,sandbox);
  let renderer;
  await act(()=>{renderer=create(React.createElement(sandbox.exports.default));});
  try {
    const first=players[0],view=renderer.root.findByType('VideoView');
    assert.equal(view.props.contentFit,'contain');assert.equal(view.props.nativeControls,true);
    assert.equal(view.props.allowsPictureInPicture,false);assert.equal(first.staysActiveInBackground,false);
    assert.equal(first.plays,0);assert.equal(first.source.uri,'https://payplace.example/cabaret/meowgarita-and-money.mp4');
    await act(async()=>{first.finish();await Promise.resolve();});assert.equal(first.plays,1);
    await act(()=>{ui.AppState.currentState='background';for(const fn of appListeners)fn('background');});assert.equal(first.pauses,1);
    await act(()=>first.listeners.get('statusChange')({status:'error'}));
    await act(()=>renderer.root.findByType('TouchableOpacity').props.onPress());
    assert.equal(first.released,true);assert.equal(first.listeners.size,0);assert.equal(players.length,2);assert.equal(appListeners.size,1);
    const retry=players[1];
    await act(async()=>{retry.finish();await Promise.resolve();});assert.equal(retry.plays,0);
  } finally {await act(()=>renderer.unmount());}
  assert.equal(appListeners.size,0);assert.equal(players.at(-1).released,true);
});
