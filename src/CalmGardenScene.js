import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import PayPlaceBrand from "./PayPlaceBrand";
import { portraits } from "./characters";

const SCENES = [
  { key: "water", title: "Water what you want to grow", icon: "water", sky: "#CFF4FF", ground: "#DDF4C8", note: "Morning birds hop between the beds while Annie tends the garden." },
  { key: "fireflies", title: "Night garden", icon: "sparkles", sky: "#172A46", ground: "#1E493D", note: "Fireflies glow, stars twinkle, and the garden gets very quiet." },
  { key: "smores", title: "Campfire circle", icon: "flame", sky: "#283655", ground: "#36513F", note: "Everyone gathers for s’mores and a money conversation that does not feel like homework." },
  { key: "plant", title: "Plant one small thing", icon: "leaf", sky: "#E6F8FF", ground: "#D6EDBA", note: "One seed. One plan. One tiny thing that future-you can thank you for." },
  { key: "path", title: "Garden path", icon: "trail-sign", sky: "#DDF5FF", ground: "#DBEBC0", note: "You do not need the whole map. Just the next stepping stone." },
  { key: "bench", title: "Sit with it", icon: "cafe", sky: "#E8F7F2", ground: "#D3E9C1", note: "A garden bench is allowed to be part of the plan. Not every moment needs action." },
  { key: "lantern", title: "Lantern walk", icon: "bulb", sky: "#2B365A", ground: "#29473D", note: "A little light is enough to see the next few feet." },
  { key: "birds", title: "Morning chorus", icon: "musical-notes", sky: "#D9F6FF", ground: "#D9F1C5", note: "Birds overhead, paws in the grass, and no emergency where there is only uncertainty." },
];

const CATEGORY_PERSON = {
  westley: "westley",
  tate: "tate",
  bobbie: "bobbie",
  chapo: "chapo",
  together: "annie",
};

function pearlNumber(pearl) {
  const raw = String(pearl?.number || String(pearl?.id || "").split("-").pop() || "1");
  return Number(raw.replace(/\D/g, "")) || 1;
}

export default function CalmGardenScene({ pearl, category, collectionLabel }) {
  const number = pearlNumber(pearl);
  const scene = SCENES[(number - 1) % SCENES.length];
  const characterKey = CATEGORY_PERSON[category] || "annie";
  const character = portraits[characterKey] || portraits.annie;
  const isNight = scene.key === "fireflies" || scene.key === "smores" || scene.key === "lantern";
  const textColor = isNight ? "#FFFFFF" : "#173557";

  return (
    <View style={[s.scene, { backgroundColor: scene.sky }]} accessibilityLabel={`${collectionLabel || "PayPlace"} in the Calm Garden. ${scene.note}`}>
      <View style={[s.ground, { backgroundColor: scene.ground }]} />
      <View style={s.sunMoon}>
        <Ionicons name={isNight ? "moon" : "sunny"} size={30} color={isNight ? "#FFF3B8" : "#F6BE48"} />
      </View>

      {isNight ? (
        <>
          <Text style={[s.sparkle, { left: "12%", top: 26 }]}>✦</Text>
          <Text style={[s.sparkle, { left: "35%", top: 48 }]}>·</Text>
          <Text style={[s.sparkle, { right: "18%", top: 34 }]}>✧</Text>
          <Text style={[s.sparkle, { right: "35%", top: 72 }]}>•</Text>
        </>
      ) : (
        <>
          <Ionicons name="leaf" size={24} color="#63A461" style={[s.floating, { left: 18, top: 54 }]} />
          <Ionicons name="leaf" size={20} color="#8ABC6B" style={[s.floating, { right: 32, top: 76 }]} />
        </>
      )}

      <View style={s.annieWrap}>
        <CharacterArtwork source={portraits.annie} style={s.annie} resizeMode="contain" accessibilityLabel={portraits.annie.label} />
      </View>

      {category !== "together" && (
        <View style={s.characterWrap}>
          <CharacterArtwork source={character} style={s.character} resizeMode="contain" accessibilityLabel={character.label} />
        </View>
      )}

      {scene.key === "smores" && (
        <View style={s.campfire}>
          <Ionicons name="flame" size={34} color="#FFB24D" />
          <Text style={s.smores}>◻︎  ◻︎</Text>
        </View>
      )}

      <View style={s.brandBadge}>
        <PayPlaceBrand compact light={isNight} />
      </View>

      <View style={s.caption}>
        <View style={s.captionTitleRow}>
          <Ionicons name={scene.icon} size={17} color={textColor} />
          <Text style={[s.captionTitle, { color: textColor }]}>{scene.title}</Text>
        </View>
        <Text style={[s.captionText, { color: textColor }]}>{scene.note}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scene: { width: "100%", height: "100%", minHeight: 245, overflow: "hidden", position: "relative" },
  ground: { position: "absolute", left: 0, right: 0, bottom: 0, height: "43%", borderTopLeftRadius: 120, borderTopRightRadius: 120 },
  sunMoon: { position: "absolute", right: 18, top: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center" },
  floating: { position: "absolute" },
  sparkle: { position: "absolute", color: "#FFF7C8", fontSize: 22, fontWeight: "900" },
  annieWrap: { position: "absolute", right: -6, bottom: 22, width: "53%", height: "86%" },
  annie: { width: "100%", height: "100%" },
  characterWrap: { position: "absolute", left: 8, bottom: 18, width: "47%", height: "70%" },
  character: { width: "100%", height: "100%" },
  campfire: { position: "absolute", left: "41%", bottom: 30, alignItems: "center" },
  smores: { color: "#F8E3BE", fontWeight: "900", marginTop: -4 },
  brandBadge: { position: "absolute", left: 10, top: 10, backgroundColor: "rgba(255,255,255,0.84)", borderRadius: 14, paddingHorizontal: 8, paddingVertical: 6 },
  caption: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: "rgba(255,255,255,0.74)", borderRadius: 16, padding: 10 },
  captionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  captionTitle: { fontSize: 12, fontWeight: "900" },
  captionText: { fontSize: 10, lineHeight: 14, fontWeight: "700", marginTop: 3 },
});
