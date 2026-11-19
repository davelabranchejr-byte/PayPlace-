import { Asset } from 'expo-asset';

export async function sharePerViewVideo(source, id) {
  const asset = Asset.fromModule(source);
  const link = document.createElement('a');
  link.href = asset.uri;
  link.download = `PayPlacePerView-${id}.mp4`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  return { status: 'downloaded' };
}
