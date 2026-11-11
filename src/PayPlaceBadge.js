import React from 'react';
import { Image, View } from 'react-native';
import { payplaceLogo } from './brand';

// Crop the outer white margin of the master for signs and clothing patches.
export default function PayPlaceBadge({ size, left, top }) {
  return <View pointerEvents="none"
    style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: size * 0.27, overflow: 'hidden' }}>
    <Image source={payplaceLogo} resizeMode="contain" accessible={false} importantForAccessibility="no"
      style={{ position: 'absolute', width: '150%', height: '150%', left: '-25%', top: '-22%' }} />
  </View>;
}
