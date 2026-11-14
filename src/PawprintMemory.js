import { MascotPressable as Pressable } from './MascotTouchable';
import React, { useState } from "react";
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from "./Privacy";
import { Ionicons } from "@expo/vector-icons";

// Dave's approved combined wall artwork, including Westley's pointed ears.
// Display the original pixels at their full aspect ratio in both views.
const artwork = require("../assets/characters/em-pawprint-memory-wall.png");
const artworkLabel = "Westley and Tate’s paw-print garden beside Em with Westley, Tate, Bobbie and Chapo on Annie’s tree-bark wall. Westley has pointed ears. Westley’s paw prints are orange and Tate’s are blue, made in May 2026.";

export const WILD_TURKEYS_ART = require("../assets/characters/em-wild-turkeys-painting.jpg");
export const WILD_TURKEYS_RATIO = 1448 / 1086;
export const WILD_TURKEYS_LABEL = "Wild Turkeys. Tate and Westley painted two turkeys with their paw prints and colorful feathers. The painted note reads, ‘Twice the trouble, twice the thanks.’ November 2026.";

const memories = {
  garden: {
    id: "pawprint-memory", previewId: "pawprint-garden-artwork", source: artwork,
    ratio: 1186 / 1326, label: artworkLabel, title: "Paws make life brighter",
    caption: "Westley & Tate’s paw-print garden, made for Daddy at Em’s.",
    signature: "Westley: orange · Tate: blue · May 2026",
    open: "Enlarge Westley and Tate’s paw-print garden with Em",
    viewerTitle: "A little love, made with paws", viewerCaption: "Westley & Tate’s paw-print garden with Em",
  },
  turkeys: {
    id: "wild-turkeys", previewId: "wild-turkeys-artwork", source: WILD_TURKEYS_ART,
    ratio: WILD_TURKEYS_RATIO, label: WILD_TURKEYS_LABEL, title: "Wild Turkeys",
    caption: "Westley and Tate painted this for Daddy at Em’s Pet Spa.",
    signature: "“Twice the trouble, twice the thanks” · November 2026",
    open: "Enlarge Westley and Tate’s Wild Turkeys",
    viewerTitle: "Wild Turkeys", viewerCaption: "A pickup-day surprise for Daddy",
  },
};

export default function PawprintMemory({ memory = "garden" } = {}) {
  const [enlarged, setEnlarged] = useState(false);
  const item = memories[memory];
  const frameStyle = [s.preview, { aspectRatio: item.ratio }, memory === "turkeys" && s.keepsakeFrame];
  return <View style={s.section}>
    <Pressable artworkMode="integrated" testID={`${item.id}-preview`} accessibilityRole="button"
      accessibilityLabel={item.open}
      accessibilityHint="Opens the complete wall picture. Close returns to the family wall."
      onPress={() => setEnlarged(true)} style={({ pressed }) => [frameStyle, pressed && s.pressed]}>
      <Image testID={item.previewId} source={item.source} style={s.image} resizeMode="contain" accessible={false} />
    </Pressable>
    <Text style={s.title} accessibilityRole="header">{item.title}</Text>
    <Text style={s.caption}>{item.caption}</Text>
    <Text style={s.signature}>{item.signature}</Text>
    <Text style={s.hint}>Tap the picture for a closer look.</Text>
    <Modal visible={enlarged} animationType="fade" onRequestClose={() => setEnlarged(false)}>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.viewerTitle} accessibilityRole="header">{item.viewerTitle}</Text>
          <Pressable testID={`${item.id}-close`} accessibilityRole="button"
            accessibilityLabel="Close picture and return to the family wall"
            onPress={() => setEnlarged(false)} style={s.close}>
            <Ionicons name="close" size={26} color="#FFF8EA" />
          </Pressable>
        </View>
        <ScrollView testID={`${item.id}-viewer`} contentContainerStyle={s.viewerContent}
          maximumZoomScale={3} minimumZoomScale={1}>
          <View testID={`${item.id}-full-frame`} style={[s.preview, s.fullFrame, { aspectRatio: item.ratio }]}>
            <Image testID={`${item.id}-full`} source={item.source} style={s.image}
              resizeMode="contain" accessibilityLabel={item.label} />
          </View>
          <Text style={s.viewerCaption}>{item.viewerCaption}</Text>
          <Text style={s.viewerSignature}>{item.signature}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  section: { alignItems: "center", paddingBottom: 20, backgroundColor: "#FFF8EA" },
  preview: { width: "100%", maxWidth: 540, minHeight: 48 },
  keepsakeFrame: { width: "92%", borderWidth: 8, borderColor: "#80563C", borderRadius: 5, backgroundColor: "#513323", overflow: "hidden" },
  pressed: { opacity: 0.85 },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  title: { color: "#173557", fontSize: 20, fontWeight: "800", textAlign: "center", marginTop: 16, paddingHorizontal: 18 },
  caption: { color: "#526177", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8, paddingHorizontal: 18 },
  signature: { color: "#78543B", fontSize: 13, fontWeight: "700", textAlign: "center", marginTop: 6, paddingHorizontal: 18 },
  hint: { color: "#6754C5", fontSize: 14, fontWeight: "700", textAlign: "center", marginTop: 10, paddingHorizontal: 18 },
  safe: { flex: 1, backgroundColor: "#3B241A" },
  header: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  viewerTitle: { flex: 1, color: "#FFF8EA", fontSize: 19, fontWeight: "800" },
  close: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "#654331" },
  viewerContent: { alignItems: "center", paddingBottom: 28 },
  fullFrame: { maxWidth: 1000 },
  viewerCaption: { color: "#FFF8EA", textAlign: "center", fontSize: 16, lineHeight: 24, fontWeight: "700", paddingHorizontal: 20, marginTop: 18 },
  viewerSignature: { color: "#F4D4B0", textAlign: "center", fontSize: 14, lineHeight: 21, paddingHorizontal: 20, marginTop: 6 },
});
