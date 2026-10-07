const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const babel = require('@babel/core');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
let flow, progress, contact, vaultModule;
test.before(async () => {
  progress = await import('../src/onboarding-progress.mjs');
  contact = await import('../src/contact-verification.mjs');
  vaultModule = await import('../src/vault-storage.mjs');
  const source = fs.readFileSync(require('node:path').join(__dirname, '../App.js'), 'utf8');
  const code = babel.transformSync(source.slice(source.indexOf('const ONBOARDING_STEPS ='),
    source.indexOf('function Header(')), { configFile: false, babelrc: false,
    plugins: [[require('@babel/plugin-transform-react-jsx'), { runtime: 'classic' }]],
  }).code;
  const sandbox = { React, useState: React.useState, useEffect: React.useEffect,
    ...Object.fromEntries(['View', 'Text', 'TextInput', 'ScrollView', 'TouchableOpacity',
      'SafeAreaView', 'KeyboardAvoidingView', 'PayPlaceBrand', 'CharacterArtwork',
      'ConstructionNotice', 'EmailVerification', 'Ionicons'].map(name => [name, name])),
    styles: {}, palette: {}, portraits: {}, greatAnnieHero: {}, imageSource: value => value,
    Platform: { OS: 'ios' }, Alert: { alert: () => {} }, ...progress, ...contact, module: { exports: {} } };
  vm.runInNewContext(code + '\nmodule.exports = { OnboardingFlow, ONBOARDING_STEPS };', sandbox);
  flow = sandbox.module.exports;
});

test('interrupted answers resume from encrypted storage at the exact question; Back retains edits', async () => {
  const records = new Map(); let key = null;
  const adapters = { storage: { getItem: async k => records.get(k) ?? null,
    setItem: async (k, value) => records.set(k, value), removeItem: async k => records.delete(k) },
    readKey: async () => key, writeKey: async next => { key = next; },
    randomBytes: n => new Uint8Array(require('node:crypto').randomBytes(n)) };
  const vault = vaultModule.createVaultStorage(adapters);
  const writes = []; let saved, renderer;
  const onProgress = profile => { saved = profile; writes.push(vault.setItem(vaultModule.PROFILE_KEY, JSON.stringify(profile))); };
  const render = initialAnswers => React.createElement(flow.OnboardingFlow,
    { initialAnswers, onProgress, onComplete: async () => {} });
  const button = text => renderer.root.findAllByType('TouchableOpacity').find(node =>
    node.findAllByType('Text').some(child => child.props.children === text));
  const press = async text => { assert.ok(button(text), `button ${text} exists`); await act(() => button(text).props.onPress()); };
  await act(() => { renderer = create(render({ name: '', arrivalReason: '' })); });
  try {
    await press('I want less financial stress'); await press('Sit with Annie');
    await act(() => renderer.root.findByType('TextInput').props.onChangeText('Aunt Judy'));
    await press('Next'); await press('Pay off debt'); await press('Next');
    assert.equal(saved.onboardingProgress.stage, 'questions'); assert.equal(saved.onboardingProgress.stepIndex, 2);
    await act(() => renderer.unmount()); await Promise.all(writes);
    assert.ok(!records.get(vaultModule.VAULT_KEY).includes('Aunt Judy'));
    const reopened = JSON.parse(await vaultModule.createVaultStorage(adapters).getItem(vaultModule.PROFILE_KEY));
    await act(() => { renderer = create(render(reopened)); });
    assert.ok(renderer.root.findAllByType('Text').some(n => n.props.children === 'How does managing money feel right now?'));
    await press('Back'); await press('Back');
    assert.equal(renderer.root.findByType('TextInput').props.value, 'Aunt Judy');
    await press('Back'); assert.equal(saved.onboardingProgress.stage, 'annie');
    assert.equal(saved.arrivalReason, 'I want less financial stress');
  } finally { await act(() => renderer.unmount()); await Promise.all(writes); }
});

test('later stages resume and navigate back without restarting; verification drafts persist', async () => {
  let saved, completed, renderer;
  const answers = { name: 'Dave', arrivalReason: 'I want less financial stress', email: 'd@example.test',
    onboardingProgress: { version: 1, stage: 'email', stepIndex: 6 } };
  await act(() => { renderer = create(React.createElement(flow.OnboardingFlow, {
    initialAnswers: answers, onProgress: profile => { saved = profile; }, onComplete: async value => { completed = value; },
  })); });
  const back = () => renderer.root.findAllByType('TouchableOpacity').find(node => node.props.accessibilityLabel?.startsWith('Back'));
  try {
    await act(() => renderer.root.findByType('EmailVerification').props.onDraftChange({ email: 'new@example.test', annieLetters: true }));
    assert.equal(saved.email, 'new@example.test'); assert.equal(saved.annieLetters, true);
    await act(() => back().props.onPress()); assert.equal(saved.onboardingProgress.stage, 'quilt');
    await act(() => back().props.onPress()); assert.equal(saved.onboardingProgress.stage, 'questions');
    assert.equal(saved.onboardingProgress.stepIndex, flow.ONBOARDING_STEPS.length - 1);
    assert.equal(completed, undefined);
  } finally { await act(() => renderer.unmount()); }
});

test('completed verified neighbors enter on relaunch; unverified flags and restored backups cannot bypass email', () => {
  const verified = { completed: true, emailVerified: true, email: 'd@example.test' };
  assert.equal(progress.canEnterNeighborhood(verified), true);
  assert.equal(progress.canEnterNeighborhood({ completed: true, email: 'd@example.test' }), false);
  assert.equal(progress.canEnterNeighborhood({ ...verified, completed: false }), false);
  assert.throws(() => progress.completedProfile({ name: 'Dave' }));
  const done = progress.completedProfile({ ...verified, onboardingProgress: { stage: 'email' } }, '2026-10-07T13:00:00Z');
  assert.equal(done.onboardingProgress, undefined); assert.equal(done.completedAt, '2026-10-07T13:00:00Z');
  const restored = progress.restoredProfile(verified, 7);
  assert.equal(progress.canEnterNeighborhood(restored), false);
  assert.equal(progress.onboardingPosition(restored, 7).stage, 'email');
  assert.equal(progress.onboardingPosition({ completed: true }, 7).stage, 'email');
  assert.equal(progress.onboardingPosition({ onboardingProgress: { version: 1, stage: 'questions', stepIndex: 99 } }, 7).stepIndex, 6);
  assert.equal(progress.onboardingPosition({ onboardingProgress: { version: 1, stage: 'unknown', stepIndex: -5 } }, 7).stage, 'annie');
});
