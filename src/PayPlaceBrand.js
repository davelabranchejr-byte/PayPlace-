import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "./Privacy";
import CharacterArtwork from "./CharacterArtwork";

import { payplaceLogo, payplaceLogoLabel } from "./brand";

export default function PayPlaceBrand({ compact = false, light = false, style }) {
  const primary = light ? "#FFFFFF" : "#173557";
  const accent = light ? "#B7FFF0" : "#08796E";
  const tagline = light ? "#FFFFFF" : "#6735A9";

  return (
    <View style={[s.wrap, compact && s.compactWrap, style]}>
      <CharacterArtwork
        source={payplaceLogo}
        style={[s.logo, compact && s.compactLogo]}
        resizeMode="contain"
        accessibilityLabel={payplaceLogoLabel}
      />
      <View style={s.copy}>
        <Text style={[s.name, compact && s.compactName, { color: primary }]}>
          Pay<Text style={{ color: accent }}>Place</Text>
        </Text>
        <Text style={[s.tagline, compact && s.compactTagline, { color: tagline }]}>
          Money without shame.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  compactWrap: {
    gap: 6,
  },
  logo: {
    flexShrink: 0,
    width: 46,
    height: 46,
  },
  compactLogo: {
    width: 30,
    height: 30,
  },
  copy: {
    justifyContent: "center",
    minWidth: 0,
    flexShrink: 1,
  },
  name: {
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 30,
  },
  compactName: {
    fontSize: 20,
    lineHeight: 23,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
  },
  compactTagline: {
    fontSize: 11,
  },
});
