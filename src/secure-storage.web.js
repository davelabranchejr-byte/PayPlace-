import AsyncStorage from '@react-native-async-storage/async-storage';
import { createVaultStorage } from './vault-storage.mjs';

function browserKey(operation, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('payplace-vault', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('keys');
    request.onerror = () => reject(new Error('Browser protected storage is unavailable.'));
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('keys', operation === 'read' ? 'readonly' : 'readwrite');
      const result = operation === 'read' ? tx.objectStore('keys').get('vault-v1') : tx.objectStore('keys').put(value, 'vault-v1');
      tx.oncomplete = () => { db.close(); resolve(result.result || null); };
      tx.onerror = () => { db.close(); reject(new Error('Browser storage failed.')); };
      tx.onabort = tx.onerror;
    };
  });
}
// Encryption at rest; same-origin scripts can still access this key. No native app lock on web.
export default createVaultStorage({
  storage: AsyncStorage,
  randomBytes: n => crypto.getRandomValues(new Uint8Array(n)),
  readKey: () => browserKey('read'),
  writeKey: key => browserKey('write', key),
});
