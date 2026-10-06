import { MAX_BACKUP_BYTES } from './security-crypto.mjs';
export async function saveBackupFile(text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a'); a.href = url; a.download = 'PayPlace-' + Date.now() + '.payplace'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function pickBackupFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.payplace';
    input.oncancel = () => resolve(null);
    input.onchange = async () => {
      try {
        const file = input.files[0];
        if (!file) return resolve(null);
        if (file.size > MAX_BACKUP_BYTES) throw new Error('Choose a PayPlace backup smaller than 2 MB.');
        resolve(await file.text());
      } catch (error) { reject(error); }
    };
    input.click();
  });
}
