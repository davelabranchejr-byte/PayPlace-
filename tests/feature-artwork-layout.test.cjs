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
function loadComponents(model){
  // React Native's Image defaults to the bundled source's intrinsic dimensions.
  // Keep that behavior in the adapter so a missing height reproduces the bug.
  const Image=props=>React.createElement('Image',{...props,nativeBounds:flatten([{width:1536,height:1024},props.style])});
  const ui={Image,View:'View',ScrollView:'ScrollView',TouchableOpacity:'TouchableOpacity',Modal:'Modal',StyleSheet:{create:v=>v}};
  const source=fs.readFileSync(path.join(__dirname,'../src/LaunchEssentials.js'),'utf8');
  const code=babel.transformSync(source,{configFile:false,babelrc:false,plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']}).code;
  const module={exports:{}};
  const assets=new Map();
  vm.runInNewContext(code,{module,exports:module.exports,require:name=>{
    if(name==='react')return React;
    if(name==='react-native')return ui;
    if(name==='./Privacy')return {Text:'Text',TextInput:'TextInput'};
    if(name.endsWith('launch-essentials.mjs'))return model;
    if(name==='./PayPlaceBrand')return {__esModule:true,default:'PayPlaceBrand'};
    if(name.endsWith('.png')){if(!assets.has(name))assets.set(name,assets.size+1);return assets.get(name);}
    throw new Error(`Unexpected dependency ${name}`);
  },console,Date,Math},{filename:'LaunchEssentials.js'});
  return module.exports;
}
test('all four original card images stay within measured phone frames and keep their routes',async()=>{
  const components=loadComponents(await import('../src/launch-essentials.mjs'));
  const opened=[];let renderer;
  await act(()=>{renderer=create(React.createElement(components.EssentialsButtons,{onOpen:key=>opened.push(key)}));});
  try{
    assert.equal(renderer.root.findAllByType('Image').length,0,'no natural-size image can render before its frame is measured');
    const frames=renderer.root.findAllByType('View').filter(v=>v.props.testID?.startsWith('feature-card-'));
    assert.equal(frames.length,4);
    for(const screenWidth of [320,393,430]){
      const cardWidth=(screenWidth-40-12)/2;
      const width=cardWidth-22,height=Math.min(width/1.5,112);
      for(const frame of frames)await act(()=>frame.props.onLayout({nativeEvent:{layout:{width,height,x:0,y:0}}}));
      const images=renderer.root.findAllByType('Image');
      assert.equal(images.length,4);assert.equal(new Set(images.map(i=>i.props.source)).size,4,'each card retains its own original scene');
      for(const image of images){
        assert.equal(image.props.nativeBounds.width,width);
        assert.equal(image.props.nativeBounds.height,height,'native source height must be overridden explicitly');
        assert.equal(image.props.resizeMode,'contain','the full illustration stays visible');
        assert.equal(image.props.nativeBounds.left,0);assert.equal(image.props.nativeBounds.top,0);
      }
      for(const frame of frames)assert.equal(flatten(frame.props.style).overflow,'hidden');
    }
    for(const button of renderer.root.findAllByType('TouchableOpacity'))await act(()=>button.props.onPress());
    assert.deepEqual(opened,['payday','history','firstWin','quiet']);
  }finally{await act(()=>renderer.unmount());}
});
test('feature-screen artwork uses the same bounded sizing and remains compact on reopen',async()=>{
  const components=loadComponents(await import('../src/launch-essentials.mjs'));
  const finance={balance:200,bills:[],debts:[],quietMode:{}};let renderer;
  const render=panel=>React.createElement(components.default,{panel,finance,onClose(){},onChange(){},onUndo(){},onCorrect(){},onFirstWin(){},onSample(){},onPersonal(){}});
  await act(()=>{renderer=create(render('payday'));});
  try{
    for(const panel of ['payday','history','firstWin','quiet']){
      await act(()=>renderer.update(render(panel)));
      const frame=renderer.root.findAllByType('View').find(v=>v.props.testID===`feature-hero-${panel}`);
      assert.equal(flatten(frame.props.style).maxHeight,220);
      await act(()=>frame.props.onLayout({nativeEvent:{layout:{width:353,height:220,x:0,y:0}}}));
      const image=renderer.root.findByType('Image');
      assert.equal(image.props.nativeBounds.width,353);assert.equal(image.props.nativeBounds.height,220);
      assert.equal(image.props.resizeMode,'contain');
    }
  }finally{await act(()=>renderer.unmount());}
});
