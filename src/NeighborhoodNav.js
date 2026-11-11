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

// Navigation depicts its destination; no reused money-tool or Facebook scenes.
export const tabArtwork = {
  Home: buildingArtwork('Home'),
  Budget: buildingArtwork('Budget'),
  Neighborhood: require('../assets/characters/nav-neighborhood-homes.png'),
};
export default function NeighborhoodNav({ current, switchTab }) {
  const { width, fontScale } = useWindowDimensions();
  const wrap = width < 350 || fontScale > 1.2;
  return <View style={s.wrap}><View style={[s.strip, wrap && s.wrapStrip]}>
    {PRIMARY_DESTINATIONS.map(place => {
      const selected = place.id === primaryDestination(current);
      return <TouchableOpacity key={place.id} artworkMode="integrated" accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`} accessibilityState={{selected}}
        onPress={() => switchTab(place.id)} style={[s.tab, {flex:place.id==='Neighborhood'?1.5:place.id==='Bills'?1.2:0.9,backgroundColor:place.id==='Home'?'#ECD5FF':place.id==='Budget'?'#FFF2B6':place.id==='Bills'?'#D5FFF4':'#FFF7D5',borderColor:selected?place.color:'#D9D5B6'}, selected && {borderColor:place.color}, wrap && s.wrapTab]}>
        {place.id === 'Bills' ? <BankBuildingMark style={[s.artwork, wrap && s.compactArt]} /> :
          <CharacterArtwork source={tabArtwork[place.id]} style={[s.artwork, wrap && s.compactArt]} resizeMode="contain" accessible={false} />}
        <Text numberOfLines={wrap ? undefined : place.id==='Bills'?2:1} adjustsFontSizeToFit={!wrap} minimumFontScale={0.75} style={[s.label,{color:selected?place.color:'#34465E'}]}>{place.id==='Bills' && !wrap ? 'Bills &\nBanking' : place.label}</Text>
        {selected && <View style={[s.selectedMark,{backgroundColor:place.color}]} />}
      </TouchableOpacity>;
    })}
  </View></View>;
}
const s=StyleSheet.create({
  wrap:{backgroundColor:'#FFFDF8',borderTopWidth:1,borderColor:'#E6DEEA',paddingBottom:4},
  strip:{flexDirection:'row',paddingHorizontal:6,paddingTop:6,gap:5},tab:{flex:1,minHeight:106,minWidth:0,borderRadius:20,borderWidth:2,borderColor:'transparent',paddingVertical:6,paddingHorizontal:2,alignItems:'center',justifyContent:'center'},
  wrapStrip:{flexWrap:'wrap'},wrapTab:{flexBasis:'45%',minHeight:58,paddingVertical:3},compactArt:{height:28},
  artwork:{width:'100%',maxWidth:84,height:60},label:{width:'100%',fontSize:13,fontWeight:'800',textAlign:'center',paddingTop:3,lineHeight:18},selectedMark:{width:22,height:3,borderRadius:2,marginTop:3},
});
