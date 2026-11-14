import React from 'react';
import { StyleSheet } from 'react-native';
import { MascotTouchable } from './MascotTouchable';
import FittedArtwork from './FittedArtwork';
import { Text } from './Privacy';

export default function IllustratedButton({ artwork, label, accessibilityLabel = label, onPress, selected = false, disabled = false, style, compact = false }) {
  return <MascotTouchable artworkMode="integrated" accessibilityRole="button" accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected, disabled }} disabled={disabled} onPress={onPress}
    style={[s.button, compact && s.compact, disabled && s.disabled, style]}>
    <FittedArtwork source={artwork} resizeMode="cover" style={s.artwork} accessible={false} />
    <Text style={[s.label, compact && s.compactLabel]}>{selected ? '✓ ' : ''}{label}</Text>
  </MascotTouchable>;
}

const s = StyleSheet.create({
  button: { minHeight: 82, minWidth: 0, borderWidth: 2, borderColor: '#8558AE', borderRadius: 20,
    backgroundColor: '#654891', justifyContent: 'flex-end', overflow: 'hidden' },
  compact: { width: 86, minHeight: 86, borderColor: '#DF665F' },
  artwork: { ...StyleSheet.absoluteFillObject, width: undefined },
  disabled: { opacity: 0.5 },
  label: { color: '#FFFFFF', backgroundColor: '#101E39DF', textAlign: 'center', fontSize: 16,
    lineHeight: 21, fontWeight: '900', paddingVertical: 5, paddingHorizontal: 6 },
  compactLabel: { alignSelf: 'flex-end', borderTopLeftRadius: 9, paddingHorizontal: 9 },
});
