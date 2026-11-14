import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from './Privacy';
import { ACTION_ARTWORK } from './ActionArtwork';
import FittedArtwork from './FittedArtwork';

export default function ExpandableSection({ title, artworkAction, compact = false, children }) {
  const [expanded, setExpanded] = useState(false);
  const artwork = ACTION_ARTWORK[artworkAction];
  const asset = artwork && Image.resolveAssetSource?.(artwork);
  const ratio = asset?.width && asset?.height ? asset.width / asset.height : 3 / 2;
  return <View style={s.section}>
    <TouchableOpacity artworkMode={artwork ? 'integrated' : compact ? 'compact' : undefined}
      accessibilityRole="button" accessibilityState={{ expanded }}
      accessibilityLabel={title} onPress={() => setExpanded(value => !value)} style={artwork ? s.illustrated : s.toggle}>
      {artwork && <FittedArtwork source={artwork} aspectRatio={ratio} resizeMode="cover" accessible={false} />}
      <View style={artwork ? s.toggle : s.labelRow}>
        <Text style={s.title}>{title}</Text><Text accessible={false} style={s.mark}>{expanded ? '−' : '+'}</Text>
      </View>
    </TouchableOpacity>
    {expanded && <View style={s.content}>{children}</View>}
  </View>;
}

const s = StyleSheet.create({
  section: { marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: '#D4C9ED', backgroundColor: '#FFFDF8' },
  toggle: { minHeight: 52, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  illustrated: { borderWidth: 2, overflow: 'hidden' },
  labelRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: '#173C50' },
  mark: { fontSize: 24, color: '#6550AF' }, content: { padding: 10 },
});
