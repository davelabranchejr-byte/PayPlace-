import React from 'react';
import { StyleSheet } from 'react-native';
import { MascotTouchable } from './MascotTouchable';
import FittedArtwork from './FittedArtwork';
import { Text } from './Privacy';
import { payplaceColors } from './brand';

export default function IllustratedButton({ artwork, label, accessibilityLabel = label, accessibilityRole = 'button',
  accessibilityState, onPress, selected = false, disabled = false, style, labelStyle, compact = false, testID }) {
  const { height, maxHeight, aspectRatio, ...layoutStyle } = StyleSheet.flatten(style) || {};
  return <MascotTouchable artworkMode="integrated" testID={testID} accessibilityRole={accessibilityRole} accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected, disabled, ...accessibilityState }} disabled={disabled} onPress={onPress}
    style={[s.button, compact && s.compact, disabled && s.disabled, layoutStyle]}>
    <FittedArtwork source={artwork} resizeMode="contain" style={s.artwork} accessible={false} />
    <Text style={[s.label, compact && s.compactLabel, labelStyle]}>{selected ? '✓ ' : ''}{label}</Text>
  </MascotTouchable>;
}

const s = StyleSheet.create({
  button: { minHeight: 82, minWidth: 0, borderWidth: 2, borderColor: payplaceColors.purple, borderRadius: 20,
    backgroundColor: payplaceColors.ink, justifyContent: 'flex-start', overflow: 'hidden' },
  compact: { width: 86, minHeight: 86, borderColor: payplaceColors.coral },
  artwork: { width: '100%', flexShrink: 0 },
  disabled: { opacity: 0.5 },
  label: { color: '#FFFFFF', backgroundColor: payplaceColors.ink, textAlign: 'center', fontSize: 16,
    lineHeight: 21, fontWeight: '900', paddingVertical: 5, paddingHorizontal: 6 },
  compactLabel: { paddingHorizontal: 9 },
});
