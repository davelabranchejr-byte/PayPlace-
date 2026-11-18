import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CaptionedArtwork({ artwork, children, captionStyle, testID }) {
  // Captions have their own space, regardless of text size or scene content.
  return <View>
    <View testID={testID && `${testID}-frame`}>
      {artwork}
    </View>
    <View pointerEvents="none" testID={testID && `${testID}-caption`}
      style={[s.caption, captionStyle]}>
      {children}
    </View>
  </View>;
}

const s = StyleSheet.create({
  caption: { position: 'relative', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(26, 24, 47, 0.94)' },
});
