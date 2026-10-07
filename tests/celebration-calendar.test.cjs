const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
test('celebration opens an editable extra-check plan and stays acknowledged after reopening', async () => {
  const calendar = await import('../src/paycheck-calendar.mjs');
  const celebration = await import('../src/paycheck-celebration.mjs');
  const { parseAmount } = await import('../src/smart-mirror.mjs');
  const source = fs.readFileSync(require('node:path').join(__dirname,'../src/ExtraPaycheckCalendar.js'),'utf8').replace(/^import .*;\n/gm,'').replace('export default function','function');
  const code = babel.transformSync(source,{configFile:false,babelrc:false,plugins:[[require('@babel/plugin-transform-react-jsx'),{runtime:'classic'}]]}).code;
  class OctoberDate extends Date { constructor(...args) { super(...(args.length ? args : ['2026-10-07T12:00:00'])); } }
  const sandbox = { React, useEffect:React.useEffect, useMemo:React.useMemo, useRef:React.useRef, useState:React.useState, Date:OctoberDate, ...calendar, ...celebration, parseAmount, Platform:{OS:'ios'}, StyleSheet:{create:x=>x}, ...Object.fromEntries(['Modal','SafeAreaView','KeyboardAvoidingView','View','Text','TextInput','TouchableOpacity','ScrollView','Ionicons','ExtraPaycheckChapoScene','ExtraPaycheckCelebration'].map(k=>[k,k])), module:{exports:{}} };
  vm.runInNewContext(code+'\nmodule.exports=ExtraPaycheckCalendar;',sandbox);
  const Calendar=sandbox.module.exports;
  let latest;
  function Wrapper({visible}) {
    const [finance,setFinance]=React.useState({nextPaycheckDate:'2026-10-02',payFrequency:'Biweekly',nextPaycheck:1000,extraPaycheckPlans:{}});
    latest=finance;
    return React.createElement(Calendar,{visible,finance,upcomingTotal:100,onClose:()=>{},onBudget:()=>{},onAction:action=>{
      setFinance(current=>action.type==='celebrationSeen' ? {...current,extraPaycheckCelebrations:{...current.extraPaycheckCelebrations,[action.key]:true}} : action.type==='split' ? calendar.saveSplit(current,action.event,action.values) : current);
      return true;
    }});
  }
  let renderer;
  await act(()=>{renderer=create(React.createElement(Wrapper,{visible:true}));});
  try {
    const overlay=renderer.root.findByType('ExtraPaycheckCelebration');
    assert.equal(overlay.props.event.id,'pay-2026-10-30');
    await act(()=>overlay.props.onPlan());
    assert.equal(latest.extraPaycheckCelebrations['2026-10'],true);
    assert.equal(renderer.root.findAllByType('ExtraPaycheckCelebration').length,0);
    const fields=renderer.root.findAllByType('TextInput');
    assert.equal(fields.length,4);
    const joy=fields.find(f=>f.props.accessibilityLabel==='Guilt-free joy');
    await act(()=>joy.props.onChangeText('20.50'));
    const save=renderer.root.findAllByType('TouchableOpacity').find(n=>n.props.accessibilityLabel==='Save this check’s plan');
    await act(()=>save.props.onPress());
    assert.equal(latest.extraPaycheckPlans['pay-2026-10-30'].split.joy,20.5);
    await act(()=>renderer.update(React.createElement(Wrapper,{visible:false})));
    await act(()=>renderer.update(React.createElement(Wrapper,{visible:true})));
    assert.equal(renderer.root.findAllByType('ExtraPaycheckCelebration').length,0);
    assert.equal(latest.extraPaycheckPlans['pay-2026-10-30'].split.joy,20.5);
  } finally { await act(()=>renderer.unmount()); }
});
