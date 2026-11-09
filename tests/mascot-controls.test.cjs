const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),React=require('react'),babel=require('@babel/core');
const {create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
async function fixture(){
  const actions=await import('../src/action-artwork.mjs'),cache=new Map();
  const Image=props=>React.createElement('Image',props);
  const flatten=s=>Array.isArray(s)?Object.assign({},...s.map(flatten)):s||{};
  const ui={Image,Text:'Text',View:'View',TouchableOpacity:'TouchableOpacity',Pressable:'Pressable',StyleSheet:{flatten}};
  function load(file){if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=babel.transformSync(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{configFile:false,babelrc:false,plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']}).code;vm.runInNewContext(code,{module,exports:module.exports,require:name=>{if(name==='react')return React;if(name==='react-native')return ui;if(name==='./action-artwork.mjs')return actions;if(name==='./ActionArtwork')return load('ActionArtwork.js');if(name.startsWith('../assets/'))return name;throw new Error(name);}});return module.exports;}
  return {...load('MascotTouchable.js'),Image,actions,flatten,art:load('ActionArtwork.js').ACTION_ARTWORK};
}
test('mascot controls preserve button behavior, disabled state and readable labels with bounded decorative artwork',async()=>{
  const f=await fixture();let renderer,taps=0;
  await act(()=>renderer=create(React.createElement(f.MascotTouchable,{accessibilityRole:'button',accessibilityLabel:'Save my choice',disabled:true,onPress:()=>taps++,style:{padding:12}},React.createElement('Text',null,'Save my choice'))));
  try{const button=renderer.root.findByType('TouchableOpacity'),image=renderer.root.findByType('Image');assert.equal(button.props.disabled,true);assert.equal(button.props.accessibilityLabel,'Save my choice');assert.equal(image.props.source,f.art.save);assert.equal(image.props.accessible,false);assert.equal(image.props.style.width,52);assert.equal(image.props.style.height,52);await act(()=>renderer.update(React.createElement(f.MascotTouchable,{artworkAction:'banking',accessibilityLabel:'Save bank',onPress:()=>taps++},React.createElement('Text',null,'Save bank'))));assert.equal(renderer.root.findByType('Image').props.source,f.art.banking,'explicit account semantics win over a user-entered name');await act(()=>renderer.root.findByType('TouchableOpacity').props.onPress());assert.equal(taps,1);}finally{await act(()=>renderer.unmount());}
});
test('painted hotspots and already illustrated controls retain their exact artwork and hit geometry',async()=>{
  const f=await fixture();let renderer;const style={position:'absolute',left:12,top:34,width:80,height:90};
  await act(()=>renderer=create(React.createElement(f.MascotPressable,{artworkMode:'hotspot',style,onPress(){}},null)));
  try{assert.equal(renderer.root.findAllByType('Image').length,0);assert.deepEqual(renderer.root.findByType('Pressable').props.style({pressed:false}),style);await act(()=>renderer.update(React.createElement(f.MascotTouchable,{artworkMode:'integrated',onPress(){}},React.createElement(f.Image,{source:'original-painting',style:{width:60,height:60}}))));assert.equal(renderer.root.findAllByType('Image').length,1);assert.equal(renderer.root.findByType('Image').props.source,'original-painting');}finally{await act(()=>renderer.unmount());}
});
test('navigation has four visible destinations and every nested billing route returns to Bills & Banking',async()=>{
  const {PRIMARY_DESTINATIONS,primaryDestination}=await import('../src/neighborhood-destinations.mjs');
  assert.deepEqual(PRIMARY_DESTINATIONS.map(p=>p.id),['Home','Budget','Bills','Neighborhood']);
  for(const id of ['Bills','Billiam','Premium','Debt'])assert.equal(primaryDestination(id),'Bills');
  for(const id of ['Spa','Calm','Annie','Bobbie','Westley','Tate','Chapo'])assert.equal(primaryDestination(id),'Neighborhood');
});
test('narrow buttons stack the same illustration above a wrapping label and keep callbacks',async()=>{
  const f=await fixture();let renderer,layouts=0,taps=0;
  await act(()=>renderer=create(React.createElement(f.MascotTouchable,{accessibilityRole:'button',accessibilityLabel:'Remember across my accounts',onLayout:()=>layouts++,onPress:()=>taps++,style:{backgroundColor:'#7842D2'}},React.createElement('Text',{style:{fontSize:14}},'Remember across my accounts'))));
  try{
    const original=renderer.root.findByType('Image').props.source;
    for(const width of [132,166,210,340]){
      await act(()=>renderer.root.findByType('TouchableOpacity').props.onLayout({nativeEvent:{layout:{width,height:100}}}));
      assert.equal(renderer.root.findByType('Image').props.source,original);
      const style=f.flatten(renderer.root.findByType('TouchableOpacity').props.style);
      assert.equal(style.flexDirection,width<240?'column':'row');
      const label=renderer.root.findByType('Text');
      assert.ok(f.flatten(label.props.style).fontSize>=17);
      assert.equal(label.props.numberOfLines,undefined,'long labels remain free to wrap');
    }
    assert.equal(layouts,4);await act(()=>renderer.root.findByType('TouchableOpacity').props.onPress());assert.equal(taps,1);
  }finally{await act(()=>renderer.unmount());}
});
test('pressed style callbacks keep their selected colors and original action artwork',async()=>{
  const f=await fixture();let renderer;
  await act(()=>renderer=create(React.createElement(f.MascotPressable,{artworkAction:'save',style:({pressed})=>({backgroundColor:pressed?'#FF8479':'#14C8BD'}),onPress(){}},({pressed})=>React.createElement('Text',null,pressed?'Saving':'Save'))));
  try{const p=renderer.root.findByType('Pressable');assert.equal(f.flatten(p.props.style({pressed:true})).backgroundColor,'#FF8479');assert.equal(f.flatten(p.props.style({pressed:false})).backgroundColor,'#14C8BD');}
  finally{await act(()=>renderer.unmount());}
});
