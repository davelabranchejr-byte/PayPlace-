import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import { NEIGHBORHOOD_DESTINATIONS, PRIMARY_DESTINATIONS, primaryDestination } from './neighborhood-destinations.mjs';

const atlas = require('../assets/characters/neighborhood-building-tabs.png');
const bills = require('../assets/characters/nav-post-office.png');
const debt = require('../assets/characters/nav-debt-climb.png');
const spa = require('../assets/characters/em-spa-building.png');
const atlasSize = Image.resolveAssetSource(atlas);
const cellWidth = atlasSize.width / 5;
const cellHeight = atlasSize.height / 2;
export function buildingArtwork(id) {
  if (id === 'Neighborhood') id = 'Home';
  const place = NEIGHBORHOOD_DESTINATIONS.find(item => item.id === id);
  if (id === 'Premium') return require('../assets/characters/nav-plaid-bank.png');
  if (id === 'Billiam') return require('../assets/characters/billiam-mailbox.png');
  if (id === 'Bills') return bills;
  if (id === 'Debt') return debt;
  if (id === 'Spa') return spa;
  if (!place || place.tile === undefined) return atlas;
  return { source: atlas, width: atlasSize.width, height: atlasSize.height,
    crop: [(place.tile % 5) * cellWidth, Math.floor(place.tile / 5) * cellHeight, cellWidth, cellHeight], label: place.label };
}

const tabArtwork = {
  Home: require('../assets/characters/feature-first-win.png'),
  Budget: require('../assets/characters/header-budget-daddy-chapo.png'),
  Bills: require('../assets/characters/header-bills-billiam-westley.png'),
  Neighborhood: require('../assets/characters/facebook-moving-day.jpg'),
};
export default function NeighborhoodNav({ current, switchTab }) {
  return <View style={s.wrap}><View style={s.strip}>
    {PRIMARY_DESTINATIONS.map(place => {
      const selected = place.id === primaryDestination(current);
      return <TouchableOpacity key={place.id} artworkMode="integrated" accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`} accessibilityState={{selected}}
        onPress={() => switchTab(place.id)} style={[s.tab, selected && {backgroundColor:place.color+'15',borderColor:place.color}]}>
        <CharacterArtwork source={tabArtwork[place.id]} style={s.artwork} resizeMode="contain" accessible={false}/>
        <Text style={[s.label,{color:selected?place.color:'#34465E'}]}>{place.label}</Text>
        {selected && <View style={[s.selectedMark,{backgroundColor:place.color}]} />}
      </TouchableOpacity>;
    })}
  </View></View>;
}
const s=StyleSheet.create({
  wrap:{backgroundColor:'#FFFDF8',borderTopWidth:1,borderColor:'#E6DEEA',paddingBottom:4},
  strip:{flexDirection:'row',paddingHorizontal:4,gap:3},tab:{flex:1,minHeight:76,minWidth:0,borderRadius:16,borderWidth:2,borderColor:'transparent',padding:5,alignItems:'center',justifyContent:'center'},
  artwork:{width:46,height:32},label:{fontSize:12,fontWeight:'800',textAlign:'center',paddingTop:3,lineHeight:16},selectedMark:{width:22,height:3,borderRadius:2,marginTop:3},
});
