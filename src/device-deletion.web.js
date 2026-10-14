export async function clearDeviceRecords(storage) {
  try { window.sessionStorage.removeItem('payplace-bank-session'); } catch { throw new Error('Browser storage could not be cleared.'); }
  await storage.replaceAll({});
}
