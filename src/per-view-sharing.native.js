import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

export async function sharePerViewVideo(source, id) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable on this device.');
  const asset = await Asset.fromModule(source).downloadAsync();
  if (!asset.localUri || !FileSystem.cacheDirectory) throw new Error('The video could not be prepared.');
  const uri = `${FileSystem.cacheDirectory}PayPlacePerView-${id}.mp4`;
  try {
    await FileSystem.copyAsync({ from: asset.localUri, to: uri });
    await Sharing.shareAsync(uri, { mimeType: 'video/mp4', UTI: 'public.mpeg-4', dialogTitle: 'Share PayPlacePerView' });
    // The share sheet also resolves after cancellation. It does not prove a post was published.
    return { status: 'returned' };
  } finally { await FileSystem.deleteAsync(uri, { idempotent: true }); }
}
