import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils';
import { createVaultStorage } from './vault-storage.mjs';
const KEY_NAME = 'payplace.vault.key.v1';
const options = { keychainService: 'payplace.vault', keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
export default createVaultStorage({
  storage: AsyncStorage,
  randomBytes: Crypto.getRandomBytes,
  readKey: async () => {
    const value = await SecureStore.getItemAsync(KEY_NAME, options);
    if (value === null) return null;
    if (!/^[0-9a-f]{64}$/.test(value)) throw new Error('Invalid device encryption key.');
    return hexToBytes(value);
  },
  writeKey: key => SecureStore.setItemAsync(KEY_NAME, bytesToHex(key), options),
});
