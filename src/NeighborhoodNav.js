import { artworkDimensions } from './artwork-ratio';
import React from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import IllustratedButton from './IllustratedButton';
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
export default function NeighborhoodNav({ current, switchTab, artworkFirst = false }) {
  const { width } = useWindowDimensions();
  const tabWidth = Math.max(104, Math.min(128, (width - 28) / 3));
  if (artworkFirst) return <View accessibilityRole="tablist" style={s.menu}>
    {PRIMARY_DESTINATIONS.map(place => <IllustratedButton key={place.id} artwork={menuArtwork[place.id]}
      label={place.label} accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`}
      selected={place.id === primaryDestination(current)} onPress={() => switchTab(place.id)}
      style={[s.menuTab, { borderColor: tabColors[place.id] }]} />)}
  </View>;

  return <View style={s.wrap}><ScrollView horizontal showsHorizontalScrollIndicator accessibilityRole="tablist" contentContainerStyle={s.strip}>
    {PRIMARY_DESTINATIONS.map(place => <IllustratedButton key={place.id} artwork={tabArtwork[place.id]}
      label={place.label} accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`}
      selected={place.id === primaryDestination(current)} onPress={() => switchTab(place.id)}
      labelStyle={s.tabLabel} style={[s.tab, { width: tabWidth }, { borderColor: tabColors[place.id] }]} />)}
  </ScrollView></View>;
}
const s=StyleSheet.create({
  wrap:{backgroundColor:'#FFFDF8',borderTopWidth:1,borderColor:'#E6DEEA',paddingBottom:4},
  strip:{flexDirection:'row',paddingHorizontal:6,paddingTop:4,gap:5},
  tab:{flexGrow:0,flexShrink:0,minHeight:84,minWidth:0,borderRadius:16},
  tabLabel:{fontSize:14,lineHeight:18,paddingHorizontal:3,minHeight:42},
  wrapStrip:{flexWrap:'wrap'},wrapTab:{flexBasis:'45%',minHeight:76},
  menu:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:8},
  menuTab:{flexBasis:'46%',flexGrow:1,minHeight:136,alignSelf:'flex-start'},
});
