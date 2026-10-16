import * as SecureStore from 'expo-secure-store';
const NAME = 'payplace.owner.inbox.session.v1';
const options = { keychainService: 'payplace.owner.inbox', keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
export const ownerSessionStore = {
  async read() { const value = await SecureStore.getItemAsync(NAME, options); if (!value) return null; try { return JSON.parse(value); } catch { await ownerSessionStore.clear(); return null; } },
  async write(token, expiresAt) { await SecureStore.setItemAsync(NAME, JSON.stringify({ token, expiresAt }), options); },
  async clear() { await SecureStore.deleteItemAsync(NAME, options); },
};
