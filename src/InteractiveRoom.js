import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FittedArtwork from './FittedArtwork';

export function RoomDestinations({ destinations }) {
  return destinations.map(({ label, area, open }) => <Pressable key={label} accessibilityRole="button"
    accessibilityLabel={label} onPress={open} style={({ pressed }) => [s.target, area, pressed && s.pressed]}>
    <View pointerEvents="none" accessible={false} style={s.marker} />
  </Pressable>);
}

export default function InteractiveRoom({ source, destinations, children, testID }) {
  return <FittedArtwork source={source} aspectRatio={1} style={s.room} accessible={false} testID={testID}>
    <RoomDestinations destinations={destinations} />
    {children}
  </FittedArtwork>;
}

const s = StyleSheet.create({
  room: { maxWidth: 560, alignSelf: 'center', borderRadius: 20, backgroundColor: '#F1D3A5' },
  target: { position: 'absolute', minWidth: 48, minHeight: 48, borderRadius: 12, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 4 },
  pressed: { backgroundColor: '#FFF5B952', borderWidth: 2, borderColor: '#FFF5B9' },
  marker: { width: 13, height: 13, borderWidth: 2, borderColor: '#3B2459', borderRadius: 7, backgroundColor: '#FFF0A7' },
});
