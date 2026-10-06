import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { MAX_BACKUP_BYTES } from './security-crypto.mjs';
export async function saveBackupFile(text) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('File sharing is unavailable on this device.');
  const uri = FileSystem.cacheDirectory + 'PayPlace-' + Date.now() + '.payplace';
  try {
    await FileSystem.writeAsStringAsync(uri, text);
    await Sharing.shareAsync(uri, { mimeType: 'application/octet-stream', dialogTitle: 'Save your encrypted PayPlace backup' });
  } finally { await FileSystem.deleteAsync(uri, { idempotent: true }); }
}
export async function pickBackupFile() {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const file = result.assets[0];
  try {
    const info = await FileSystem.getInfoAsync(file.uri);
    if (!info.exists || info.size > MAX_BACKUP_BYTES) throw new Error('Choose a PayPlace backup smaller than 2 MB.');
    return await FileSystem.readAsStringAsync(file.uri);
  } finally { await FileSystem.deleteAsync(file.uri, { idempotent: true }); }
}
