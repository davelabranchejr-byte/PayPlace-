import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function CaptionedArtwork({ artwork, children, overlapFraction = 0, captionStyle, testID }) {
  const [artHeight, setArtHeight] = useState(0);
  const [captionHeight, setCaptionHeight] = useState(0);
  // Keep the entire caption readable, even when it outgrows the part of the
  // illustration that can safely sit behind it.
  const overlap = Math.min(captionHeight, artHeight * overlapFraction);
  return <View>
    <View onLayout={event => setArtHeight(event.nativeEvent.layout.height)} testID={testID && `${testID}-frame`}>
      {artwork}
    </View>
    <View pointerEvents="none" testID={testID && `${testID}-caption`}
      onLayout={event => setCaptionHeight(event.nativeEvent.layout.height)}
      style={[s.caption, captionStyle, { marginTop: -overlap }]}>
      {children}
    </View>
  </View>;
}

const s = StyleSheet.create({
  caption: { position: 'relative', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(26, 24, 47, 0.94)' },
});
