import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { payplaceArtworkMark, payplaceColors } from './brand';

export default function ArtworkBrandMark({ size = 21, style }) {
  const height = Math.round(size * 682 / 613);
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants"
    style={[s.badge, { width: size + 2, height: height + 2 }, style]}>
    <Image testID="payplace-artwork-mark" source={payplaceArtworkMark} resizeMode="contain" accessible={false}
      style={{ width: size, height }} />
  </View>;
}

const s = StyleSheet.create({
  badge: { position: 'absolute', top: 6, right: 6, borderRadius: 5, borderWidth: 1,
    borderColor: '#FFFFFF', backgroundColor: payplaceColors.ink, overflow: 'hidden' },
});
