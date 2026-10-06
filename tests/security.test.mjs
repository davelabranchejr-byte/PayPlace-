import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { seal, open, createBackup, restoreBackup, BACKUP_ITERATIONS, MAX_BACKUP_BYTES } from '../src/security-crypto.mjs';
import { createVaultStorage, FINANCE_KEY, PROFILE_KEY, VAULT_KEY } from '../src/vault-storage.mjs';
import { needsResumeAuthentication, BACKGROUND_LOCK_MS } from '../src/security-policy.mjs';
const random = n => new Uint8Array(randomBytes(n));
const finance = { balance: 1234, bills: [{ id: 'rent', name: 'Rent', amount: '1200.00' }], debts: [{ id: 'card', name: 'Card', balance: 400, apr: 22, minimum: 25 }] };
function fixture(initial = {}) {
  const map = new Map(Object.entries(initial));
  let key = null;
  let failWrite = false;
  const storage = { getItem: async k => map.get(k) ?? null, setItem: async (k, v) => { if (failWrite) throw new Error('Disk full'); map.set(k, v); }, removeItem: async k => map.delete(k) };
  const adapters = { storage, readKey: async () => key, writeKey: async k => { key = k; }, randomBytes: random };
  return { map, storage, vault: createVaultStorage(adapters), adapters, forgetKey: () => { key = null; }, failWrite: () => { failWrite = true; } };
}
test('AES-GCM encrypts names and authenticates all ciphertext', () => {
  const key = random(32), text = seal(finance, key, random);
  assert(!text.includes('Rent')); assert.deepEqual(open(text, key), finance);
  const damaged = JSON.parse(text); damaged.ciphertext = (damaged.ciphertext[0] === 'a' ? 'b' : 'a') + damaged.ciphertext.slice(1);
  assert.throws(() => open(JSON.stringify(damaged), key));
  assert.throws(() => open(text, random(32)));
});
test('each encryption uses a distinct nonce', () => {
  const key = random(32); assert.notEqual(seal(finance, key, random), seal(finance, key, random));
});
test('legacy finance and profile migrate together before plaintext is removed', async () => {
  const f = fixture({ [FINANCE_KEY]: JSON.stringify(finance), [PROFILE_KEY]: JSON.stringify({ name: 'Dave', notes: 'Private note' }) });
  assert.equal(await f.vault.getItem(FINANCE_KEY), JSON.stringify(finance));
  assert.equal(JSON.parse(await f.vault.getItem(PROFILE_KEY)).name, 'Dave');
  assert(!f.map.has(FINANCE_KEY)); assert(!f.map.has(PROFILE_KEY));
  assert(!f.map.get(VAULT_KEY).includes('Private note'));
});
test('failed migration preserves legacy data', async () => {
  const original = JSON.stringify(finance), f = fixture({ [FINANCE_KEY]: original }); f.failWrite();
  await assert.rejects(f.vault.getItem(FINANCE_KEY)); assert.equal(f.map.get(FINANCE_KEY), original); assert(!f.map.has(VAULT_KEY));
});
test('invalid legacy JSON is preserved and blocked', async () => {
  const f = fixture({ [FINANCE_KEY]: '{broken' }); await assert.rejects(f.vault.getItem(FINANCE_KEY)); assert.equal(f.map.get(FINANCE_KEY), '{broken');
});
test('missing device key fails closed without replacing ciphertext', async () => {
  const f = fixture(); await f.vault.setItem(FINANCE_KEY, JSON.stringify(finance)); const old = f.map.get(VAULT_KEY); f.forgetKey();
  await assert.rejects(f.vault.getItem(FINANCE_KEY), /key is missing/);
  await assert.rejects(f.vault.setItem(FINANCE_KEY, '{}'));
  assert.equal(f.map.get(VAULT_KEY), old);
});
test('corrupt ciphertext is never silently replaced', async () => {
  const f = fixture(); await f.vault.setItem(FINANCE_KEY, JSON.stringify(finance)); f.map.set(VAULT_KEY, '{bad');
  await assert.rejects(f.vault.getItem(FINANCE_KEY)); await assert.rejects(f.vault.setItem(FINANCE_KEY, '{}')); assert.equal(f.map.get(VAULT_KEY), '{bad');
});
test('concurrent saves serialize without losing profile or finance', async () => {
  const f = fixture(); await Promise.all([f.vault.setItem(FINANCE_KEY, JSON.stringify(finance)), f.vault.setItem(PROFILE_KEY, '{"name":"Dave"}'), f.vault.setItem(FINANCE_KEY, JSON.stringify({ ...finance, balance: 9 }))]);
  assert.equal(JSON.parse(await f.vault.getItem(FINANCE_KEY)).balance, 9); assert.equal(await f.vault.getItem(PROFILE_KEY), '{"name":"Dave"}');
});
test('encrypted backup round trips but excludes verification, sessions, and letter consent', async () => {
  const text = await createBackup(finance, { name: 'Dave', email: 'd@example.test', verified: true, contactVerified: true, completed: true, letters: true, session: 'secret' }, 'a-long-test-password', random);
  assert(!text.includes('d@example.test')); assert(!text.includes('Rent'));
  const restored = await restoreBackup(text, 'a-long-test-password');
  assert.deepEqual(restored.finance, finance); assert.deepEqual(restored.profile, { name: 'Dave', email: 'd@example.test' });
  await assert.rejects(restoreBackup(text, 'incorrect-password'));
});
test('backup rejects weak passwords and oversized files', async () => {
  await assert.rejects(createBackup(finance, {}, 'short', random));
  await assert.rejects(restoreBackup('x'.repeat(MAX_BACKUP_BYTES + 1), 'password'));
});
test('backup rejects attacker-controlled KDF cost before deriving a key', async () => {
  const fake = JSON.stringify({ kind: 'backup', version: 1, cipher: 'AES-256-GCM', nonce: '00'.repeat(12), ciphertext: '00'.repeat(16), kdf: 'PBKDF2-SHA256', iterations: BACKUP_ITERATIONS * 100, salt: '00'.repeat(16) });
  await assert.rejects(restoreBackup(fake, 'password'), /Unsupported backup/);
});
test('validated restore can recover a missing key and replace both records in one write', async () => {
  const f = fixture(); await f.vault.setItem(FINANCE_KEY, JSON.stringify(finance)); f.forgetKey();
  await f.vault.replaceAll({ [FINANCE_KEY]: JSON.stringify({ ...finance, balance: 7 }), [PROFILE_KEY]: '{"completed":false}' });
  assert.equal(JSON.parse(await f.vault.getItem(FINANCE_KEY)).balance, 7); assert.equal(await f.vault.getItem(PROFILE_KEY), '{"completed":false}');
});
test('resume policy covers boundary and short background interruptions', () => {
  assert.equal(needsResumeAuthentication(null, 1000), false);
  assert.equal(needsResumeAuthentication(1000, 1000 + BACKGROUND_LOCK_MS - 1), false);
  assert.equal(needsResumeAuthentication(1000, 1000 + BACKGROUND_LOCK_MS), true);
});
