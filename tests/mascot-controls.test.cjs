const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),React=require('react'),babel=require('@babel/core');
const {create,act}=require('react-test-renderer');global.IS_REACT_ACT_ENVIRONMENT=true;
async function fixture({fontScale=1}={}){
  const actions=await import('../src/action-artwork.mjs'),cache=new Map();
  const Image=props=>React.createElement('Image',props);
  const flatten=s=>Array.isArray(s)?Object.assign({},...s.map(flatten)):s||{};
  const NativePressable=({children,...props})=>React.createElement('Pressable',props,typeof children==='function'?children({pressed:false}):children);
  const ui={Image,Text:'Text',View:'View',TouchableOpacity:'TouchableOpacity',Pressable:NativePressable,useWindowDimensions:()=>({width:375,height:812,fontScale}),StyleSheet:{flatten,create:value=>value}};
  function load(file){if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=babel.transformSync(fs.readFileSync(path.join(__dirname,'../src',file),'utf8'),{configFile:false,babelrc:false,plugins:['@babel/plugin-transform-react-jsx','@babel/plugin-transform-modules-commonjs']}).code;vm.runInNewContext(code,{module,exports:module.exports,require:name=>{if(name==='react')return React;if(name==='react-native')return ui;if(name==='./action-artwork.mjs')return actions;if(name==='./brand')return {payplaceLogo:'approved-payplace-icon'};if(name==='./Privacy')return {Text:'Text'};if(name==='./MascotTouchable')return load('MascotTouchable.js');if(name==='./ActionArtwork')return load('ActionArtwork.js');if(name==='./PayPlaceBadge')return load('PayPlaceBadge.js');if(name.startsWith('../assets/'))return name;throw new Error(name);}});return module.exports;}
  return {...load('MascotTouchable.js'),FeatureLinks:load('FeatureLinks.js').default,Image,actions,flatten,art:load('ActionArtwork.js').ACTION_ARTWORK};
}
test('unillustrated commands keep their behavior without picking art from labels', async () => {
  const f = await fixture();
  let renderer, taps = 0;
  const button = (label, artworkAction, disabled) => React.createElement(f.MascotTouchable, {
    accessibilityRole: 'button', accessibilityLabel: label, disabled, artworkAction, onPress: () => taps++,
  }, React.createElement('Text', null, label));
  await act(() => renderer = create(button('Back to Bills and Banking', undefined, true)));
  try {
    assert.equal(renderer.root.findByType('TouchableOpacity').props.disabled, true);
    assert.equal(renderer.root.findAllByType('Image').length, 0);
    await act(() => renderer.update(button('Remove my loan', 'unregistered', false)));
    assert.equal(renderer.root.findAllByType('Image').length, 0);
    await act(() => renderer.update(button('Close', 'close', false)));
    const image = renderer.root.findByType('Image');
    assert.equal(image.props.source, f.art.close);
    assert.equal(image.props.accessible, false);
    await act(() => renderer.root.findByType('TouchableOpacity').props.onPress());
    assert.equal(taps, 1);
  } finally {
    await act(() => renderer.unmount());
  }
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
test('action banners adapt between wide rows and narrow tiles without changing artwork or behavior',async()=>{
  const f=await fixture();let renderer,layouts=0,taps=0;
  await act(()=>renderer=create(React.createElement(f.MascotTouchable,{accessibilityRole:'button',artworkAction:'banking',accessibilityLabel:'Explore Plaid Banking',onLayout:()=>layouts++,onPress:()=>taps++,style:{backgroundColor:'#7842D2'}},React.createElement('Text',{style:{fontSize:14}},'Explore Plaid Banking'))));
  try{
    const original=renderer.root.findByType('Image').props.source;
    for(const width of [132,166,210,340]){
      await act(()=>renderer.root.findByType('TouchableOpacity').props.onLayout({nativeEvent:{layout:{width,height:100}}}));
      assert.equal(renderer.root.findByType('Image').props.source,original);
      const style=f.flatten(renderer.root.findByType('TouchableOpacity').props.style);
      assert.equal(style.flexDirection,width>=300?'row':'column');
      const image=renderer.root.findByType('Image');
      assert.equal(image.props.resizeMode,'contain');
      assert.ok(image.props.style.width>=100&&image.props.style.width<=112);
      assert.ok(image.props.style.width<=width-32);
      const label=renderer.root.findByType('Text');
      assert.ok(f.flatten(label.props.style).fontSize>=17);
      assert.equal(label.props.numberOfLines,undefined,'long labels remain free to wrap');
    }
    assert.equal(layouts,4);await act(()=>renderer.root.findByType('TouchableOpacity').props.onPress());assert.equal(taps,1);
  }finally{await act(()=>renderer.unmount());}
});
test('pressed style callbacks keep their selected colors and original action artwork',async()=>{
  const f=await fixture();let renderer;
  await act(()=>renderer=create(React.createElement(f.MascotPressable,{artworkAction:'close',style:({pressed})=>({backgroundColor:pressed?'#FF8479':'#14C8BD'}),onPress(){}},({pressed})=>React.createElement('Text',null,pressed?'Saving':'Save'))));
  try{const p=renderer.root.findByType('Pressable');assert.equal(f.flatten(p.props.style({pressed:true})).backgroundColor,'#FF8479');assert.equal(f.flatten(p.props.style({pressed:false})).backgroundColor,'#14C8BD');}
  finally{await act(()=>renderer.unmount());}
});
test('feature shortcuts display large unchanged artwork and open the same destinations',async()=>{
  const f=await fixture();let renderer;const opened=[];
  const items=[{title:'Billiam’s bill tools',artworkAction:'billTools',body:'Scan and organize bills.'},{title:'Plaid Banking',artworkAction:'banking'},{title:'My debt plan',artworkAction:'debt'}];
  await act(()=>renderer=create(React.createElement(f.FeatureLinks,{items:items.map(item=>({...item,onPress:()=>opened.push(item.title)}))})));
  try{
    const buttons=renderer.root.findAllByType('TouchableOpacity');assert.equal(buttons.length,3);
    for(let i=0;i<buttons.length;i++){
      const images=buttons[i].findAllByType('Image');assert.equal(images.length,1,'no duplicate action image is added');
      assert.equal(images[0].props.source,f.art[items[i].artworkAction]);
      assert.equal(images[0].props.style.width,128);assert.equal(images[0].props.style.height,128);
      assert.equal(images[0].props.resizeMode,'contain');
      await act(()=>buttons[i].props.onPress());
    }
    assert.deepEqual(opened,items.map(item=>item.title));
  }finally{await act(()=>renderer.unmount());}
});
test('state-based transparent portrait targets never acquire illustrations or button decoration',async()=>{
  const f=await fixture();let renderer;
  await act(()=>renderer=create(React.createElement(f.MascotPressable,{style:({pressed})=>[{position:'absolute',left:'20%',top:'10%',width:'25%',height:'20%'},pressed&&{borderColor:'#FFE89B'}],onPress(){},accessibilityLabel:'Meet Daddy. Read the full story.'})));
  try{const target=renderer.root.findByType('Pressable');assert.equal(target.findAllByType('Image').length,0);assert.equal(target.findAllByType('View').length,0);for(const pressed of [false,true]){const frame=f.flatten(target.props.style({pressed}));assert.equal(frame.left,'20%');assert.equal(frame.width,'25%');assert.equal(frame.backgroundColor,undefined);}}
  finally{await act(()=>renderer.unmount());}
});

test('different feature destinations use distinct relevant original scenes instead of generic fallbacks',async()=>{
  const f=await fixture();let renderer;const opened=[];
  const cases=[
    ['One small step','feature-one-small-step-westley.png'],
    ['Until next payday','feature-until-payday.png'],
    ['Your first win with Annie','feature-first-win.png'],
    ['Review my bills','feature-review-bills-westley.png'],
    ['Neighborhood','neighborhood-tabby.png'],
    ['Billiam’s Mailbox','billiam-mailbox.png'],
    ['Billiam’s bill tools','billiam-canonical.png'],
    ['I am overwhelmed','overwhelmed-westley-cozy.jpg'],
    ['Quiet Mode','feature-quiet-mode.png'],
    ['Visit Annie again','annie-front-door-mailbox.png'],
    ['Plaid Banking','feature-plaid-banking-entry.png'],
    ['My debt plan','snapshot-debt-plan.png'],
    ['Undo & payment history','feature-payment-history.png'],
    ['Subscription Detective','bobbie-premium-clubhouse.png'],
    ['Extra Paycheck Calendar','snapshot-extra-check.png'],
    ['Savings Goals','savings-goals-button-chapo.png'],
  ];
  await act(()=>renderer=create(React.createElement(f.FeatureLinks,{items:cases.map(([title])=>({title,onPress:()=>opened.push(title)}))})));
  try{
    const sources=[];
    for(const [index,button] of renderer.root.findAllByType('TouchableOpacity').entries()){
      const images=button.findAllByType('Image');
      assert.equal(images.length,['Review my bills','One small step'].includes(cases[index][0])?2:1);
      if (images.length === 2) assert.equal(images[1].props.source,'approved-payplace-icon');
      const source=images[0].props.source;sources.push(source);
      assert.equal(source,`../assets/characters/${cases[index][1]}`);
      await act(()=>button.props.onPress());
    }
    assert.equal(new Set(sources).size,cases.length,'unrelated destinations never reuse a generic image');
    assert.deepEqual(opened,cases.map(([title])=>title),'artwork changes retain the destinations');
  }finally{await act(()=>renderer.unmount());}
});

test('collapsing a section retains the artwork for that feature',async()=>{
  const f=await fixture();let renderer;
  const button=expanded=>React.createElement(f.MascotTouchable,{artworkAction:'quiet',accessibilityLabel:'Quiet Mode',accessibilityState:{expanded}},React.createElement('Text',null,'Quiet Mode'));
  await act(()=>renderer=create(button(false)));
  try{
    assert.equal(renderer.root.findByType('Image').props.source,f.art.quiet);
    await act(()=>renderer.update(button(true)));
    assert.equal(renderer.root.findByType('Image').props.source,f.art.quiet);
    assert.equal(f.actions.featureArtworkForTitle('Back to Calm Garden'),undefined);
  }finally{await act(()=>renderer.unmount());}
});

test('brightened neutral buttons retain readable ink and selected state colors',async()=>{
  const f=await fixture();let renderer;
  await act(()=>renderer=create(React.createElement(f.MascotTouchable,{accessibilityLabel:'Save my choice',style:{backgroundColor:'#FFFFFF'}},React.createElement('Text',{style:{color:'#536178'}},'Save my choice'))));
  try{
    const color=f.flatten(renderer.root.findByType('Text').props.style).color;
    const background=f.flatten(renderer.root.findByType('TouchableOpacity').props.style).backgroundColor;
    const luminance=hex=>{const channels=hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;};
    const values=[luminance(color),luminance(background)].sort((a,b)=>b-a);
    assert.ok((values[0]+0.05)/(values[1]+0.05)>=4.5,'body text remains readable on the vivid fill');
    await act(()=>renderer.update(React.createElement(f.MascotTouchable,{accessibilityState:{selected:true},style:{backgroundColor:'#6754E8'}},React.createElement('Text',{style:{color:'#FFFFFF'}},'Selected'))));
    assert.equal(f.flatten(renderer.root.findByType('TouchableOpacity').props.style).backgroundColor,'#6754E8');
    assert.equal(f.flatten(renderer.root.findByType('Text').props.style).color,'#FFFFFF');
  }finally{await act(()=>renderer.unmount());}
});

test('feature banners reserve label space and stack for narrow phone frames',async()=>{
  const f=await fixture();let renderer,taps=0;
  await act(()=>renderer=create(React.createElement(f.FeatureLinks,{items:[{title:'Neighborhood',body:'The family, Calm Garden and Em’s Pet Spa.',onPress:()=>taps++}]})));
  try{
    for(const [width,direction,size] of [[280,'column',128],[335,'row',96],[390,'row',128]]){
      const button=renderer.root.findByType('TouchableOpacity');
      await act(()=>button.props.onLayout({nativeEvent:{layout:{width,height:180}}}));
      assert.equal(f.flatten(button.props.style).flexDirection,direction);
      assert.equal(button.findByType('Image').props.style.width,size);
      const label=button.findAllByType('Text').find(node=>node.props.children==='Neighborhood');
      assert.equal(label.props.numberOfLines,direction==='row'?1:undefined);
      assert.equal(label.props.adjustsFontSizeToFit,direction==='row');
      assert.equal(button.findByType('Image').props.resizeMode,'contain');
    }
    await act(()=>renderer.root.findByType('TouchableOpacity').props.onPress());assert.equal(taps,1);
  }finally{await act(()=>renderer.unmount());}
});

test('larger system text gets a full-width caption without line limits',async()=>{
  const f=await fixture({fontScale:1.6});let renderer;
  await act(()=>renderer=create(React.createElement(f.FeatureLinks,{items:[{title:'Neighborhood',body:'The family, Calm Garden and Em’s Pet Spa.',onPress(){}}]})));
  try{
    const button=renderer.root.findByType('TouchableOpacity');
    await act(()=>button.props.onLayout({nativeEvent:{layout:{width:390,height:210}}}));
    assert.equal(f.flatten(button.props.style).flexDirection,'column');
    const label=button.findAllByType('Text').find(node=>node.props.children==='Neighborhood');
    assert.equal(label.props.numberOfLines,undefined);assert.equal(label.props.adjustsFontSizeToFit,false);
    assert.equal(button.findByType('Image').props.style.width,128);
  }finally{await act(()=>renderer.unmount());}
});
