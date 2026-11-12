import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MascotTouchable, actionColors } from './MascotTouchable';
import ActionArtwork from './ActionArtwork';
import CharacterArtwork from './CharacterArtwork';
import { Text } from './Privacy';
import { featureArtworkForTitle } from './action-artwork.mjs';

export default function NavigationTiles({ items, testID }) {
  const { width, fontScale } = useWindowDimensions();
  const singleColumn = width < 340 || fontScale > 1.2;
  return <View testID={testID} style={[s.grid, singleColumn && s.singleColumn]}>
    {items.map(({ title, body, source, artworkAction, colors, accessibilityLabel, onPress }) => {
      const action = artworkAction || featureArtworkForTitle(title);
      const { fill, border } = colors || actionColors(action);
      return <MascotTouchable key={title} artworkMode="integrated" accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || `Open ${title}`} accessibilityHint={body}
        onPress={onPress} style={[s.tile, { backgroundColor: fill, borderColor: border }, singleColumn && s.wideTile]}>
        {source
          ? <CharacterArtwork source={source} style={s.art} resizeMode="contain" accessible={false} />
          : <ActionArtwork action={action} size={64} />}
        <View style={[s.copy, singleColumn && s.wideCopy]}>
          <Text style={[s.title, singleColumn && s.left]}>{title}</Text>
          {body && <Text style={[s.body, singleColumn && s.left]}>{body}</Text>}
        </View>
      </MascotTouchable>;
    })}
  </View>;
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 8, rowGap: 8, marginBottom: 14 },
  singleColumn: { flexDirection: 'column', flexWrap: 'nowrap' },
  tile: { flexBasis: '48%', flexGrow: 1, maxWidth: '49%', minHeight: 106, minWidth: 0, padding: 8,
    borderWidth: 2, borderRadius: 22, alignItems: 'center', justifyContent: 'center', gap: 5 },
  wideTile: { flexBasis: 'auto', flexGrow: 0, width: '100%', maxWidth: '100%', minHeight: 78, flexDirection: 'row', gap: 12 },
  art: { width: 72, height: 60, flexShrink: 0 },
  copy: { alignSelf: 'stretch', justifyContent: 'center' },
  wideCopy: { flex: 1, minWidth: 0 },
  title: { color: '#071A3A', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  body: { color: '#173C50', fontSize: 14, lineHeight: 18, textAlign: 'center' },
  left: { textAlign: 'left' },
});
