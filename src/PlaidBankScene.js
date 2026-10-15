import React from 'react';
import { StyleSheet } from 'react-native';
import FittedArtwork from './FittedArtwork';

const bankScene = require('../assets/characters/plaid-bank-neighborhood.png');
const bankIcon = require('../assets/characters/nav-plaid-bank.png');

export function BankBuildingMark() {
  return <FittedArtwork source={bankIcon} style={s.icon} testID="bank-tab-artwork" accessible={false} />;
}

export default function PlaidBankScene() {
  return <FittedArtwork source={bankScene} style={s.scene} aspectRatio={1672/940} testID="bank-scene-artwork"
    accessibilityLabel="The Plaid Banking neighborhood bank. Annie watches over Westley, Bobbie, Tate and Chapo in plaid uniforms, with teal, yellow, purple and coral fictional money at the counter." />;
}

const s = StyleSheet.create({
  scene: { borderRadius: 18, backgroundColor: '#D9F2DA' },
  icon: { width: '100%', height: 35 },
});
