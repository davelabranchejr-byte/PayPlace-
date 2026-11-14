import React, { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from "./Privacy";
import { Ionicons } from "@expo/vector-icons";
import ArtworkBrandMark from "./ArtworkBrandMark";

const artwork = require("../assets/characters/em-pawprint-memory-wall.png");
const familyKeepsakeWall = require("../assets/characters/em-family-keepsake-wall.jpg");
const artworkLabel = "Westley and Tate’s paw-print garden beside Em with Westley, Tate, Bobbie and Chapo on Annie’s tree-bark wall. Westley has pointed ears. Westley’s paw prints are orange and Tate’s are blue, made in May 2026.";

export const WILD_TURKEYS_ART = require("../assets/characters/em-wild-turkeys-painting.jpg");
export const WILD_TURKEYS_RATIO = 1448 / 1086;
export const WILD_TURKEYS_LABEL = "Wild Turkeys. Tate and Westley painted two turkeys with their paw prints and colorful feathers. The painted note reads, ‘Twice the trouble, twice the thanks.’ November 2026.";

const memories = {
  garden: {
    id: "pawprint-memory", source: artwork, ratio: 1186 / 1326, label: artworkLabel,
    area: { left: "5%", top: "7%", width: "52%", height: "42%" },
    signature: "Westley: orange · Tate: blue · May 2026",
    open: "Enlarge Westley and Tate’s paw-print garden with Em",
    viewerTitle: "A little love, made with paws", viewerCaption: "Westley & Tate’s paw-print garden with Em",
  },
  turkeys: {
    id: "wild-turkeys", source: WILD_TURKEYS_ART, ratio: WILD_TURKEYS_RATIO, label: WILD_TURKEYS_LABEL,
    area: { left: "13%", top: "59.5%", width: "61%", height: "31%" },
    signature: "“Twice the trouble, twice the thanks” · November 2026",
    open: "Enlarge Westley and Tate’s Wild Turkeys",
    viewerTitle: "Wild Turkeys", viewerCaption: "A pickup-day surprise for Daddy",
  },
};

export default function PawprintMemory() {
  const [item, setItem] = useState(null);
  const close = () => setItem(null);
  return <View style={s.section}>
    <View testID="family-keepsake-wall-frame" style={s.wallFrame}>
      <Image testID="family-keepsake-wall-artwork" source={familyKeepsakeWall} style={s.image} resizeMode="contain" accessible={false} />
      {Object.values(memories).map(memory => <Pressable key={memory.id} testID={`${memory.id}-preview`}
        accessibilityRole="button" accessibilityLabel={memory.open}
        onPress={() => setItem(memory)} style={({ pressed }) => [s.hotspot, memory.area, pressed && s.pressed]} />)}
    </View>
    <View style={s.wallCaption}>
      <Text style={s.hint}>Tap either painting for a closer look.</Text>
      <ArtworkBrandMark size={21} style={s.captionMark} />
    </View>
    <Modal visible={!!item} animationType="fade" onRequestClose={close}>
      {item && (
        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <Text style={s.viewerTitle} accessibilityRole="header">{item.viewerTitle}</Text>
            <Pressable testID={`${item.id}-close`} accessibilityRole="button"
              accessibilityLabel="Close picture and return to the family wall"
              onPress={close} style={s.close}>
              <Ionicons name="close" size={26} color="#FFF8EA" />
            </Pressable>
          </View>
          <ScrollView testID={`${item.id}-viewer`} contentContainerStyle={s.viewerContent}
            maximumZoomScale={3} minimumZoomScale={1}>
            <View testID={`${item.id}-full-frame`} style={[s.fullFrame, { aspectRatio: item.ratio }]}>
              <Image testID={`${item.id}-full`} source={item.source} style={s.image}
                resizeMode="contain" accessibilityLabel={item.label} />
            </View>
            <Text style={s.viewerCaption}>{item.viewerCaption}</Text>
            <Text style={s.viewerSignature}>{item.signature}</Text>
          </ScrollView>
        </SafeAreaView>
      )}
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  section: { alignItems: "center", paddingBottom: 20, backgroundColor: "#FFF8EA" },
  wallFrame: { width: "100%", maxWidth: 540, aspectRatio: 1024 / 1536, position: "relative", backgroundColor: "#593821" },
  hotspot: { position: "absolute", borderRadius: 6 },
  pressed: { backgroundColor: "rgba(255,238,198,0.16)" },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  wallCaption: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10, paddingHorizontal: 18 },
  hint: { color: "#6754C5", fontSize: 14, fontWeight: "700", textAlign: "center", flexShrink: 1 },
  captionMark: { position: "relative", top: 0, right: 0 },
  safe: { flex: 1, backgroundColor: "#3B241A" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  viewerTitle: { flex: 1, color: "#FFF8EA", fontSize: 19, fontWeight: "800" },
  close: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "#654331" },
  viewerContent: { alignItems: "center", paddingBottom: 28 },
  fullFrame: { width: "100%", maxWidth: 1000 },
  viewerCaption: { color: "#FFF8EA", textAlign: "center", fontSize: 16, lineHeight: 24, fontWeight: "700", paddingHorizontal: 20, marginTop: 18 },
  viewerSignature: { color: "#F4D4B0", textAlign: "center", fontSize: 14, lineHeight: 21, paddingHorizontal: 20, marginTop: 6 },
});
