import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import { portraits } from "./characters";
import { MASCOT_LORE } from "./data/mascotLore";

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

const GALLERY_DETAILS = {
  daddy: { note: "The center of the family wall.", frame: "daddy" },
  westley: { note: "Westley drew Daddy in crayon. He gave him extra-big arms.", frame: "westley" },
  tate: { note: "Tate draws everything. Nobody is entirely sure what this one is.", frame: "tate" },
  bobbie: { note: "Bobbie Bucks, starring Bobbie. Fashion sketches sold separately.", frame: "bobbie" },
  chapo: { note: "Chapo drew snacks. Then added more snacks.", frame: "chapo" },
  annie: { note: "Great Annie keeps every masterpiece on the wall.", frame: "annie" },
};

export default function FamilyWall({ onSelect }) {
  return <View style={s.wall}>
    <Text style={s.eyebrow}>THE FAMILY WALL</Text>
    <Text style={s.title}>This home has stories</Text>
    <Text style={s.hint}>Tap a portrait to meet the family. The little drawings are staying, obviously.</Text>
    <View style={s.grid}>{FAMILY_STORIES.map(person => {
      const detail = GALLERY_DETAILS[person.id] || {};
      const frameStyle = s[`frame_${detail.frame}`];
      return <TouchableOpacity
        key={person.id}
        style={[s.card, person.id === "daddy" && s.daddy, frameStyle]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Meet ${person.name}. Read their background story.`}
        onPress={() => onSelect(person)}>
        <View style={[s.photoMat, person.id === "bobbie" && s.photoMatBobbie]}>
          <CharacterArtwork source={portraits[person.id]} style={s.portrait} resizeMode="contain" />
        </View>
        <Text style={s.name}>{person.name}</Text>
        <Text style={s.role}>{person.role}</Text>
        {!!detail.note && <View style={[s.artNote, person.id === "bobbie" && s.artNoteBobbie]}>
          <Text style={[s.artNoteText, person.id === "bobbie" && s.artNoteTextBobbie]}>{detail.note}</Text>
        </View>}
        <View style={s.read}><Text style={s.readText}>Read story</Text><Ionicons name="chevron-forward" size={15} color="#6754C5" /></View>
      </TouchableOpacity>;
    })}</View>
  </View>;
}

export function CharacterStory({ person, onBack }) {
  return <ScrollView style={s.screen} contentContainerStyle={s.story}>
    <TouchableOpacity style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the family wall">
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.backText}>Back to the family wall</Text>
    </TouchableOpacity>
    <View style={s.storyCard}>
      <CharacterArtwork source={portraits[person.id]} style={s.storyPortrait} resizeMode="contain" />
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
  wall: { backgroundColor: "#FFFDF8", borderRadius: 28, padding: 18, marginTop: 16, borderWidth: 1, borderColor: "#EADFCB" },
  eyebrow: { color: "#B25B4A", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: "#173557", fontSize: 25, fontWeight: "900", marginTop: 5 },
  hint: { color: "#667085", fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  card: { width: "47%", borderRadius: 18, backgroundColor: "#F4EBDD", borderWidth: 4, alignItems: "center", padding: 10, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  daddy: { width: "100%", backgroundColor: "#F2ECFF", borderColor: "#BCAAEF" },
  frame_daddy: { borderColor: "#BCAAEF", borderRadius: 24 },
  frame_westley: { borderColor: "#9AC7D8", borderRadius: 26, transform: [{ rotate: "-0.5deg" }] },
  frame_tate: { borderColor: "#E0A85B", borderRadius: 14, transform: [{ rotate: "0.8deg" }] },
  frame_bobbie: { borderColor: "#D19AB7", borderRadius: 20, backgroundColor: "#FFF5FA" },
  frame_chapo: { borderColor: "#D6A24A", borderRadius: 16, backgroundColor: "#FFF7DD", transform: [{ rotate: "-0.8deg" }] },
  frame_annie: { borderColor: "#9DB88B", borderRadius: 22, backgroundColor: "#F5F6E8" },
  photoMat: { width: "100%", borderRadius: 12, backgroundColor: "#FFFDF8", padding: 5, borderWidth: 1, borderColor: "#EADFCB" },
  photoMatBobbie: { borderWidth: 2, borderColor: "#E5B7CC" },
  portrait: { width: "100%", height: 155, borderRadius: 10, overflow: "hidden" },
  name: { color: "#173557", fontSize: 18, fontWeight: "900", textAlign: "center", marginTop: 10 },
  role: { color: "#667085", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 4 },
  artNote: { alignSelf: "stretch", marginTop: 10, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: "#FFF9E9", borderRadius: 10, borderWidth: 1, borderColor: "#E8D7AA", transform: [{ rotate: "-1deg" }] },
  artNoteBobbie: { backgroundColor: "#FFF2F8", borderColor: "#E7B6CF", transform: [{ rotate: "0.6deg" }] },
  artNoteText: { color: "#6A5843", fontSize: 11, lineHeight: 15, textAlign: "center", fontStyle: "italic", fontWeight: "700" },
  artNoteTextBobbie: { color: "#8D3A69", fontStyle: "normal" },
  read: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, minHeight: 28 },
  readText: { color: "#6754C5", fontSize: 13, fontWeight: "800" },
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
