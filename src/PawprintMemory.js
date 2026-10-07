import React, { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Dave's approved combined wall artwork, including Westley's pointed ears.
// Display the original pixels at their full aspect ratio in both views.
const artwork = require("../assets/characters/em-pawprint-memory-wall.png");
const artworkLabel = "Westley and Tate’s paw-print garden beside Em with Westley, Tate, Bobbie and Chapo on Annie’s tree-bark wall. Westley has pointed ears. Westley’s paw prints are orange and Tate’s are blue, made in May 2026.";

export default function PawprintMemory() {
  const [enlarged, setEnlarged] = useState(false);
  return <View style={s.section}>
    <Pressable testID="pawprint-memory-preview" accessibilityRole="button"
      accessibilityLabel="Enlarge Westley and Tate’s paw-print garden with Em"
      accessibilityHint="Opens the complete wall picture. Close returns to the family wall."
      onPress={() => setEnlarged(true)} style={({ pressed }) => [s.preview, pressed && s.pressed]}>
      <Image testID="pawprint-garden-artwork" source={artwork} style={s.image} resizeMode="contain" accessible={false} />
    </Pressable>
    <Text style={s.title} accessibilityRole="header">Paws make life brighter</Text>
    <Text style={s.caption}>Westley & Tate’s paw-print garden, made for Daddy at Em’s.</Text>
    <Text style={s.signature}>Westley: orange · Tate: blue · May 2026</Text>
    <Text style={s.hint}>Tap the picture for a closer look.</Text>
    <Modal visible={enlarged} animationType="fade" onRequestClose={() => setEnlarged(false)}>
      <SafeAreaView style={s.safe}>
        <View style={s.header}>
          <Text style={s.viewerTitle} accessibilityRole="header">A little love, made with paws</Text>
          <Pressable testID="pawprint-memory-close" accessibilityRole="button"
            accessibilityLabel="Close picture and return to the family wall"
            onPress={() => setEnlarged(false)} style={s.close}>
            <Ionicons name="close" size={26} color="#FFF8EA" />
          </Pressable>
        </View>
        <ScrollView testID="pawprint-memory-viewer" contentContainerStyle={s.viewerContent}
          maximumZoomScale={3} minimumZoomScale={1}>
          <View testID="pawprint-memory-full-frame" style={[s.preview, s.fullFrame]}>
            <Image testID="pawprint-memory-full" source={artwork} style={s.image}
              resizeMode="contain" accessibilityLabel={artworkLabel} />
          </View>
          <Text style={s.viewerCaption}>Westley & Tate’s paw-print garden with Em</Text>
          <Text style={s.viewerSignature}>Westley: orange · Tate: blue · May 2026</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </View>;
}

const s = StyleSheet.create({
  section: { alignItems: "center", paddingBottom: 20, backgroundColor: "#FFF8EA" },
  preview: { width: "100%", maxWidth: 540, minHeight: 48, aspectRatio: 1186 / 1326 },
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
