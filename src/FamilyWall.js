import React, { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import { MASCOT_LORE } from "./data/mascotLore";
import PawprintMemory from "./PawprintMemory";
import { FAMILY_PORTRAITS, FAMILY_WALL_SIZE, portraitFrameStyle, familyGallerySize } from "./family-wall-layout.mjs";

const familyWallArtwork = require("../assets/characters/annie-family-wall.jpg");
const storyPortraits = Object.fromEntries(Object.entries(FAMILY_PORTRAITS).map(([id, detail]) => [
  id, { source: familyWallArtwork, ...FAMILY_WALL_SIZE, crop: detail.crop, label: detail.label },
]));

// Backgrounds adapted from PAYPLACE_CHARACTER_BIBLE.md, preserving the approved canon.
export const FAMILY_STORIES = [
  { id: "daddy", name: "Daddy", role: "The one who brought everyone home", promise: "No one is left behind.", paragraphs: [
    "Daddy is the person who chose every member of this unusual family and refused to leave anyone behind. He is their dad—the reason this family became a family.",
    "When Tate jumped into his arms, Daddy never let him go. When Bobbie and Chapo needed a home after a Florida flood, he refused to adopt only Bobbie. He waited for Chapo to heal and brought them home together.",
    "His portrait belongs here among the family photographs, a reminder that being chosen can change everything."
  ] },
  { id: "westley", ...MASCOT_LORE.westley, promise: MASCOT_LORE.westley.emotionalPromise, paragraphs: [
    "Westley is the family's Chaos Coach: a fluffy white Westie with kind eyes, a reassuring expression, and an old soul at just three years old. Gentle, thoughtful, and protective, he wants every neighbor to feel safe.",
    "He takes things literally and is adorably easy to shock. When Tate explains that he once lived in the woods without clothes, Westley can hardly believe it: ‘WHAT?!’ Fur, he insists, is not an outfit.",
    "His welcome is a wet nose print against the screen, followed by a warm ‘Welcome home.’ His humor is never cruel; he offers a soft landing when life feels overwhelming."
  ] },
  { id: "tate", ...MASCOT_LORE.tate, promise: MASCOT_LORE.tate.emotionalPromise, paragraphs: [
    "Tate is a tiny Chihuahua with oversized ears and a fearless heart. At sixteen, he still acts like the youngest sibling: joyful, affectionate, and certain that every ordinary moment is a grand adventure.",
    "He once lived wild in the woods, chasing birds and swimming through rivers and lakes. One cold, muddy day, Daddy stopped his riding machine and opened the door. Tate jumped into his arms. Daddy never let him go.",
    "Tate calls himself an explorer. Now the Tiny Win Champion celebrates each small step forward—with an enormous slobbery lick and an enthusiastic ‘I MISSED YOU!’"
  ] },
  { id: "bobbie", ...MASCOT_LORE.bobbie, promise: MASCOT_LORE.bobbie.emotionalPromise, paragraphs: [
    "Bobbie is the family's glamorous, green-eyed brown tabby and Confidence Queen. Composed, loving, and theatrically mysterious, she reminds every neighbor to believe in themselves.",
    "She modeled on the runway when she was just a little older than a kitten. Today she leads Puuuurfect Designs, created Puuuurfect Scents, and has her own Kitty Couture Cosmetics line. Every Cat Couture article she cites happens to be written by her—an expert source is still a source.",
    "Before adoption, she was called Barbie. She and Chapo lived with an older woman in Tampa until a Florida flood left them homeless. Daddy brought them home together. Bobbie keeps her mysteries close and greets her neighbors with a glamorous blown kiss."
  ] },
  { id: "chapo", ...MASCOT_LORE.chapo, promise: MASCOT_LORE.chapo.emotionalPromise, paragraphs: [
    "Chapo is the round-cheeked orange tabby, comfort expert, and snack-loving Reward Goblin. Funny and affectionate, he reminds the neighborhood to enjoy life and make room for rewards.",
    "He and Bobbie lived with an older woman in Tampa before a Florida flood left them homeless. Daddy refused to adopt only Bobbie: he waited until Chapo's flea dermatitis had healed, then brought both cats home together.",
    "Chapo has plenty of dramatic detective theories about Bobbie's mysterious past. They are his jokes, never confirmed events. Beneath the snacks and conspiracies, he knows what it means to be chosen. His philosophy is simple: ‘Everyone deserves a place at the table.’"
  ] },
  { id: "annie", ...MASCOT_LORE.annie, promise: MASCOT_LORE.annie.emotionalPromise, paragraphs: [
    "Great Annie is the heart of the neighborhood. A welcoming oak with a warm grandmotherly face, flowers, and leaves, she is more than a mascot. She is home.",
    "Her branches open like welcoming arms around the familiar red door in her trunk. Beyond it is this family's foyer: photographs, warmth, and a place where every neighbor belongs.",
    "Patient, wise, and never preachy, Annie holds the neighborhood together. Whenever you return, her promise stays the same: you will always have a place here."
  ] }
];

export default function FamilyWall({ onSelect }) {
  const [availableWidth, setAvailableWidth] = useState(0);
  const gallerySize = familyGallerySize(availableWidth);
  return <View style={s.wall}>
    <View style={s.heading}>
      <Text style={s.eyebrow}>THE FAMILY WALL</Text>
      <Text style={s.title} accessibilityRole="header">This home has stories</Text>
      <Text style={s.hint}>You're inside Annie. Tap any framed portrait to read their full story.</Text>
    </View>
    <View style={s.galleryBoundary} onLayout={({ nativeEvent: { layout } }) => setAvailableWidth(layout.width)}>
    <View testID="family-gallery" style={[s.gallery, gallerySize]}>
      <Image testID="family-gallery-artwork" source={familyWallArtwork} style={[StyleSheet.absoluteFillObject, s.galleryImage]} resizeMode="contain" accessible={false} />
      {FAMILY_STORIES.map(person => <Pressable
        key={person.id}
        testID={`family-portrait-${person.id}`}
        style={({ pressed }) => [s.portraitTarget, portraitFrameStyle(person.id), pressed && s.portraitPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Meet ${person.name}. Read their full story.`}
        accessibilityHint={`Opens ${person.name}'s story. You can return to this wall afterwards.`}
        onPress={() => onSelect(person)}
      />)}
    </View>
    </View>
    <PawprintMemory />
  </View>;
}

export function CharacterStory({ person, onBack }) {
  return <ScrollView style={s.screen} contentContainerStyle={s.story}>
    <TouchableOpacity style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the family wall">
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.backText}>Back to the family wall</Text>
    </TouchableOpacity>
    <View style={s.storyCard}>
      <CharacterArtwork source={storyPortraits[person.id]} style={s.storyPortrait} resizeMode="contain" />
      <Text style={s.eyebrow}>MEET THE FAMILY</Text>
      <Text style={s.title} accessibilityRole="header">{person.name}</Text>
      <Text style={s.storyRole}>{person.role}</Text>
      <Text style={s.promise}>“{person.promise}”</Text>
      {person.paragraphs.map((paragraph, i) => <Text key={i} style={s.paragraph}>{paragraph}</Text>)}
    </View>
    <TouchableOpacity style={s.done} onPress={onBack} accessibilityRole="button"><Text style={s.doneText}>Back to the family wall</Text></TouchableOpacity>
  </ScrollView>;
}

const s = StyleSheet.create({
  wall: { backgroundColor: "#FFF8EA", borderRadius: 28, marginTop: 16, borderWidth: 1, borderColor: "#D9BD87", overflow: "hidden" },
  heading: { padding: 18 },
  eyebrow: { color: "#B25B4A", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: "#173557", fontSize: 25, fontWeight: "900", marginTop: 5 },
  hint: { color: "#526177", fontSize: 14, lineHeight: 20, marginTop: 6 },
  galleryBoundary: { width: "100%", alignItems: "center", backgroundColor: "#7D4527" },
  gallery: { position: "relative", flexShrink: 0, backgroundColor: "#7D4527" },
  // Native Image otherwise keeps the asset's intrinsic dimensions despite its absolute edges.
  galleryImage: { width: "100%", height: "100%" },
  portraitTarget: { position: "absolute", borderRadius: 12, borderWidth: 3, borderColor: "transparent" },
  portraitPressed: { backgroundColor: "rgba(255, 239, 166, 0.18)", borderColor: "#FFE89B" },
  screen: { flex: 1, backgroundColor: "#F8F3E8" },
  story: { padding: 18, paddingBottom: 40, alignSelf: "center", width: "100%", maxWidth: 720 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 48, marginBottom: 14 },
  backText: { color: "#173557", fontWeight: "800", fontSize: 15 },
  storyCard: { backgroundColor: "#FFFDF8", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#EADFCB" },
  storyPortrait: { width: "100%", height: 260, backgroundColor: "#F2ECFF", borderRadius: 18, marginBottom: 22, overflow: "hidden" },
  storyRole: { color: "#667085", fontSize: 16, lineHeight: 23, marginTop: 4 },
  promise: { color: "#6754C5", fontWeight: "800", fontSize: 21, lineHeight: 29, marginTop: 20 },
  paragraph: { color: "#334660", fontSize: 16, lineHeight: 25, marginTop: 16 },
  done: { minHeight: 50, marginTop: 18, borderRadius: 16, backgroundColor: "#7A5CE6", alignItems: "center", justifyContent: "center", padding: 14 },
  doneText: { color: "#FFF", fontSize: 16, fontWeight: "800" }
});
