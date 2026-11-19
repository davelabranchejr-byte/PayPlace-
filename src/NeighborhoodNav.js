import { artworkDimensions } from './artwork-ratio';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import IllustratedButton from './IllustratedButton';
import { MascotTouchable } from './MascotTouchable';
import FittedArtwork from './FittedArtwork';
import { Text } from './Privacy';
import { payplaceColors } from './brand';
import { NEIGHBORHOOD_DESTINATIONS, PRIMARY_DESTINATIONS, primaryDestination } from './neighborhood-destinations.mjs';

const atlas = require('../assets/characters/neighborhood-building-tabs.png');
const bills = require('../assets/characters/nav-post-office.png');
const debt = require('../assets/characters/nav-debt-climb.png');
const spa = require('../assets/characters/em-spa-building.png');
const atlasSize = artworkDimensions(atlas) || {width:1983,height:793};
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
  Home: require('../assets/characters/bottom-tab-home.jpg'),
  Finances: require('../assets/characters/bottom-tab-finances.jpg'),
  Budget: require('../assets/characters/bottom-tab-budget.jpg'),
  Bills: require('../assets/characters/bottom-tab-bills.jpg'),
};
const menuArtwork = {
  Home: require('../assets/characters/map-menu-home.jpg'),
  Finances: require('../assets/characters/map-menu-finances.jpg'),
  Budget: require('../assets/characters/map-menu-budget.jpg'),
  Bills: require('../assets/characters/billiam-canonical.png'),
};
const tabColors = { Home: payplaceColors.purple, Finances: payplaceColors.coral, Budget: payplaceColors.yellow, Bills: payplaceColors.turquoise };
export default function NeighborhoodNav({ current, switchTab, artworkFirst = false, compact = false }) {
  if (artworkFirst) return <View accessibilityRole="tablist" style={s.menu}>
    {PRIMARY_DESTINATIONS.map(place => <IllustratedButton key={place.id} artwork={menuArtwork[place.id]}
      label={place.label} accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`}
      selected={place.id === primaryDestination(current)} onPress={() => switchTab(place.id)}
      style={[s.menuTab, { borderColor: tabColors[place.id] }]} />)}
  </View>;

  return <View style={s.wrap}><View accessibilityRole="tablist" style={s.strip}>
    {PRIMARY_DESTINATIONS.map(place => compact ? <MascotTouchable key={place.id} artworkMode="integrated"
      accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`}
      accessibilityState={{selected:place.id === primaryDestination(current)}} onPress={() => switchTab(place.id)}
      style={[s.compactTab,{borderColor:tabColors[place.id]}]}>
      <FittedArtwork source={tabArtwork[place.id]} style={s.compactArtwork} accessible={false} />
      <Text style={s.compactLabel}>{place.id === primaryDestination(current) ? '✓ ' : ''}{place.label}</Text>
    </MascotTouchable> : <IllustratedButton key={place.id} artwork={tabArtwork[place.id]}
      label={place.label} accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`}
      selected={place.id === primaryDestination(current)} onPress={() => switchTab(place.id)}
      labelStyle={s.tabLabel} style={[s.tab, { borderColor: tabColors[place.id] }]} />)}
  </View></View>;
}
const s=StyleSheet.create({
  // Reserve footer space in normal flow; every destination shares the available
  // width instead of overflowing a horizontal rail or covering the page content.
  wrap:{alignSelf:'stretch',flexGrow:0,flexShrink:0,backgroundColor:'#FFFDF8',borderTopWidth:1,borderColor:'#E6DEEA',paddingBottom:4},
  strip:{flexDirection:'row',alignItems:'stretch',paddingHorizontal:6,paddingTop:4,gap:5},
  tab:{flex:1,flexBasis:0,minWidth:0,minHeight:0,borderRadius:16},
  tabLabel:{fontSize:14,lineHeight:19,paddingHorizontal:2,minHeight:48},
  compactTab:{flex:1,flexBasis:0,minWidth:0,minHeight:62,borderRadius:12,borderWidth:1,backgroundColor:payplaceColors.ink,alignItems:'center',justifyContent:'center',padding:3},
  compactArtwork:{width:32,height:32},
  compactLabel:{fontSize:11,lineHeight:14,fontWeight:'800',color:'#FFFFFF',textAlign:'center'},
  menu:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},
  menuTab:{flexBasis:'46%',flexGrow:1,minHeight:136,alignSelf:'flex-start'},
});
