import React, { useState } from "react";
import { Image, View } from "react-native";
import { artworkLayout } from "./artwork-layout.mjs";

export default function CharacterArtwork({ source, style, resizeMode = "contain", accessibilityLabel, ...props }) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  if (!source?.crop) return <Image source={source} style={style} resizeMode={resizeMode} accessibilityLabel={accessibilityLabel} {...props} />;
  const placement = artworkLayout(layout.width, layout.height, source.width, source.height, source.crop, resizeMode);
  return (
    <View
      style={[style, { overflow: "hidden" }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || source.label}
      onLayout={({ nativeEvent: { layout: next } }) => {
        if (layout.width !== next.width || layout.height !== next.height) setLayout({ width: next.width, height: next.height });
      }}
    >
      {placement && <View style={placement.frame} pointerEvents="none"><Image source={source.source} style={placement.image} resizeMode="stretch" accessible={false} /></View>}
    </View>
  );
}
