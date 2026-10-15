const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const babel=require('@babel/core');
const React=require('react');
const {create,act}=require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT=true;
const flatten=style=>Object.assign({},...(Array.isArray(style)?style:[style]).filter(Boolean));
function harness(hour=12){
  // Simulate the actual failure: natural source dimensions survive unless the
  // rendered Image explicitly overrides both width AND height.
  const Image=props=>React.createElement('Image',{...props,nativeBounds:flatten([{width:2048,height:1254},props.style])});
  const ui={Image,View:'View',TouchableOpacity:'TouchableOpacity',StyleSheet:{create:s=>s,absoluteFillObject:{position:'absolute'}},
    AppState:{currentState:'active',addEventListener:()=>({remove(){}})},
    AccessibilityInfo:{isReduceMotionEnabled:async()=>true,addEventListener:()=>({remove(){}})},
    Animated:{View:'AnimatedView',Image,Value:class{setValue(){} interpolate(){return 0;}}}};
  const cache=new Map();
  function load(name){
    const file=path.resolve(__dirname,'../src',name);
    if(cache.has(file))return cache.get(file).exports;
    const module={exports:{}};cache.set(file,module);
    const code=babel.transformSync(fs.readFileSync(file,'utf8'),{configFile:false,babelrc:false,
      plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']}).code;
    vm.runInNewContext(code,{module,exports:module.exports,require:dep=>{
      if(dep==='react')return React;
      if(dep==='react-native')return ui;
      if(dep==='./Privacy')return {Text:'Text'};
      if(dep==='./useNeighborhoodClock')return {__esModule:true,default:()=>new Date(2026,9,15,hour)};
      if(dep==='./neighborhood-time.mjs')return {neighborhoodWelcomeTheme:()=> 'halloween',isNeighborhoodNight:()=>hour>=18};
      if(dep.endsWith('.png')||dep.endsWith('.jpeg'))return dep;
      if(dep.startsWith('./'))return load(dep.slice(2)+'.js');
      throw new Error('Unexpected dependency '+dep);
    }},{filename:file});
    return module.exports;
  }
  return {Scene:load('PlaidBankScene.js').default,Mark:load('PlaidBankScene.js').BankBuildingMark,
    Welcome:load('SeasonalWelcome.js').default,Bank:load('BankWelcomeCard.js').default,
    Panorama:load('LivingNeighborhood.js').default};
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
      for(const frame of frames){
        const id=frame.props.testID;
        const width=id==='bank-corner-artwork'?Math.min((phoneWidth-64)*0.3,110):id==='bank-tab-artwork'?45:phoneWidth-40;
        const height=id==='bank-corner-artwork'?width:id==='bank-tab-artwork'?35:id==='neighborhood-panorama-artwork'?width/3:width/(1672/941);
        await act(()=>frame.props.onLayout({nativeEvent:{layout:{width,height,x:0,y:0}}}));
        const image=frame.findAllByType('Image').find(image=>image.props.testID===`${id}-image`);
        assert.ok(image,id+' renders after measurement');
        assert.equal(image.props.nativeBounds.width,width);
        assert.equal(image.props.nativeBounds.height,height,'intrinsic image height is explicitly overridden');
        assert.equal(image.props.nativeBounds.position,'absolute','image cannot expand its container');
        assert.equal(image.props.resizeMode,'contain','all edges of the source remain visible');
        assert.equal(flatten(frame.props.style).overflow,'hidden');
      }
    }
    const button=renderer.root.findByType('TouchableOpacity');assert.equal(button.props.accessibilityLabel,'Try Bobbie’s banking demo');
  }finally{await act(()=>renderer.unmount());}
});
