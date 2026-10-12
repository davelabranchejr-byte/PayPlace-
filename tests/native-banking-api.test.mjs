import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeBankApi } from '../src/native-banking-api.mjs';
function store(value) { return { value, async read() { return this.value; }, async clear() { this.value = null; } }; }
test('bank API sends only a valid device session to the absolute HTTPS service with cookies omitted', async () => {
  const sessionStore = store({ token: 'a'.repeat(64), expiresAt: 2000 });
  const api = createNativeBankApi({ sessionStore, now: () => 1000, request: async (url, options) => {
    assert.equal(url, 'https://payplace-dave.davelabranchejr.chatgpt.site/api/banking/link-token');
    assert.equal(options.credentials, 'omit'); assert.equal(options.headers.Authorization, 'Bearer ' + 'a'.repeat(64));
    assert.deepEqual(JSON.parse(options.body), { platform: 'ios' }); return Response.json({ link_token: 'link-test' });
  } });
  assert.equal((await api('banking/link-token', { method: 'POST', data: { platform: 'ios' } })).link_token, 'link-test');
});
test('expired or missing local sessions fail before network requests; 401 revokes the saved session', async () => {
  for (const session of [null, { token: 'a'.repeat(64), expiresAt: 10 }, { token: 'invalid', expiresAt: 2000 }]) {
    const sessionStore = store(session), api = createNativeBankApi({ sessionStore, now: () => 100, request: async () => assert.fail('should not contact service') });
    await assert.rejects(api('banking/status'), error => error.code === 'SIGN_IN_REQUIRED'); assert.equal(sessionStore.value, null);
  }
  const sessionStore = store({ token: 'b'.repeat(64), expiresAt: 1000 });
  const api = createNativeBankApi({ sessionStore, now: () => 100, request: async () => Response.json({ error: { message: 'Session expired' } }, { status: 401 }) });
  await assert.rejects(api('banking/status'), error => error.code === 'SIGN_IN_REQUIRED'); assert.equal(sessionStore.value, null);
});
test('email verification requests never include stored banking credentials', async () => {
  const sessionStore = store({ token: 'c'.repeat(64), expiresAt: 2000 });
  const api = createNativeBankApi({ sessionStore, request: async (url, options) => { assert.equal(options.headers.Authorization, undefined); return Response.json({ sandboxEnabled: true }); } });
  assert.equal((await api('banking-auth/status', { authenticated: false })).sandboxEnabled, true);
});
test('non-JSON responses are handled and insecure service origins are rejected', async () => {
  const sessionStore = store(null);
  assert.throws(() => createNativeBankApi({ sessionStore, origin: 'http://example.com' }), /HTTPS/);
  const api = createNativeBankApi({ sessionStore, request: async () => new Response('<html>maintenance</html>') });
  await assert.rejects(api('banking-auth/status', { authenticated: false }), /could not be reached/);
});
