import React from 'react';
import { Image, StyleSheet } from 'react-native';

const bankScene = require('../assets/characters/plaid-bank-neighborhood.png');
const bankIcon = require('../assets/characters/nav-plaid-bank.png');

export function BankBuildingMark() {
  return <Image source={bankIcon} style={s.icon} resizeMode="contain" accessible={false} />;
}

export default function PlaidBankScene() {
  return <Image source={bankScene} style={s.scene} resizeMode="contain"
    accessible accessibilityRole="image"
    accessibilityLabel="The Plaid Banking neighborhood bank. Annie watches over Westley, Bobbie, Tate and Chapo in plaid uniforms, with teal, yellow, purple and coral fictional money at the counter." />;
}

const s = StyleSheet.create({
  scene: { width: '100%', aspectRatio: 1672 / 940, borderRadius: 18, overflow: 'hidden', backgroundColor: '#D9F2DA' },
  icon: { width: '100%', height: 35 },
});
