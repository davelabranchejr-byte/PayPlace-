import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CharacterArtwork from './CharacterArtwork';
import { NEIGHBORHOOD_DESTINATIONS } from './neighborhood-destinations.mjs';

const atlas = require('../assets/characters/neighborhood-building-tabs.png');
const bills = require('../assets/characters/nav-post-office.png');
const debt = require('../assets/characters/nav-debt-climb.png');
const atlasSize = Image.resolveAssetSource(atlas);
const cellWidth = atlasSize.width / 5;
const cellHeight = atlasSize.height / 2;
export function buildingArtwork(id) {
  const place = NEIGHBORHOOD_DESTINATIONS.find(item => item.id === id);
  if (id === 'Bills') return bills;
  if (id === 'Debt') return debt;
  if (!place || place.tile === undefined) return atlas;
  return { source: atlas, width: atlasSize.width, height: atlasSize.height,
    crop: [(place.tile % 5) * cellWidth, Math.floor(place.tile / 5) * cellHeight, cellWidth, cellHeight], label: place.label };
}

export default function NeighborhoodNav({ current, switchTab }) {
  const [hidden, setHidden] = useState(false);
  const scroll = useRef(null);
  const [viewport, setViewport] = useState(0);
  const positions = useRef({});
  useEffect(() => {
    const item = positions.current[current];
    if (!hidden && item && viewport) scroll.current?.scrollTo({ x: Math.max(0, item.x - (viewport - item.width) / 2), animated: false });
  }, [current, hidden, viewport]);
  if (hidden) return <View style={s.collapsed}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show neighborhood tabs" onPress={() => setHidden(false)} style={s.toggle}>
      <Text style={s.toggleText}>Show neighborhood tabs ↑</Text>
    </TouchableOpacity>
  </View>;
  return <View style={s.wrap}>
    <View style={s.heading}>
      <Text style={s.hint}>Explore the neighborhood · swipe for more</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Hide neighborhood tabs" onPress={() => setHidden(true)} style={s.hide}><Text style={s.toggleText}>Hide ↓</Text></TouchableOpacity>
    </View>
    <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} onLayout={({ nativeEvent: { layout } }) => setViewport(layout.width)} contentContainerStyle={s.strip}>
      {NEIGHBORHOOD_DESTINATIONS.map(place => {
        const selected = place.id === current;
        return <TouchableOpacity key={place.id} accessibilityRole="tab" accessibilityLabel={`Open ${place.label}`} accessibilityState={{ selected }}
          onLayout={({ nativeEvent: { layout } }) => { positions.current[place.id] = layout; }} onPress={() => switchTab(place.id)} activeOpacity={0.85}
          style={[s.tab, selected && { backgroundColor: place.color + '15', borderColor: place.color, shadowColor: place.color, shadowOpacity: 0.3, shadowRadius: 7, elevation: 3 }]}>
          <View accessible={false} importantForAccessibility="no-hide-descendants"><CharacterArtwork source={buildingArtwork(place.id)} style={s.artwork} resizeMode="contain" accessible={false} /></View>
          <Text style={[s.label, { color: selected ? place.color : '#34465E' }]}>{place.label}</Text>
          {selected && <View style={[s.selectedMark, { backgroundColor: place.color }]} />}
        </TouchableOpacity>;
      })}
    </ScrollView>
  </View>;
}

const s = StyleSheet.create({
  wrap: { backgroundColor: '#FFFDF8', borderTopWidth: 1, borderColor: '#E6DEEA', paddingBottom: 4 }, heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 14, gap: 8 },
  hint: { flex: 1, color: '#556277', fontSize: 11 }, hide: { minHeight: 44, minWidth: 60, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, toggleText: { color: '#6550AF', fontWeight: '800', fontSize: 12 },
  strip: { gap: 8, paddingHorizontal: 12, paddingBottom: 6 }, tab: { width: 96, borderRadius: 16, borderWidth: 2, borderColor: 'transparent', padding: 5, alignItems: 'center', backgroundColor: '#FFFFFF' },
  artwork: { width: 78, height: 58 }, label: { fontSize: 12, fontWeight: '800', textAlign: 'center', paddingTop: 3, minHeight: 33, lineHeight: 16 }, selectedMark: { width: 22, height: 3, borderRadius: 2, marginTop: 3 },
  collapsed: { backgroundColor: '#FFFDF8', alignItems: 'center', borderTopWidth: 1, borderColor: '#E6DEEA' }, toggle: { minHeight: 48, justifyContent: 'center', padding: 12 },
});
