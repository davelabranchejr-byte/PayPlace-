// Device adapters are injected so cancellation, denial and cleanup are testable.
export async function readBillPhoto(source, device) {
  const owned = new Set();
  const remember = uri => { if (uri && device.cacheDirectory && uri.startsWith(device.cacheDirectory)) owned.add(uri); };
  try {
    if (source === 'camera' && !(await device.cameraPermission()).granted) {
      throw new Error('Camera access is off. Enable it in Settings, or choose an existing photo.');
    }
    const selected = await device.pick(source);
    if (selected.canceled || !selected.assets?.[0]) return null;
    const asset = selected.assets[0];
    remember(asset.uri);
    const normalized = await device.normalize(asset);
    remember(normalized.uri);
    const result = await device.recognize(normalized.uri);
    if (!result?.text?.trim()) throw new Error('Billiam could not read that photo. Try a clear, well-lit photo of the whole bill.');
    return result.text;
  } finally {
    await Promise.all([...owned].map(uri => device.remove(uri).catch(() => {})));
  }
}
