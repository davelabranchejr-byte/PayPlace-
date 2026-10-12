import * as SecureStore from 'expo-secure-store';
const NAME = 'payplace.bank.session.v1';
const options = { keychainService: 'payplace.bank', keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
export const bankSessionStore = {
  async read() { const raw = await SecureStore.getItemAsync(NAME, options); if (!raw) return null; try { return JSON.parse(raw); } catch { await bankSessionStore.clear(); return null; } },
  async write(token, expiresAt) { await SecureStore.setItemAsync(NAME, JSON.stringify({ token, expiresAt }), options); },
  async clear() { await SecureStore.deleteItemAsync(NAME, options); },
};
