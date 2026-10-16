import test from 'node:test';
import assert from 'node:assert/strict';
import { createOwnerInboxApi } from '../src/owner-inbox-api.mjs';
test('owner API sends codes without a bearer and private requests only with an unexpired protected session', async () => {
  let session = null, calls = [];
  const store = { read: async () => session, clear: async () => { session = null; } };
  const api = createOwnerInboxApi({ sessionStore: store, now: () => 100, origin: 'https://payplace.example', request: async (url, options) => { calls.push({ url, options }); return Response.json({ ok: true }); } });
  await assert.rejects(api('questions'), error => error.signIn);
  assert.equal(calls.length, 0);
  await api('request-code', { email: 'owner@example.com' }, false);
  assert.equal(calls[0].options.headers.Authorization, undefined);
  session = { token: 'a'.repeat(64), expiresAt: 200 };
  await api('questions?filter=new&offset=0');
  assert.equal(calls[1].options.headers.Authorization, 'Bearer ' + session.token);
  assert.equal(calls[1].options.credentials, 'omit'); assert.equal(calls[1].options.cache, 'no-store');
  session.expiresAt = 100;
  await assert.rejects(api('questions'), error => error.signIn);
  assert.equal(session, null); assert.equal(calls.length, 2);
});
test('server authorization failures clear the saved owner session', async () => {
  let cleared = false;
  const api = createOwnerInboxApi({ sessionStore: { read: async () => ({ token: 'a'.repeat(64), expiresAt: Date.now() + 10000 }), clear: async () => { cleared = true; } }, request: async () => Response.json({ error: 'Sign in again.' }, { status: 401 }) });
  await assert.rejects(api('questions'), error => error.signIn && error.message === 'Sign in again.');
  assert.equal(cleared, true);
});
