import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CharacterArtwork from "./CharacterArtwork";

const logo = require("../assets/branding/payplace-icon.png");

export default function PayPlaceBrand({ compact = false, light = false, style }) {
  const primary = light ? "#FFFFFF" : "#173557";
  const accent = light ? "#B7FFF0" : "#6754C5";

  return (
    <View style={[s.wrap, compact && s.compactWrap, style]}>
      <CharacterArtwork
        source={logo}
        style={[s.logo, compact && s.compactLogo]}
        resizeMode="contain"
        accessibilityLabel="PayPlace official logo"
      />
      <View style={s.copy}>
        <Text style={[s.name, compact && s.compactName, { color: primary }]}>
          Pay<Text style={{ color: accent }}>Place</Text>
        </Text>
        <Text style={[s.tagline, compact && s.compactTagline, { color: primary }]}>
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
    width: 46,
    height: 46,
  },
  compactLogo: {
    width: 30,
    height: 30,
  },
  copy: {
    justifyContent: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 27,
  },
  compactName: {
    fontSize: 15,
    lineHeight: 17,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 1,
  },
  compactTagline: {
    fontSize: 8,
  },
});
