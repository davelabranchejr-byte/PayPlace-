const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;

test('email draft is retained and verified one-use code can retry a failed local save', async () => {
  const contactHelpers = await import('../src/contact-verification.mjs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../src/EmailVerification.js'), 'utf8');
  const code = babel.transformSync(source.slice(source.indexOf('const api =')).replace('export default function', 'function'), {
    configFile: false, babelrc: false,
    plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]],
  }).code;
  let verifies = 0, saves = 0, draft;
  const sandbox = { React, useState: React.useState, useEffect: React.useEffect,
    Platform: { OS: 'ios' }, Text: 'Text', TextInput: 'TextInput', TouchableOpacity: 'TouchableOpacity', View: 'View',
    Date, Math, setInterval: () => 1, clearInterval: () => {}, ...contactHelpers,
    createContactApi: () => async (action, payload) => {
      if (action === 'status') return { emailConfigured: true };
      if (action === 'request-code') return { challengeId: 'once', resendAfter: 60 };
      assert.equal(action, 'verify'); assert.equal(payload.code, 'ABCDEFGH');
      verifies++; return { verified: true, channel: 'email', contact: 'judy@example.test', verifiedAt: '2026-10-07T13:00:00Z' };
    }, module: { exports: {} },
  };
  vm.runInNewContext(code + '\nmodule.exports = EmailVerification;', sandbox);
  let renderer;
  await act(async () => { renderer = create(React.createElement(sandbox.module.exports, {
    answers: { name: 'Judy' }, onDraftChange: value => { draft = value; },
    onVerified: async profile => { saves++; assert.equal(profile.emailVerified, true); if (saves === 1) throw new Error('Disk full'); },
  })); });
  const button = label => renderer.root.findAllByType('TouchableOpacity').find(node =>
    node.findAllByType('Text').some(child => child.props.children === label));
  try {
    await act(() => renderer.root.findByType('TextInput').props.onChangeText('judy@example.test'));
    assert.equal(draft.email, 'judy@example.test'); assert.equal(draft.emailVerified, false);
    await act(async () => button('Send my security code').props.onPress());
    await act(() => renderer.root.findByType('TextInput').props.onChangeText('ABCDEFGH'));
    await act(async () => button('Confirm code and enter').props.onPress());
    assert.equal(verifies, 1); assert.equal(saves, 1); assert.ok(button('Save and enter'));
    await act(async () => button('Save and enter').props.onPress());
    assert.equal(verifies, 1); assert.equal(saves, 2);
  } finally { await act(() => renderer.unmount()); }
});
