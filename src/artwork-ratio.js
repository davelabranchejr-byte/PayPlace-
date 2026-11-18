import { Image } from 'react-native';

export function artworkDimensions(source) {
  return source && (Image.resolveAssetSource?.(source) || source);
}

// Atlas cells are intentional source selections; ordinary scenes use the whole asset.
export function artworkRatio(source, fallback = 1) {
  if (source?.crop) return source.crop[2] / source.crop[3];
  const asset = artworkDimensions(source);
  return asset?.width > 0 && asset?.height > 0 ? asset.width / asset.height : fallback;
}
