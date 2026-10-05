import React from "react";
import { Image, StyleSheet } from "react-native";

const artwork = require("../assets/characters/extra-paycheck-chapo-bellybox.jpg");

export default function ExtraPaycheckChapoScene() {
  return (
    <Image
      source={artwork}
      style={s.artwork}
      resizeMode="contain"
      accessibilityLabel="Chapo in pajamas excitedly ordering snacks from BellyBox in his cozy treehouse at night"
    />
  );
}

const s = StyleSheet.create({
  artwork: { width: "100%", height: "100%" },
});
