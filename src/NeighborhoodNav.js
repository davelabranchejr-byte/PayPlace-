import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React from 'react';
import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import { BankBuildingMark } from './PlaidBankScene';
import { NEIGHBORHOOD_DESTINATIONS, PRIMARY_DESTINATIONS, primaryDestination } from './neighborhood-destinations.mjs';

const atlas = require('../assets/characters/neighborhood-building-tabs.png');
const bills = require('../assets/characters/nav-post-office.png');
const debt = require('../assets/characters/nav-debt-climb.png');
const spa = require('../assets/characters/em-spa-building.png');
const atlasSize = Image.resolveAssetSource?.(atlas) || {width:1983,height:793};
const cellWidth = atlasSize.width / 5;
const cellHeight = atlasSize.height / 2;
export const spaPorchArtwork = {
  source: atlas, width: atlasSize.width, height: atlasSize.height,
  crop: [cellWidth, 0, cellWidth, cellHeight], label: 'Em’s spa treehouse with a paw sign and a bubble bath',
};

export function buildingArtwork(id) {
  if (id === 'Neighborhood') id = 'Home';
  const place = NEIGHBORHOOD_DESTINATIONS.find(item => item.id === id);
  if (id === 'Billiam') return require('../assets/characters/billiam-mailbox.png');
  if (id === 'Bills') return bills;
  if (id === 'Debt') return debt;
  if (id === 'Spa') return spa;
  if (!place || place.tile === undefined) return atlas;
  return { source: atlas, width: atlasSize.width, height: atlasSize.height,
    crop: [(place.tile % 5) * cellWidth, Math.floor(place.tile / 5) * cellHeight, cellWidth, cellHeight], label: place.label };
}

const tabArtwork = {
  Home: require('../assets/characters/nav-neighborhood-homes.png'),
  Finances: require('../assets/characters/neighborhood-navigation-mascots.png'),
  Budget: buildingArtwork('Budget'),
};
export default function NeighborhoodNav({ current, switchTab, artworkFirst = false }) {
  const { width, fontScale } = useWindowDimensions();
  const wrap = width < 340 || fontScale > 1.2;
  const artworkStyle = [s.artwork, wrap && s.compactArt, artworkFirst && s.largeArt];
  return <View style={artworkFirst ? s.menu : s.wrap}><View accessibilityRole="tablist" style={[s.strip, (wrap || artworkFirst) && s.wrapStrip, artworkFirst && s.menuStrip]}>
    {PRIMARY_DESTINATIONS.map(place => {
      const selected = place.id === primaryDestination(current);
      return <TouchableOpacity key={place.id} artworkMode="integrated" accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`} accessibilityState={{selected}}
        onPress={() => switchTab(place.id)} style={[s.tab, {flex:place.id==='Finances'?1.25:place.id==='Bills'?1.2:0.9,backgroundColor:place.id==='Home'?'#ECD5FF':place.id==='Budget'?'#FFF2B6':place.id==='Bills'?'#D5FFF4':'#FFF7D5',borderColor:selected?place.color:'#D9D5B6'}, selected && {borderColor:place.color}, wrap && s.wrapTab, artworkFirst && s.menuTab]}>
        {place.id === 'Bills' ? <BankBuildingMark style={artworkStyle} /> :
          <CharacterArtwork source={tabArtwork[place.id]} style={artworkStyle}
            resizeMode={!artworkFirst && !wrap && place.id !== 'Finances' ? 'cover' : 'contain'} accessible={false} />}
        <Text adjustsFontSizeToFit={!wrap && !artworkFirst} minimumFontScale={0.85} style={[s.label, artworkFirst && s.menuLabel, {color:selected?place.color:'#34465E'}]}>{place.id==='Bills' && !wrap && !artworkFirst ? 'Bills &\nBanking' : place.label}</Text>
        <View accessible={false} style={[s.selectedMark,{backgroundColor:selected?place.color:'transparent'}]} />
      </TouchableOpacity>;
    })}
  </View></View>;
}
const s=StyleSheet.create({
  wrap:{backgroundColor:'#FFFDF8',borderTopWidth:1,borderColor:'#E6DEEA',paddingBottom:4},
  strip:{flexDirection:'row',paddingHorizontal:6,paddingTop:4,gap:5},tab:{flex:1,minHeight:74,minWidth:0,borderRadius:20,borderWidth:2,borderColor:'transparent',paddingBottom:4,alignItems:'center',justifyContent:'flex-start',overflow:'hidden'},
  wrapStrip:{flexWrap:'wrap'},wrapTab:{flexBasis:'45%',minHeight:58},compactArt:{height:32},
  menu:{marginBottom:8},menuStrip:{paddingHorizontal:0,gap:8},
  menuTab:{flexBasis:'46%',flexGrow:1},largeArt:{height:96},
  menuLabel:{fontSize:16,lineHeight:21,paddingHorizontal:5,paddingVertical:4},
  artwork:{width:'100%',height:46},label:{width:'100%',fontSize:13,fontWeight:'800',textAlign:'center',paddingHorizontal:2,paddingTop:1,lineHeight:17,flexGrow:1},selectedMark:{width:22,height:3,borderRadius:2,marginTop:3},
});
