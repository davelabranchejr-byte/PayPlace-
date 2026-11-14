const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const babel=require('@babel/core');
const React=require('react');
const {create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
const flatten=style=>Object.assign({},...(Array.isArray(style)?style.flat(Infinity):[style]).filter(Boolean));
function harness(hour=12, motionEnabled=false, date = new Date(2026,9,15,hour), seasonalCameos = () => []){
  const animation={started:0,stopped:0};
  // Simulate the actual failure: natural source dimensions survive unless the
  // rendered Image explicitly overrides both width AND height.
  const Image=props=>React.createElement('Image',{...props,nativeBounds:flatten([{width:2048,height:1254},props.style])});
  const ui={Image,View:'View',TouchableOpacity:'TouchableOpacity',Pressable:'Pressable',ScrollView:'ScrollView',Text:'Text',StyleSheet:{create:s=>s,absoluteFillObject:{position:'absolute'}},
    AppState:{currentState:'active',addEventListener:()=>({remove(){}})},
    AccessibilityInfo:{isReduceMotionEnabled:async()=>!motionEnabled,addEventListener:()=>({remove(){}})},
    Easing:{linear:'linear',sin:'sin',inOut:fn=>fn},
    Animated:{View:'AnimatedView',Image,Value:class{setValue(){} interpolate(){return 0;}},
      add(){return 0;},modulo(){return {interpolate(){return 0;}};},delay(){},
      timing(){return {start(){},stop(){}};},sequence(){},loop(){return {start(){animation.started++;},stop(){animation.stopped++;}};}}};
  const cache=new Map();
  function load(name){
    const file=path.resolve(__dirname,'../src',name);
    if(cache.has(file))return cache.get(file).exports;
    const module={exports:{}};cache.set(file,module);
    const code=babel.transformSync(fs.readFileSync(file,'utf8'),{configFile:false,babelrc:false,
      plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']}).code;
    vm.runInNewContext(code,{module,exports:module.exports,setTimeout,clearTimeout,require:dep=>{
    if (dep === './MascotTouchable') return { MascotTouchable: 'TouchableOpacity', MascotPressable: 'Pressable' };
    if (dep === './Encouragement') return { EncouragementSpot: () => null };
      if(dep==='react')return React;
      if(dep==='@expo/vector-icons')return {Ionicons:'Ionicons'};
      if(dep==='react-native')return ui;
      if(dep==='./Privacy')return {Text:'Text'};
      if(dep==='./useNeighborhoodClock')return {__esModule:true,default:()=>date};
      if(dep==='./neighborhood-time.mjs')return {neighborhoodWelcomeTheme:()=> 'halloween',isNeighborhoodNight:()=>hour>=18||hour<6,neighborhoodSeasonalCameos:seasonalCameos};
      if(dep.endsWith('.png')||dep.endsWith('.jpeg')||dep.endsWith('.jpg'))return dep;
      if(dep.endsWith('.mjs'))return require(path.resolve(path.dirname(file),dep));
      if(dep.startsWith('./'))return load(dep.slice(2)+'.js');
      throw new Error('Unexpected dependency '+dep);
    }},{filename:file});
    return module.exports;
  }
  return {Scene:load('PlaidBankScene.js').default,Mark:load('PlaidBankScene.js').BankBuildingMark,
    Welcome:load('SeasonalWelcome.js').default,Bank:load('BankWelcomeCard.js').default,
    Panorama:load('LivingNeighborhood.js').default,animation};
}
for(const hour of [12,23])test(`all new artwork fits measured phone frames at ${hour}:00 and after resize`,async()=>{
  const {Scene,Mark,Welcome,Bank,Panorama}=harness(hour);let renderer;
  await act(()=>{renderer=create(React.createElement('View',null,
    React.createElement(Welcome),React.createElement(Bank,{onDemo(){}}),React.createElement(Panorama,{reduceAnimation:true}),React.createElement(Mark)));});
  try{
    const frames=renderer.root.findAllByType('View').filter(node=>node.props.testID?.endsWith('-artwork'));
    assert.equal(frames.length,5);
    for(const frame of frames)assert.equal(frame.findAllByType('Image').filter(image=>image.props.testID?.endsWith('-image')).length,0,
      'large bundled images never mount at natural size before the frame is measured');
    for(const phoneWidth of [320,393,430,740]){
      const viewport = renderer.root.findByProps({testID:'neighborhood-panorama-viewport'});
      await act(() => viewport.props.onLayout({nativeEvent:{layout:{width:phoneWidth-40}}}));
      for(const frame of frames){
        const id=frame.props.testID;
        const width=id==='neighborhood-panorama-artwork'?Math.min((phoneWidth-40)*1.85,960):id==='bank-corner-artwork'?Math.min((phoneWidth-64)*0.3,110):id==='bank-tab-artwork'?45:phoneWidth-40;
        const height=id==='bank-corner-artwork'?width:id==='bank-tab-artwork'?35:id==='neighborhood-panorama-artwork'?width/3:width/(1672/941);
        await act(()=>frame.props.onLayout({nativeEvent:{layout:{width,height,x:0,y:0}}}));
        const image=frame.findAllByType('Image').find(image=>image.props.testID===`${id}-image`);
        assert.ok(image,id+' renders after measurement');
        assert.equal(image.props.nativeBounds.width,width);
        assert.equal(image.props.nativeBounds.height,height,'intrinsic image height is explicitly overridden');
        assert.equal(image.props.nativeBounds.position,'absolute','image cannot expand its container');
        assert.equal(image.props.resizeMode,'contain','all edges of the source remain visible');
        assert.equal(flatten(frame.props.style).overflow,'hidden');
        if (id === 'neighborhood-panorama-artwork') {
          assert.equal(image.props.source, `../assets/characters/neighborhood-panorama-${hour >= 18 ? 'night' : 'day'}.png`);
          assert.equal(flatten(frame.props.style).width,width,'the complete scene is wider than the viewport');
        }
        if (id === 'bank-tab-artwork') {
          const badge = frame.findAllByType('Image').find(node => node.props.source === '../assets/branding/payplace-icon.png');
          assert.ok(badge, 'bank facade uses the locked PayPlace logo');
          assert.equal(image.props.source, '../assets/characters/nav-plaid-bank-blank-sign.png');
          const sign = frame.findAllByType('View').find(node => node.props.pointerEvents === 'none').props.style;
          assert.equal(sign.left, (width - height) / 2 + height * 0.426);
          assert.equal(sign.top, height * 0.23);
        }
      }
    }
    const button=renderer.root.findByType('TouchableOpacity');assert.equal(button.props.accessibilityLabel,'Try Bobbie’s banking demo');
  }finally{await act(()=>renderer.unmount());}
});

test('the neighborhood can pan by swipe or by its left and right controls', async () => {
  const { Panorama } = harness();
  const calls = [];
  let renderer;
  try {
    await act(() => { renderer = create(React.createElement(Panorama, { reduceAnimation: true }), {
      createNodeMock: element => element.type === 'ScrollView' ? { scrollTo: options => calls.push(options) } : null,
    }); });
    await act(() => renderer.root.findByProps({testID:'neighborhood-panorama-viewport'}).props.onLayout({nativeEvent:{layout:{width:320}}}));
    const scroller = renderer.root.findByType('ScrollView');
    const arrow = direction => renderer.root.findAllByType('Pressable').find(node => node.props.accessibilityLabel === `Pan neighborhood ${direction}`);
    assert.equal(scroller.props.horizontal,true);
    assert.equal(arrow('left').props.disabled,true);
    await act(() => arrow('right').props.onPress());
    assert.deepEqual({...calls[0]}, {x:176,animated:false});
    await act(() => scroller.props.onScroll({nativeEvent:{contentOffset:{x:272}}}));
    assert.equal(arrow('right').props.disabled,true);
    await act(() => arrow('left').props.onPress());
    assert.deepEqual({...calls[1]}, {x:96,animated:false});
  } finally { if (renderer) await act(() => renderer.unmount()); }
});

test('full-map mode fits the whole panorama inside the landscape viewport', async () => {
  const { Panorama } = harness();
  let renderer;
  await act(() => { renderer = create(React.createElement(Panorama, { fullMap: true, mapOnly: true })); });
  try {
    const viewport = renderer.root.findByProps({ testID: 'neighborhood-panorama-viewport' });
    const frame = renderer.root.findAllByType('View').find(node => node.props.testID === 'neighborhood-panorama-artwork');
    for (const [width, height, expected] of [[820, 340, 820], [930, 260, 780], [390, 785, 390]]) {
      await act(() => viewport.props.onLayout({ nativeEvent: { layout: { width, height } } }));
      assert.equal(flatten(frame.props.style).width, expected);
      assert.equal(flatten(frame.props.style).aspectRatio, 3);
      assert.equal(renderer.root.findByType('ScrollView').props.scrollEnabled, false);
    }
  } finally { await act(() => renderer.unmount()); }
});

test('the panorama pauses its day and night effects while a panel covers it or Quiet Mode reduces motion',async()=>{
  for (const hour of [4,5,12,22,23]) {
    const {Panorama,animation}=harness(hour,true);
    let renderer;
    await act(async()=>{renderer=create(React.createElement(Panorama));});
    try {
      const scene=renderer.root.findAllByType('View').find(node=>node.props.testID==='neighborhood-panorama-artwork');
      await act(()=>scene.props.onLayout({nativeEvent:{layout:{width:335,height:335/3}}}));
      const skies = () => renderer.root.findAllByType('AnimatedView').map(node=>node.props.testID)
        .filter(id=>id==='neighborhood-airplane'||id==='neighborhood-shooting-star'||id==='neighborhood-saucer');
      const expected = [hour >= 18 || hour < 6 ? 'neighborhood-shooting-star' : 'neighborhood-airplane'];
      if (hour === 4 || hour === 23) expected.push('neighborhood-saucer');
      assert.deepEqual(skies(),expected);
      const before=animation.started;
      assert.ok(before>1);
      await act(()=>renderer.update(React.createElement(Panorama,{paused:true})));
      assert.ok(animation.stopped>0);
      assert.deepEqual(skies(),[]);
      assert.equal(animation.started,before);
      await act(()=>renderer.update(React.createElement(Panorama,{reduceAnimation:true})));
      assert.equal(animation.started,before);
      await act(()=>renderer.update(React.createElement(Panorama)));
      assert.ok(animation.started>before);
      assert.deepEqual(skies(),expected);
    } finally { await act(()=>renderer.unmount()); }
  }
});

test('each seasonal cameo uses its own fitted sprite and stops in Quiet Mode', async () => {
  const { neighborhoodSeasonalCameos } = await import('../src/neighborhood-time.mjs');
  for (const [month, day, hour, expected] of [
    [3,5,12,['bunny']], [9,31,21,['witches','cashper']],
    [10,26,12,['turkey']], [11,24,21,['santa']],
  ]) {
    const { Panorama } = harness(hour, true, new Date(2026, month, day, hour), neighborhoodSeasonalCameos);
    let renderer;
    await act(async () => { renderer = create(React.createElement(Panorama)); });
    try {
      const frame = renderer.root.findAllByType('View').find(node => node.props.testID === 'neighborhood-panorama-artwork');
      await act(() => frame.props.onLayout({nativeEvent:{layout:{width:335,height:335/3}}}));
      const findCameo = kind => renderer.root.findAllByType('AnimatedView').find(node => node.props.testID === `neighborhood-${kind}`);
      for (const kind of expected) {
        const image = findCameo(kind).findByType('Image');
        assert.equal(image.props.source, `../assets/characters/cameo-${kind}.png`);
        assert.equal(image.props.resizeMode, 'contain');
      }
      await act(() => renderer.update(React.createElement(Panorama, {reduceAnimation:true})));
      for (const kind of expected) assert.equal(findCameo(kind), undefined);
    } finally { await act(() => renderer.unmount()); }
  }
});
