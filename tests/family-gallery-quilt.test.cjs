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
    ...Object.fromEntries(['Image','View','Text','TextInput','ScrollView','TouchableOpacity','Pressable','Ionicons','CharacterArtwork','PawprintMemory','ArtworkBrandMark','Modal','SafeAreaView'].map(k => [k,k])),
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
  const {BelongingQuilt,QuiltDetail,AcornSquare,ChairQuilt}=load('BelongingQuilt.js',{...await import('../src/quilt-milestones.mjs'), FACEBOOK_NEIGHBORHOOD_URL:'https://www.facebook.com/example'},['BelongingQuilt','QuiltDetail','AcornSquare','ChairQuilt']);
  let opened=0,back=0,r;
  const claimed=[];
  await act(()=>{r=create(React.createElement(BelongingQuilt,{onOpen:()=>opened++}));});
  await act(()=>r.root.findByProps({testID:'belonging-quilt-preview'}).props.onPress()); assert.equal(opened,1);
  await act(()=>r.update(React.createElement(QuiltDetail,{onBack:()=>back++,onMilestone:id=>claimed.push(id),finance:{quiltMilestones:['firstBill']}})));
  await act(()=>r.root.findByProps({testID:'quilt-square-firstBill'}).props.onPress());
  assert.ok(r.root.findAllByType('Text').some(n=>n.props.children==='Saved your first bill'));
  for (const label of ['I joined the group','I invited a friend']) {
    const button=r.root.findAllByType('TouchableOpacity').find(n=>n.findAllByType('Text').some(t=>t.props.children===label));
    await act(()=>button.props.onPress());
  }
  assert.deepEqual(claimed,['joinedFacebook','invitedFriend']);
  const artwork=r.root.findAllByType('CharacterArtwork');
  assert.ok(artwork.some(n=>n.props.source.label.includes('embroidered golden acorn')));
  for(const n of artwork.filter(node => node.props.source.crop)) {
    const a=n.props.source,[x,y,w,h]=a.crop;
    assert.ok(x>=0&&y>=0&&x+w<=a.width&&y+h<=a.height);
  }
  await act(()=>r.root.findByProps({testID:'quilt-back'}).props.onPress()); assert.equal(back,1);
  await act(()=>r.update(React.createElement(AcornSquare)));
  assert.equal(r.root.findByType('CharacterArtwork').props.source.crop.length,4);
  const finance = { quiltMilestones: ['firstBill', 'foundNote', 'savingsGoal'] };
  const squares = prefix => r.root.findAll(node => typeof node.type === 'string' && node.props.testID?.startsWith(prefix));
  await act(() => r.update(React.createElement(ChairQuilt, { finance })));
  const chairSquares = squares('chair-quilt-square-');
  assert.deepEqual(chairSquares.map(node => node.props.testID.replace('chair-', '')),
    ['quilt-square-acorn', 'quilt-square-firstBill', 'quilt-square-foundNote', 'quilt-square-savingsGoal']);
  for (const node of chairSquares) {
    const {left,top,width,height} = node.props.style;
    assert.equal(node.props.resizeMode, 'stretch');
    assert.ok(parseFloat(left) >= 7 && parseFloat(left) + parseFloat(width) <= 30);
    assert.ok(parseFloat(top) >= 50 && parseFloat(top) + parseFloat(height) <= 81);
  }
  const chairIds = chairSquares.map(node => node.props.testID.replace('chair-', ''));
  await act(() => r.update(React.createElement(QuiltDetail, { finance })));
  const quiltSquares = squares('quilt-square-');
  assert.deepEqual(quiltSquares.map(node => node.props.testID), chairIds);
  for (const node of quiltSquares) {
    assert.equal(flatten(node.props.style).aspectRatio, 1);
    assert.equal(flatten(node.findByType('CharacterArtwork').props.style).height, '100%');
  }
  await act(()=>r.unmount());
});

test('both keepsakes open uncropped from their positions on one family wall', async () => {
  const {PawprintMemory}=load('PawprintMemory.js',{
    require: filename => path.basename(filename),
  },['PawprintMemory']);
  let r;
  await act(()=>{r=create(React.createElement(PawprintMemory));});
  try {
    const preview=r.root.findByProps({testID:'pawprint-memory-preview'});
    const turkeys=r.root.findByProps({testID:'wild-turkeys-preview'});
    const wall=r.root.findByProps({testID:'family-keepsake-wall-frame'});
    const wallArt=wall.findByProps({testID:'family-keepsake-wall-artwork'});
    assert.equal(wallArt.props.resizeMode,'contain');
    assert.equal(wallArt.props.source,'em-family-keepsake-wall.jpg');
    assert.equal(flatten(wall.props.style).aspectRatio,2/3);
    const bounds = node => flatten(node.props.style({pressed:false}));
    assert.ok(parseFloat(bounds(turkeys).top) > parseFloat(bounds(preview).top) + parseFloat(bounds(preview).height));
    assert.ok(parseFloat(bounds(turkeys).left) < parseFloat(bounds(preview).left) + parseFloat(bounds(preview).width));
    assert.equal(r.root.findByType('Modal').props.visible,false);
    await act(()=>preview.props.onPress());
    assert.equal(r.root.findByType('Modal').props.visible,true);
    for(const img of [wallArt,r.root.findByProps({testID:'pawprint-memory-full'})]) {
      assert.equal(img.props.resizeMode,'contain');
      assert.equal(flatten(img.props.style).width,'100%');
      assert.equal(flatten(img.props.style).height,'100%');
    }
    assert.equal(flatten(r.root.findByProps({testID:'pawprint-memory-full-frame'}).props.style).aspectRatio,1186/1326);
    await act(()=>r.root.findByProps({testID:'pawprint-memory-close'}).props.onPress());
    assert.equal(r.root.findByType('Modal').props.visible,false);
    await act(()=>turkeys.props.onPress());
    const painting=r.root.findByProps({testID:'wild-turkeys-full'});
    assert.equal(painting.props.source,'em-wild-turkeys-painting.jpg');
    assert.equal(painting.props.resizeMode,'contain');
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
