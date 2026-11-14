import React from 'react';
import { StyleSheet } from 'react-native';
import { MascotTouchable } from './MascotTouchable';
import FittedArtwork from './FittedArtwork';
import { Text } from './Privacy';
import { payplaceColors } from './brand';

export default function IllustratedButton({ artwork, label, accessibilityLabel = label, accessibilityRole = 'button',
  accessibilityState, onPress, selected = false, disabled = false, style, labelStyle, compact = false, testID }) {
  return <MascotTouchable artworkMode="integrated" testID={testID} accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected, disabled, ...accessibilityState }} disabled={disabled} onPress={onPress}
    style={[s.button, compact && s.compact, disabled && s.disabled, style]}>
    <FittedArtwork source={artwork} resizeMode="cover" style={s.artwork} accessible={false}
      brandMarkSize={compact ? 16 : 18} />
    <Text style={[s.label, compact && s.compactLabel, labelStyle]}>{selected ? '✓ ' : ''}{label}</Text>
  </MascotTouchable>;
}

const s = StyleSheet.create({
  button: { minHeight: 82, minWidth: 0, borderWidth: 2, borderColor: payplaceColors.purple, borderRadius: 20,
    backgroundColor: payplaceColors.ink, justifyContent: 'flex-end', overflow: 'hidden' },
  compact: { width: 86, minHeight: 86, borderColor: payplaceColors.coral },
  artwork: { ...StyleSheet.absoluteFillObject, width: undefined },
  disabled: { opacity: 0.5 },
  label: { color: '#FFFFFF', backgroundColor: `${payplaceColors.ink}ED`, textAlign: 'center', fontSize: 16,
    lineHeight: 21, fontWeight: '900', paddingVertical: 5, paddingHorizontal: 6 },
  compactLabel: { alignSelf: 'flex-end', borderTopLeftRadius: 9, paddingHorizontal: 9 },
});
