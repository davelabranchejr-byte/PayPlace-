import { gcm } from '@noble/ciphers/aes';
import { bytesToHex, hexToBytes, utf8ToBytes, bytesToUtf8 } from '@noble/ciphers/utils';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

export const BACKUP_ITERATIONS = 600000;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const profileFields = ['name', 'email', 'goal', 'moneyFeeling', 'challenge', 'payFrequency', 'connectBank', 'notes', 'arrivalReason'];
const aad = utf8ToBytes('PayPlace encrypted vault v1');
const backupAAD = utf8ToBytes('PayPlace password backup v1');

function unpack(value, expectedKind) {
  if (typeof value !== 'string' || value.length > MAX_BACKUP_BYTES) throw new Error('File is too large or invalid.');
  const data = JSON.parse(value);
  if (data.version !== 1 || data.kind !== expectedKind || data.cipher !== 'AES-256-GCM' ||
      !/^[0-9a-f]{24}$/.test(data.nonce) || typeof data.ciphertext !== 'string' ||
      !/^[0-9a-f]+$/.test(data.ciphertext) || data.ciphertext.length % 2 || data.ciphertext.length < 32) {
    throw new Error('Unsupported or damaged file.');
  }
  return data;
}

export function seal(value, key, randomBytes, kind = 'vault', extra = {}) {
  const nonce = randomBytes(12);
  const ciphertext = gcm(key, nonce, kind === 'backup' ? backupAAD : aad).encrypt(utf8ToBytes(JSON.stringify(value)));
  return JSON.stringify({ ...extra, kind, version: 1, cipher: 'AES-256-GCM', nonce: bytesToHex(nonce), ciphertext: bytesToHex(ciphertext) });
}

export function open(value, key, kind = 'vault') {
  const data = unpack(value, kind);
  return JSON.parse(bytesToUtf8(gcm(key, hexToBytes(data.nonce), kind === 'backup' ? backupAAD : aad).decrypt(hexToBytes(data.ciphertext))));
}

export function validateBackup(data) {
  if (!data || data.schema !== 'payplace-manual-v1' || !data.finance || typeof data.finance !== 'object' || Array.isArray(data.finance)) throw new Error('This is not a PayPlace backup.');
  const f = data.finance;
  for (const field of ['bills', 'debts']) {
    if (!Array.isArray(f[field]) || f[field].length > 5000 || f[field].some(item => !item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.name !== 'string')) throw new Error('Invalid bill or debt data.');
  }
  const isNumber = value => (typeof value === 'number' && Number.isFinite(value)) || (typeof value === 'string' && /^[+-]?\d+(\.\d+)?$/.test(value) && Number.isFinite(Number(value)));
  const numeric = ['balance', 'daysUntilPayday', 'buffer', 'creditScore', 'overwhelmedCount', 'nextPaycheck', 'allowance', 'funMoneyLimit'];
  for (const field of numeric) {
    if (f[field] !== undefined && !isNumber(f[field])) throw new Error('Invalid budget values.');
  }
  for (const [items, fields] of [[f.bills, ['amount']], [f.debts, ['balance', 'apr', 'minimum']]]) {
    for (const item of items) for (const field of fields) if (item[field] !== undefined && !isNumber(item[field])) throw new Error('Invalid bill or debt values.');
  }
  const profile = {};
  for (const field of profileFields) if (typeof data.profile?.[field] === 'string') profile[field] = data.profile[field];
  // A portable file cannot establish verified identity, sessions, or consent.
  return { schema: data.schema, finance: f, profile, createdAt: data.createdAt };
}

export async function createBackup(finance, profile, password, randomBytes) {
  if (typeof password !== 'string' || password.length < 12) throw new Error('Use a backup password of at least 12 characters.');
  const data = validateBackup({ schema: 'payplace-manual-v1', finance, profile, createdAt: new Date().toISOString() });
  const salt = randomBytes(16);
  const key = await pbkdf2Async(sha256, utf8ToBytes(password), salt, { c: BACKUP_ITERATIONS, dkLen: 32, asyncTick: 10 });
  try {
    const result = seal(data, key, randomBytes, 'backup', { kdf: 'PBKDF2-SHA256', iterations: BACKUP_ITERATIONS, salt: bytesToHex(salt) });
    if (result.length > MAX_BACKUP_BYTES) throw new Error('Backup is too large.');
    return result;
  } finally { key.fill(0); }
}

export async function restoreBackup(value, password) {
  const data = unpack(value, 'backup');
  if (data.kdf !== 'PBKDF2-SHA256' || data.iterations !== BACKUP_ITERATIONS || !/^[0-9a-f]{32}$/.test(data.salt)) throw new Error('Unsupported backup format.');
  const key = await pbkdf2Async(sha256, utf8ToBytes(password), hexToBytes(data.salt), { c: BACKUP_ITERATIONS, dkLen: 32, asyncTick: 10 });
  try { return validateBackup(open(value, key, 'backup')); }
  finally { key.fill(0); }
}
