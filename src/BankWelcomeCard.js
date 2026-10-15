import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from './Privacy';

import PlaidBankScene from './PlaidBankScene';
import FittedArtwork from './FittedArtwork';
const logo = require('../assets/branding/payplace-locked-logo.jpeg');
const daddyAndTate = require('../assets/characters/plaid-bank-daddy-tate.png');
export default function BankWelcomeCard({ onDemo, onBanking, demoLabel = 'Try Bobbie’s banking demo' }) {
  return <View style={s.card} testID="banking-welcome-card">
    <View style={s.heading}>
      <View style={s.headingCopy}>
        <View style={s.brandRow}><Image source={logo} style={s.logo} resizeMode="contain" accessible={false}/><Text style={s.kicker}>THE NEIGHBORHOOD BANK</Text></View>
        <Text accessibilityRole="header" style={s.title}>Plaid Banking</Text>
      </View>
      <FittedArtwork source={daddyAndTate} style={s.cornerArt} aspectRatio={1} testID="bank-corner-artwork"
        accessibilityLabel="Daddy deposits colorful fictional money at Plaid Banking while Tate hands him a lollipop." />
    </View>
    <PlaidBankScene/>
    <Text style={s.body}>Bobbie’s demo is open. Try round-ups, savings, Money Watch and credit with fictional money.</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={demoLabel} onPress={onDemo} style={s.button}><Text style={s.buttonText}>Try Bobbie’s banking demo →</Text></TouchableOpacity>
    {onBanking && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Explore Plaid Banking" onPress={onBanking} style={s.secondary}><Text style={s.link}>Accounts & banking tools →</Text></TouchableOpacity>}
    <Text style={s.note}>Demo only · no real bank connection or money movement.</Text>
  </View>;
}
const s = StyleSheet.create({
  card:{padding:16,borderRadius:24,backgroundColor:'#E6FCF7',borderWidth:2,borderColor:'#08796E',gap:10,marginBottom:16},
  heading:{flexDirection:'row',alignItems:'center',gap:8},headingCopy:{flex:1,minWidth:0},brandRow:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:4},cornerArt:{width:'30%',maxWidth:110,flexShrink:0},logo:{width:34,height:38,borderRadius:7},
  kicker:{flex:1,color:'#08796E',fontSize:10,fontWeight:'900',letterSpacing:0.6},title:{fontSize:26,lineHeight:32,fontWeight:'900',color:'#173C50'},
  art:{width:'100%',height:150},body:{fontSize:15,lineHeight:21,color:'#34465E'},
  button:{minHeight:52,padding:14,borderRadius:14,backgroundColor:'#6550AF',justifyContent:'center'},buttonText:{fontSize:17,lineHeight:23,fontWeight:'900',color:'#FFF',textAlign:'center'},
  secondary:{minHeight:44,justifyContent:'center',alignItems:'center',padding:8},link:{fontSize:15,fontWeight:'800',color:'#08796E'},note:{fontSize:12,lineHeight:17,color:'#475569'},
});
