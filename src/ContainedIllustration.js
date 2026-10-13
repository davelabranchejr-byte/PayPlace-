import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Keep native asset dimensions from overriding the card's layout bounds.
export default function ContainedIllustration({ source, aspectRatio, style, children, ...imageProps }) {
  const asset = Image.resolveAssetSource(source);
  const ratio = aspectRatio || (asset?.width && asset?.height ? asset.width / asset.height : 1);
  return <View style={[s.frame, { aspectRatio: ratio }, style]}>
    <Image {...imageProps} source={source} resizeMode="contain" style={s.image} />
    {children}
  </View>;
}

const s = StyleSheet.create({
  frame: { width: '100%', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
