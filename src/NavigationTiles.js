import React from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MascotTouchable, actionColors } from './MascotTouchable';
import { ACTION_ARTWORK } from './ActionArtwork';
import CharacterArtwork from './CharacterArtwork';
import FittedArtwork from './FittedArtwork';
import { Text } from './Privacy';
import { featureArtworkForTitle } from './action-artwork.mjs';

export default function NavigationTiles({ items, testID, horizontal = false }) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = !horizontal && (width < 340 || fontScale > 1.2);
  const tileWidth = fontScale > 1.2 ? Math.min(230, width * 0.72) : Math.min(172, Math.max(132, width * 0.4));
  const tiles = items.map(({ title, body, source, artworkAction, colors, accessibilityLabel, onPress }) => {
      const action = artworkAction || featureArtworkForTitle(title);
      const { fill, border } = colors || actionColors(action);
      const artwork = source ?? ACTION_ARTWORK[action];
      const asset = artwork && !artwork.crop ? Image.resolveAssetSource?.(artwork) : null;
      const ratio = asset?.width && asset?.height ? asset.width / asset.height : 1;
      return <MascotTouchable key={title} artworkMode="integrated" accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Open ${title}`} accessibilityHint={body}
        onPress={onPress} style={[s.tile, { backgroundColor: fill, borderColor: border }, singleColumn && s.wideTile,
          artwork && s.illustratedTile,
          artwork && singleColumn && s.illustratedRow,
          horizontal && [s.railTile, { width: tileWidth }]]}>
        {artwork?.crop
          ? <CharacterArtwork source={artwork} style={[s.atlas, { aspectRatio: artwork.crop[2] / artwork.crop[3] }]} accessible={false} />
          : artwork && <FittedArtwork source={artwork} aspectRatio={ratio} resizeMode="cover" accessible={false} />}
        <View style={[s.copy, singleColumn && !artwork && s.wideCopy, artwork && s.illustratedCopy]}>
          <Text style={[s.title, singleColumn && !artwork && s.left]}>{title}</Text>
          {body && <Text style={[s.body, singleColumn && !artwork && s.left]}>{body}</Text>}
        </View>
      </MascotTouchable>;
  });
  if (horizontal) return <ScrollView testID={testID} horizontal nestedScrollEnabled directionalLockEnabled
    contentContainerStyle={s.rail}>{tiles}</ScrollView>;
  return <View testID={testID} style={[s.grid, singleColumn && s.singleColumn]}>{tiles}</View>;
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginBottom: 14 },
  singleColumn: { flexDirection: 'column', flexWrap: 'nowrap' },
  tile: { flexBasis: '48%', flexGrow: 1, maxWidth: '49%', minHeight: 106, minWidth: 0, padding: 8,
    borderWidth: 2, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 5 },
  wideTile: { flexBasis: 'auto', flexGrow: 0, width: '100%', maxWidth: '100%', minHeight: 78, flexDirection: 'row', gap: 12 },
  illustratedTile: { padding: 0, gap: 0, alignItems: 'stretch', justifyContent: 'flex-start', overflow: 'hidden' },
  illustratedRow: { flexDirection: 'column' },
  illustratedCopy: { paddingHorizontal: 7, paddingVertical: 8, minHeight: 48 },
  rail: { gap: 8, paddingBottom: 10 },
  railTile: { flexBasis: 'auto', flexGrow: 0, maxWidth: '100%', alignSelf: 'stretch', justifyContent: 'flex-start' },
  atlas: { width: '100%', flexShrink: 0 },
  copy: { alignSelf: 'stretch', justifyContent: 'center' },
  wideCopy: { flex: 1, minWidth: 0 },
  title: { color: '#071A3A', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  body: { color: '#173C50', fontSize: 14, lineHeight: 18, textAlign: 'center' },
  left: { textAlign: 'left' },
});
