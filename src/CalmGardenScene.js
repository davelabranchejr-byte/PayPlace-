import { EncouragementSpot, EncouragementScene } from "./Encouragement";
import React, { useEffect, useState } from "react";
import { AppState, Image, StyleSheet, View } from "react-native";
import CaptionedArtwork from "./CaptionedArtwork";
import FittedArtwork from "./FittedArtwork";
import { Text } from "./Privacy";

const sunset = require("../assets/characters/annie-backyard-sunset.png");
const night = require("../assets/characters/annie-backyard-night.png");
const isNighttime = () => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
};
function BackyardScene({ children }) {
  const [isNight, setIsNight] = useState(isNighttime);
  useEffect(() => {
    const app = AppState.addEventListener("change", state => {
      if (state === "active") setIsNight(isNighttime());
    });
    const timer = setInterval(() => setIsNight(isNighttime()), 60000);
    return () => { app.remove(); clearInterval(timer); };
  }, []);
  return (
    <View style={s.scene}>
      <FittedArtwork source={isNight ? night : sunset} style={StyleSheet.absoluteFillObject} testID="calm-garden-backyard-artwork"
        accessibilityLabel={isNight
          ? "Annie's fenced backyard at night, with glowing string lights and fireflies among the flowers"
          : "Annie's fenced backyard at sunset, with birds and butterflies among the flowers"} />
      {children}
      <EncouragementSpot place="garden" />
    </View>
  );
}
const pearlScenes = {
  "chapo-01": require("../assets/characters/chapo-pearl-01.png"),
  "chapo-02": require("../assets/characters/chapo-pearl-02.png"),
  "chapo-03": require("../assets/characters/chapo-pearl-03.png"),
  "chapo-04": require("../assets/characters/chapo-pearl-04.png"),
  "chapo-05": require("../assets/characters/chapo-pearl-05.png"),
  "chapo-06": require("../assets/characters/chapo-pearl-06.png"),
  "chapo-07": require("../assets/characters/chapo-pearl-07.png"),
  "chapo-08": require("../assets/characters/chapo-pearl-08.png"),
  "chapo-09": require("../assets/characters/chapo-pearl-09.png"),
  "chapo-10": require("../assets/characters/chapo-pearl-10.png"),
  "chapo-11": require("../assets/characters/chapo-pearl-11.png"),
  "chapo-12": require("../assets/characters/chapo-pearl-12.png"),
  "chapo-13": require("../assets/characters/chapo-pearl-13.png"),
  "chapo-14": require("../assets/characters/chapo-pearl-14.png"),
  "chapo-15": require("../assets/characters/chapo-pearl-15.png"),
  "chapo-16": require("../assets/characters/chapo-pearl-16.png"),
  "together-01": require("../assets/characters/annie-pearl-01.png"),
  "together-02": require("../assets/characters/annie-pearl-02.png"),
  "together-03": require("../assets/characters/annie-pearl-03.png"),
  "together-04": require("../assets/characters/annie-pearl-04.png"),
  "together-05": require("../assets/characters/annie-pearl-05.png"),
  "together-06": require("../assets/characters/annie-pearl-06.png"),
  "together-07": require("../assets/characters/annie-pearl-07.png"),
  "together-08": require("../assets/characters/annie-pearl-08.png"),
  "together-09": require("../assets/characters/annie-pearl-09.png"),
  "together-10": require("../assets/characters/annie-pearl-10.png"),
  "together-11": require("../assets/characters/annie-pearl-11.png"),
  "together-12": require("../assets/characters/annie-pearl-12.png"),
  "together-13": require("../assets/characters/annie-pearl-13.png"),
  "together-14": require("../assets/characters/annie-pearl-14.png"),
  "together-15": require("../assets/characters/annie-pearl-15.png"),
  "together-16": require("../assets/characters/annie-pearl-16.png"),
  "westley-01": require("../assets/characters/westley-pearl-01.png"),
  "westley-02": require("../assets/characters/westley-pearl-02.png"),
  "westley-03": require("../assets/characters/westley-pearl-03.png"),
  "westley-04": require("../assets/characters/westley-pearl-04.png"),
  "westley-05": require("../assets/characters/westley-pearl-05.png"),
  "westley-06": require("../assets/characters/westley-pearl-06.png"),
  "westley-07": require("../assets/characters/westley-pearl-07.png"),
  "westley-08": require("../assets/characters/westley-pearl-08.png"),
  "westley-09": require("../assets/characters/westley-pearl-09.png"),
  "westley-10": require("../assets/characters/westley-pearl-10.png"),
  "westley-11": require("../assets/characters/westley-pearl-11.png"),
  "westley-12": require("../assets/characters/westley-pearl-12.png"),
  "westley-13": require("../assets/characters/westley-pearl-13.png"),
  "westley-14": require("../assets/characters/westley-pearl-14.png"),
  "westley-15": require("../assets/characters/westley-pearl-15.png"),
  "westley-16": require("../assets/characters/westley-pearl-16.png"),
  "tate-01": require("../assets/characters/tate-pearl-01.png"),
  "tate-02": require("../assets/characters/tate-pearl-02.png"),
  "tate-03": require("../assets/characters/tate-pearl-03.png"),
  "tate-04": require("../assets/characters/tate-pearl-04.png"),
  "tate-05": require("../assets/characters/tate-pearl-05.png"),
  "tate-06": require("../assets/characters/tate-pearl-06.png"),
  "tate-07": require("../assets/characters/tate-pearl-07.png"),
  "tate-08": require("../assets/characters/tate-pearl-08.png"),
  "tate-09": require("../assets/characters/tate-pearl-09.png"),
  "tate-10": require("../assets/characters/tate-pearl-10.png"),
  "tate-11": require("../assets/characters/tate-pearl-11.png"),
  "tate-12": require("../assets/characters/tate-pearl-12.png"),
  "tate-13": require("../assets/characters/tate-pearl-13.png"),
  "tate-14": require("../assets/characters/tate-pearl-14.png"),
  "tate-15": require("../assets/characters/tate-pearl-15.png"),
  "tate-16": require("../assets/characters/tate-pearl-16.png"),
  "bobbie-01": require("../assets/characters/bobbie-pearl-01.png"),
  "bobbie-02": require("../assets/characters/bobbie-pearl-02.png"),
  "bobbie-03": require("../assets/characters/bobbie-pearl-03.png"),
  "bobbie-04": require("../assets/characters/bobbie-pearl-04.png"),
  "bobbie-05": require("../assets/characters/bobbie-pearl-05.png"),
  "bobbie-06": require("../assets/characters/bobbie-pearl-06.png"),
  "bobbie-07": require("../assets/characters/bobbie-pearl-07.png"),
  "bobbie-08": require("../assets/characters/bobbie-pearl-08.png"),
  "bobbie-09": require("../assets/characters/bobbie-pearl-09.png"),
  "bobbie-10": require("../assets/characters/bobbie-pearl-10.png"),
  "bobbie-11": require("../assets/characters/bobbie-pearl-11.png"),
  "bobbie-12": require("../assets/characters/bobbie-pearl-12.png"),
  "bobbie-13": require("../assets/characters/bobbie-pearl-13.png"),
  "bobbie-14": require("../assets/characters/bobbie-pearl-14.png"),
  "bobbie-15": require("../assets/characters/bobbie-pearl-15.png"),
  "bobbie-16": require("../assets/characters/bobbie-pearl-16.png"),
};

// These illustrations have foreground space below the characters and story props.
const lowerForeground = new Set([
  "together-01", "together-04", "together-05", "together-12", "together-13", "together-16",
  "westley-01", "westley-04", "westley-08", "westley-11", "westley-15",
  "tate-01", "tate-02", "tate-04", "tate-06", "tate-07", "tate-10", "tate-12", "tate-15",
]);

export function CalmGardenStory({ pearl, collectionLabel }) {
  const overlap = pearl.id === "together-02" ? 0.22 : lowerForeground.has(pearl.id) ? 0.16 : 0;
  return <CaptionedArtwork overlapFraction={overlap} captionStyle={s.quoteCaption} testID="calm-garden-quote"
    artwork={<View style={s.storyArt}><CalmGardenScene pearl={pearl} /></View>}>
    <Text style={s.quote}>“{pearl.body}”</Text>
    <Text style={s.signature}>— {pearl.signature || collectionLabel}</Text>
  </CaptionedArtwork>;
}

export default function CalmGardenScene({ pearl, children }) {
  const pearlScene = pearlScenes[pearl?.id];
  if (pearlScene) {
    return <EncouragementScene place="garden" style={s.scene}>
    <Image source={pearlScene} style={[s.scene, { backgroundColor: "#E0F6F1" }]} resizeMode="contain" accessibilityLabel={`${pearl.id.startsWith("together-") ? "Annie" : pearl.id.startsWith("chapo-") ? "Chapo" : pearl.id.startsWith("bobbie-") ? "Bobbie" : pearl.id.startsWith("tate-") ? "Tate" : "Westley"} — ${pearl.title}`} /></EncouragementScene>;
  }
  return <BackyardScene>{children}</BackyardScene>;
}

const s = StyleSheet.create({
  scene: { width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#183A35" },
  storyArt: { width: "100%", aspectRatio: 1, backgroundColor: "#183A35" },
  quoteCaption: { backgroundColor: "rgba(15, 43, 39, 0.94)" },
  quote: { color: "#FFF9E9", fontSize: 15, lineHeight: 20, fontWeight: "600" },
  signature: { color: "#BFF8EF", fontSize: 13, lineHeight: 17, marginTop: 4, fontWeight: "800", textAlign: "right" },
});
