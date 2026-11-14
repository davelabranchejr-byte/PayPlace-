import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { MascotTouchable, actionColors } from './MascotTouchable';
import { ACTION_ARTWORK } from './ActionArtwork';
import FittedArtwork from './FittedArtwork';
import { featureArtworkForTitle } from './action-artwork.mjs';
import { Text } from './Privacy';

export default function FeatureLinks({ items }) {
  return <View style={s.list}>{items.map(({ title, body, onPress, artworkAction }) => {
    const action = artworkAction || featureArtworkForTitle(title);
    const source = ACTION_ARTWORK[action];
    const asset = source && Image.resolveAssetSource?.(source);
    const ratio = asset?.width && asset?.height ? asset.width / asset.height : 3 / 2;
    const colors = actionColors(action);
    return <MascotTouchable key={title} artworkMode="integrated" accessibilityRole="button"
      accessibilityLabel={`Open ${title}`} onPress={onPress}
      style={[s.item, { backgroundColor: colors.fill, borderColor: colors.border }]}>
      {source && <FittedArtwork source={source} aspectRatio={ratio} resizeMode="cover" accessible={false} />}
      <View style={s.details}>
        <View style={s.copy}><Text style={s.title}>{title}</Text>{body && <Text style={s.body}>{body}</Text>}</View>
        <Text style={s.arrow} accessible={false} importantForAccessibility="no">›</Text>
      </View>
    </MascotTouchable>;
  })}</View>;
}

const s = StyleSheet.create({
  list: { gap: 14, marginBottom: 18 },
  item: { width: '100%', borderRadius: 28, borderWidth: 3, overflow: 'hidden' },
  details: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 52, padding: 12 },
  copy: { flex: 1, minWidth: 0, gap: 5 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '900', color: '#071A3A' },
  body: { fontSize: 15, lineHeight: 21, color: '#173C50' },
  arrow: { width: 32, backgroundColor: '#8734CF', borderRadius: 16, textAlign: 'center',
    fontSize: 28, lineHeight: 36, color: '#FFFFFF', fontWeight: '900' },
});
