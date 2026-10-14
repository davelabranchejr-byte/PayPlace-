import test from 'node:test';
import assert from 'node:assert/strict';
import { completeDataDeletion } from '../src/privacy-deletion.mjs';
test('failed or unconfirmed remote deletion preserves the local plan', async () => {
  let cleared = 0;
  const common = { challenge: { challengeId: 'privacy-delete-test', expiresAt: Date.now() + 10000 }, code: 'ABCDEFGH', deleteDevice: async () => cleared++ };
  await assert.rejects(completeDataDeletion({ ...common, api: async () => { throw new Error('Offline'); } }), /Offline/);
  await assert.rejects(completeDataDeletion({ ...common, api: async () => ({ deleted: false }) }), /not confirmed/);
  assert.equal(cleared, 0);
});
test('confirmed deletion runs remote cleanup before device cleanup and can retry a device failure without a second server deletion', async () => {
  const order = [];
  const api = async (path, input) => { order.push('remote'); assert.equal(input.confirm, true); return { deleted: true }; };
  const challenge = { challengeId: 'privacy-delete-test', expiresAt: Date.now() + 10000 };
  await assert.rejects(completeDataDeletion({ api, challenge, code: 'ABCDEFGH', deleteDevice: async () => { order.push('local'); throw new Error('Disk'); } }), error => error.serverDeleted === true);
  await completeDataDeletion({ api, serverDeleted: true, deleteDevice: async () => order.push('retry-local') });
  assert.deepEqual(order, ['remote', 'local', 'retry-local']);
});
test('expired challenges cannot delete data', async () => {
  await assert.rejects(completeDataDeletion({ challenge: { expiresAt: 1 }, api: () => assert.fail(), deleteDevice: () => assert.fail() }), /expired/);
});
