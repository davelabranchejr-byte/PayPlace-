import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FittedArtwork from './FittedArtwork';

export function RoomDestinations({ destinations }) {
  return destinations.map(({ label, caption, artwork, area, open }) => <Pressable key={label} accessibilityRole="button"
    accessibilityLabel={label} onPress={open} style={({ pressed }) => [s.target, area, pressed && s.pressed]}>
    {artwork && <View pointerEvents="none" style={s.artwork}>
      {artwork}
    </View>}
    {caption && <View pointerEvents="none" accessible={false} style={s.marker}>
      <Text style={s.caption} maxFontSizeMultiplier={1.3}>{caption}</Text>
    </View>}
  </Pressable>);
}

export default function InteractiveRoom({ source, destinations, artwork, children, testID, aspectRatio = 1 }) {
  return <FittedArtwork source={source} aspectRatio={aspectRatio} style={s.room} accessible={false} testID={testID}>
    {artwork}
    <RoomDestinations destinations={destinations} />
    {children}
  </FittedArtwork>;
}

const s = StyleSheet.create({
  room: { maxWidth: 560, alignSelf: 'center', borderRadius: 20, backgroundColor: '#F1D3A5' },
  target: { position: 'absolute', minWidth: 48, minHeight: 48, borderRadius: 12, justifyContent: 'flex-end', alignItems: 'center', padding: 2 },
  pressed: { backgroundColor: '#FFF5B952', borderWidth: 2, borderColor: '#FFF5B9' },
  artwork: { position: 'absolute', top: 0, alignSelf: 'center' },
  marker: { maxWidth: '100%', paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1, borderColor: '#3B2459',
    borderRadius: 10, backgroundColor: '#FFF0BD', shadowColor: '#211439', shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, elevation: 2 },
  caption: { color: '#24123C', fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
