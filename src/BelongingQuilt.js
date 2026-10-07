import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";

// Extract views of the approved mockup without changing its fabric or artwork.
const approvedQuilt = require("../assets/characters/belonging-quilt-approved.png");
const artwork = (crop, label) => ({ source: approvedQuilt, width: 851, height: 1847, crop, label });
const acorn = artwork([258, 249, 335, 337], "An embroidered golden acorn on a padded cream quilt square with floral patchwork and hand stitching");
const quiltRoom = artwork([83, 1069, 690, 327], "Annie's warm room with the colorful Belonging Quilt hanging on a wooden rail");
const hangingQuilt = artwork([439, 1081, 295, 247], "The Belonging Quilt with stitched acorns, a home, flowers, a heart, and neighborhood squares");

export function AcornSquare() {
  return <View style={s.firstSquare}>
    <CharacterArtwork source={acorn} style={s.acorn} resizeMode="contain" />
    <Text style={s.squareLabel}>YOUR FIRST SQUARE</Text>
  </View>;
}

export default function BelongingQuilt({ onOpen }) {
  return <TouchableOpacity testID="belonging-quilt-preview" accessibilityRole="button"
    accessibilityLabel="View the Belonging Quilt. Your acorn square has a place in Annie's home."
    accessibilityHint="Opens the quilt and your first square. Return to the family gallery afterwards."
    style={s.card} activeOpacity={0.9} onPress={onOpen}>
    <View style={s.copy}>
      <Text style={s.eyebrow}>THE BELONGING QUILT</Text>
      <Text style={s.title}>Your place is stitched in.</Text>
      <Text style={s.body}>Just below the family gallery, Annie keeps a place for every neighbor.</Text>
    </View>
    <CharacterArtwork source={quiltRoom} style={s.room} resizeMode="contain" />
    <View style={s.previewFooter}>
      <CharacterArtwork source={acorn} style={s.smallSquare} resizeMode="contain" />
      <View style={s.flex}><Text style={s.footerTitle}>Your first acorn square</Text><Text style={s.body}>Tap to take a closer look.</Text></View>
      <Ionicons name="chevron-forward" size={23} color="#735940" />
    </View>
  </TouchableOpacity>;
}

export function QuiltDetail({ onBack }) {
  return <ScrollView style={s.screen} contentContainerStyle={s.detail}>
    <TouchableOpacity testID="quilt-back" style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the family gallery">
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.footerTitle}>Back to the family gallery</Text>
    </TouchableOpacity>
    <View style={s.detailCard}>
      <Text style={s.eyebrow}>ANNIE'S BELONGING QUILT</Text>
      <Text style={s.title} accessibilityRole="header">You have a place here.</Text>
      <CharacterArtwork source={hangingQuilt} style={s.fullQuilt} resizeMode="contain" />
      <AcornSquare />
      <Text style={s.promise}>“Belonging isn't something you earn. It's something you're given.”</Text>
      <Text style={s.body}>Your acorn is a beginning, not a reward. Annie stitched its matching half into the neighborhood quilt when you arrived.</Text>
      <Text style={s.signature}>Welcome home. Love, Annie.</Text>
    </View>
    <TouchableOpacity style={s.done} onPress={onBack} accessibilityRole="button"><Text style={s.doneText}>Back to the family gallery</Text></TouchableOpacity>
  </ScrollView>;
}

const s = StyleSheet.create({
  card: { marginTop: 18, borderRadius: 25, borderWidth: 2, borderColor: "#CAA67B", backgroundColor: "#FFF9EB", overflow: "hidden" },
  copy: { padding: 18 },
  eyebrow: { fontSize: 11, fontWeight: "900", letterSpacing: 1.5, color: "#8A6A32" },
  title: { fontSize: 25, fontWeight: "900", color: "#173557", marginTop: 7 },
  body: { fontSize: 15, lineHeight: 23, color: "#526177", marginTop: 6 },
  room: { width: "100%", aspectRatio: 690 / 327, backgroundColor: "#E8D5B2" },
  previewFooter: { padding: 14, flexDirection: "row", gap: 12, alignItems: "center" },
  smallSquare: { width: 64, height: 64 },
  flex: { flex: 1 },
  footerTitle: { fontSize: 15, fontWeight: "800", color: "#173557", flexShrink: 1 },
  firstSquare: { alignItems: "center", marginVertical: 18, width: "100%" },
  acorn: { width: "100%", maxWidth: 210, aspectRatio: 335 / 337 },
  squareLabel: { fontSize: 11, fontWeight: "900", letterSpacing: 1.2, color: "#6B5128", marginTop: 9, textAlign: "center" },
  screen: { flex: 1, backgroundColor: "#FFF8EA" },
  detail: { width: "100%", maxWidth: 650, alignSelf: "center", padding: 18, paddingBottom: 40 },
  back: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 14 },
  detailCard: { backgroundColor: "#FFFDF7", borderRadius: 25, padding: 20, borderWidth: 1, borderColor: "#D9BD87" },
  fullQuilt: { width: "100%", aspectRatio: 295 / 247, marginTop: 18, borderRadius: 14, overflow: "hidden" },
  promise: { fontSize: 20, lineHeight: 28, color: "#3D7A62", fontWeight: "800", textAlign: "center", marginTop: 6 },
  signature: { fontSize: 17, color: "#735940", fontStyle: "italic", textAlign: "center", marginTop: 18 },
  done: { minHeight: 50, backgroundColor: "#7A5CE6", borderRadius: 17, padding: 15, marginTop: 18, alignItems: "center", justifyContent: "center" },
  doneText: { fontSize: 16, color: "#FFF", fontWeight: "800", textAlign: "center" },
});
