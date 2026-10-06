import { seal, open } from './security-crypto.mjs';
export const FINANCE_KEY = '@payplace_finance_v5_manual_mode';
export const PROFILE_KEY = '@payplace_onboarding_v3_annie_first';
export const VAULT_KEY = '@payplace_encrypted_vault_v1';
const keys = [FINANCE_KEY, PROFILE_KEY];

// One ciphertext holds both records, so restores are atomic. Serialize every read/write.
export function createVaultStorage({ storage, readKey, writeKey, randomBytes }) {
  let queue = Promise.resolve();
  const run = fn => { const next = queue.then(fn); queue = next.catch(() => {}); return next; };
  async function load() {
    const ciphertext = await storage.getItem(VAULT_KEY);
    let key = await readKey();
    if (ciphertext && !key) throw new Error('The device encryption key is missing. Restore an encrypted backup.');
    if (!key) { key = randomBytes(32); await writeKey(key); }
    let records;
    if (ciphertext) {
      records = open(ciphertext, key);
      if (!records || typeof records !== 'object' || Array.isArray(records) || keys.some(k => records[k] !== undefined && typeof records[k] !== 'string')) throw new Error('Saved data is damaged.');
      for (const k of keys) if (records[k] !== undefined) JSON.parse(records[k]);
    } else {
      records = {};
      for (const k of keys) {
        const legacy = await storage.getItem(k);
        if (legacy !== null) { JSON.parse(legacy); records[k] = legacy; }
      }
      await save(records, key);
    }
    // Remove legacy plaintext only after the encrypted record exists and was authenticated.
    for (const k of keys) await storage.removeItem(k);
    return { records, key };
  }
  async function save(records, key) {
    const encoded = seal(records, key, randomBytes);
    await storage.setItem(VAULT_KEY, encoded);
    const readback = await storage.getItem(VAULT_KEY);
    if (readback !== encoded) throw new Error('Could not verify saved data.');
    open(readback, key);
  }
  return {
    getItem: k => run(async () => { const { records } = await load(); return records[k] ?? null; }),
    setItem: (k, value) => run(async () => {
      if (!keys.includes(k) || typeof value !== 'string') throw new Error('Invalid saved record.');
      const { records, key } = await load(); records[k] = value; await save(records, key);
    }),
    removeItem: k => run(async () => { const { records, key } = await load(); delete records[k]; await save(records, key); }),
    setItems: values => run(async () => {
      if (Object.keys(values).some(k => !keys.includes(k) || typeof values[k] !== 'string')) throw new Error('Invalid saved records.');
      const { records, key } = await load(); await save({ ...records, ...values }, key);
    }),
    // Recovery can replace an unreadable vault only after the UI has confirmed replacement.
    replaceAll: values => run(async () => {
      if (Object.keys(values).some(k => !keys.includes(k) || typeof values[k] !== 'string')) throw new Error('Invalid saved records.');
      let key = await readKey();
      if (!key) { key = randomBytes(32); await writeKey(key); }
      await save(values, key);
      for (const k of keys) await storage.removeItem(k);
    }),
  };
}
