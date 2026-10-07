const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const flatten = value => Object.assign({}, ...(Array.isArray(value) ? value.flat(Infinity) : [value]).filter(Boolean));
function load(file, imports, exports) {
  const source = fs.readFileSync(path.join(__dirname, '../src/', file), 'utf8')
    .replace(/^import .*;\n/gm, '').replace(/export default function /g, 'function ').replace(/export function /g, 'function ').replace(/export const /g, 'const ');
  const code = babel.transformSync(source, { configFile: false, babelrc: false,
    plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]] }).code;
  const sandbox = { React, useState: React.useState, require: () => 1,
    ...Object.fromEntries(['Image','View','Text','TextInput','ScrollView','TouchableOpacity','Pressable','Ionicons','CharacterArtwork','PawprintMemory','Modal','SafeAreaView'].map(k => [k,k])),
    StyleSheet: { create: x => x, absoluteFillObject: { position:'absolute',top:0,left:0,right:0,bottom:0 } },
    ...imports, module:{exports:{}} };
  vm.runInNewContext(code + '\nmodule.exports = {' + exports.join(',') + '};', sandbox);
  return sandbox.module.exports;
}
test('gallery fits full artwork at phone and tablet widths; all six frame targets remain aligned and clickable', async () => {
  const layout = await import('../src/family-wall-layout.mjs');
  const lore = Object.fromEntries(['westley','tate','bobbie','chapo','annie'].map(id => [id,{name:id,role:id,emotionalPromise:id}]));
  const {FamilyWall,FAMILY_STORIES} = load('FamilyWall.js', {...layout, MASCOT_LORE:lore}, ['FamilyWall','FAMILY_STORIES']);
  let selected,renderer;
  await act(() => { renderer=create(React.createElement(FamilyWall,{onSelect:p=>selected=p})); });
  try {
    for(const w of [284,339,394,720]) {
      const boundary=renderer.root.findAllByType('View').find(n=>n.props.onLayout);
      await act(()=>boundary.props.onLayout({nativeEvent:{layout:{width:w}}}));
      const box=flatten(renderer.root.findByProps({testID:'family-gallery'}).props.style);
      assert.equal(box.width,Math.min(540,w)); assert.equal(box.height,box.width*1.5);
      const image=renderer.root.findByProps({testID:'family-gallery-artwork'});
      assert.equal(flatten(image.props.style).width,'100%'); assert.equal(flatten(image.props.style).height,'100%');
      assert.equal(image.props.resizeMode,'contain');
      for(const person of FAMILY_STORIES) {
        const target=renderer.root.findByProps({testID:`family-portrait-${person.id}`});
        const bounds=flatten(target.props.style({pressed:false}));
        const [x,y,fw,fh]=layout.FAMILY_PORTRAITS[person.id].frame;
        assert.ok(Math.abs(parseFloat(bounds.left)/100*box.width-x/1024*box.width)<0.001);
        assert.ok(Math.abs(parseFloat(bounds.top)/100*box.height-y/1536*box.height)<0.001);
        assert.ok(x>=0&&y>=0&&x+fw<=1024&&y+fh<=1536);
        await act(()=>target.props.onPress()); assert.equal(selected.id,person.id);
      }
    }
  } finally { await act(()=>renderer.unmount()); }
});
test('quilt uses approved stitched acorn art and opens/returns from its detailed view',async()=>{
  const {BelongingQuilt,QuiltDetail,AcornSquare}=load('BelongingQuilt.js',{},['BelongingQuilt','QuiltDetail','AcornSquare']);
  let opened=0,back=0,r;
  await act(()=>{r=create(React.createElement(BelongingQuilt,{onOpen:()=>opened++}));});
  await act(()=>r.root.findByProps({testID:'belonging-quilt-preview'}).props.onPress()); assert.equal(opened,1);
  await act(()=>r.update(React.createElement(QuiltDetail,{onBack:()=>back++})));
  const artwork=r.root.findAllByType('CharacterArtwork');
  assert.ok(artwork.some(n=>n.props.source.label.includes('embroidered golden acorn')));
  for(const n of artwork) {
    const a=n.props.source,[x,y,w,h]=a.crop;
    assert.ok(x>=0&&y>=0&&x+w<=a.width&&y+h<=a.height);
  }
  await act(()=>r.root.findByProps({testID:'quilt-back'}).props.onPress()); assert.equal(back,1);
  await act(()=>r.update(React.createElement(AcornSquare)));
  assert.equal(r.root.findByType('CharacterArtwork').props.source.crop.length,4);
  await act(()=>r.unmount());
});

test('approved combined paw-print wall opens uncropped and closes by button or system Back', async () => {
  const {PawprintMemory}=load('PawprintMemory.js',{},['PawprintMemory']);
  const png=fs.readFileSync(path.join(__dirname,'../assets/characters/em-pawprint-memory-wall.png'));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  let r;
  await act(()=>{r=create(React.createElement(PawprintMemory));});
  try {
    const preview=r.root.findByProps({testID:'pawprint-memory-preview'});
    assert.equal(r.root.findByType('Modal').props.visible,false);
    await act(()=>preview.props.onPress());
    assert.equal(r.root.findByType('Modal').props.visible,true);
    const small=r.root.findByProps({testID:'pawprint-garden-artwork'});
    const full=r.root.findByProps({testID:'pawprint-memory-full'});
    for(const img of [small,full]) {
      assert.equal(img.props.resizeMode,'contain');
      assert.equal(flatten(img.props.style).width,'100%');
      assert.equal(flatten(img.props.style).height,'100%');
    }
    for(const frame of [preview,r.root.findByProps({testID:'pawprint-memory-full-frame'})]) {
      const style=Array.isArray(frame.props.style)||typeof frame.props.style==='object'
        ? frame.props.style : frame.props.style({pressed:false});
      assert.equal(flatten(style).aspectRatio,width/height);
    }
    assert.equal(small.props.source,full.props.source);
    await act(()=>r.root.findByProps({testID:'pawprint-memory-close'}).props.onPress());
    assert.equal(r.root.findByType('Modal').props.visible,false);
    await act(()=>preview.props.onPress());
    await act(()=>r.root.findByType('Modal').props.onRequestClose());
    assert.equal(r.root.findByType('Modal').props.visible,false);
  } finally { await act(()=>r.unmount()); }
});

test('calendar and mirror money fields keep partial cents editable and format valid amounts on blur', async () => {
  const {parseAmount}=await import('../src/smart-mirror.mjs');
  for(const file of ['ExtraPaycheckCalendar.js','BobbieSmartMirror.js']) {
    const {Field}=load(file,{parseAmount, Platform:{select:()=> 'cursive'}, useEffect:React.useEffect,useRef:React.useRef},['Field']);
    let value='',r;
    const render=()=>React.createElement(Field,{label:'Test amount',money:true,value,
      onChangeText:text=>{value=text;r.update(render());}});
    await act(()=>{r=create(render());});
    try {
      for(const text of ['123.','123.0','123.05','.05','123.10']) {
        await act(()=>r.root.findByType('TextInput').props.onChangeText(text));
        assert.equal(value,text);
      }
      await act(()=>r.root.findByType('TextInput').props.onBlur());
      assert.equal(value,'123.10');
      await act(()=>r.root.findByType('TextInput').props.onChangeText('.05'));
      await act(()=>r.root.findByType('TextInput').props.onBlur());
      assert.equal(value,'0.05');
      await act(()=>r.root.findByType('TextInput').props.onChangeText('invalid'));
      await act(()=>r.root.findByType('TextInput').props.onBlur());
      assert.equal(value,'invalid');
    } finally { await act(()=>r.unmount()); }
  }
});
