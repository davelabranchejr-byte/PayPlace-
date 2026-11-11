import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import FittedArtwork from './FittedArtwork';
import PayPlaceBadge from './PayPlaceBadge';

const bankScene = require('../assets/characters/plaid-bank-neighborhood.png');
const bankIcon = require('../assets/characters/nav-plaid-bank-blank-sign.png');

export function BankBuildingMark({ style }) {
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const size = Math.min(frame.width, frame.height);
  return <FittedArtwork source={bankIcon} style={[s.icon, style]} testID="bank-tab-artwork" accessible={false}
    onLayout={({ nativeEvent: { layout: { width, height } } }) => {
      setFrame(current => current.width === width && current.height === height ? current : { width, height });
    }}>
    {size > 0 && <PayPlaceBadge size={size * 0.16}
      left={(frame.width - size) / 2 + size * 0.426}
      top={(frame.height - size) / 2 + size * 0.23} />}
  </FittedArtwork>;
}

export default function PlaidBankScene() {
  return <FittedArtwork source={bankScene} style={s.scene} aspectRatio={1672/940} testID="bank-scene-artwork"
    accessibilityLabel="The Plaid Banking neighborhood bank. Annie watches over Westley, Bobbie, Tate and Chapo in plaid uniforms, with teal, yellow, purple and coral fictional money at the counter." />;
}

const s = StyleSheet.create({
  scene: { borderRadius: 18, backgroundColor: '#D9F2DA' },
  icon: { width: '100%', height: 35 },
});
