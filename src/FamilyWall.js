import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import { portraits } from "./characters";
import { artwork } from "./artwork";
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
    "Her branches open like welcoming arms. Brush aside her leaves and you will find the familiar red door in her trunk. Beyond it is this family's foyer: photographs, warmth, and a place where every neighbor belongs.",
    "Patient, wise, and never preachy, Annie holds the neighborhood together. Whenever you return, her promise stays the same: you will always have a place here."
  ] }
];

const FRAMES = {
  daddy: { color: "#694331", trim: "#C99D67", mat: "#FFF6E3", icon: "heart", radius: 4, tilt: "-1deg" },
  westley: { color: "#926B47", trim: "#4F9685", mat: "#F9F0D7", icon: "paw", radius: 5, tilt: "2deg" },
  bobbie: { color: "#C79837", trim: "#F9E3A2", mat: "#FAEAF2", icon: "diamond", radius: 28, tilt: "-2deg" },
  tate: { color: "#F1B828", trim: "#00AFA4", mat: "#EAF9F4", icon: "sparkles", radius: 10, tilt: "3deg" },
  chapo: { color: "#B57548", trim: "#6D47A2", mat: "#FFF0D2", icon: "cafe", radius: 40, tilt: "-3deg" },
  annie: { color: "#547B4C", trim: "#D5BC80", mat: "#FFFBEF", icon: "flower", radius: 65, tilt: "1deg" },
};
const DRAWINGS = {
  'gallery-westley-daddy': { title: "Daddy, by Westley", color: "#3EACA0", tilt: "-4deg" },
  'gallery-chapo-snacks': { title: "Snack dreams, by Chapo", color: "#E6AD31", tilt: "3deg" },
  'gallery-tate-everything': { title: "Everything! By Tate", color: "#E67C91", tilt: "-3deg" },
  'gallery-bobbie-money': { title: "Bank of Bobbie", color: "#8357BB", tilt: "2deg" },
  'gallery-bobbie-fashion': { title: "Bobbie’s couture sketches", color: "#B28B53", tilt: "-1deg" },
};
function FramedPortrait({ id, onSelect }) {
  const person = FAMILY_STORIES.find(p => p.id === id);
  const frame = FRAMES[id];
  return <TouchableOpacity style={[s.galleryPiece, id === 'daddy' && s.galleryWide]} activeOpacity={0.85}
    accessibilityRole="button" accessibilityLabel={`Meet ${person.name}. Read their background story.`} onPress={() => onSelect(person)}>
    <View style={s.hanger}><View style={[s.wire, { transform: [{ rotate: "-25deg" }] }]} /><View style={[s.wire, { transform: [{ rotate: "25deg" }] }]} /><View style={s.nail} /></View>
    <View style={[s.pictureFrame, { backgroundColor: frame.color, borderColor: frame.trim, borderRadius: frame.radius, transform: [{ rotate: frame.tilt }] }]}>
      <View style={[s.frameMat, { backgroundColor: frame.mat, borderRadius: Math.max(0, frame.radius - 8) }]}>
        <CharacterArtwork source={id === 'tate' ? artwork['portrait-tate'] || portraits.tate : portraits[id]} style={[s.galleryPortrait, id === 'daddy' && s.galleryDaddy, { borderRadius: Math.max(0, frame.radius - 14) }]} resizeMode="contain" />
      </View>
      <View style={[s.frameSeal, { backgroundColor: frame.trim }]}><Ionicons name={frame.icon} size={13} color={frame.color} /></View>
    </View>
    <View style={s.placard}><Text style={s.name}>{person.name}</Text><Text style={s.role}>{person.role}</Text><Text style={s.readText}>Read their story ›</Text></View>
  </TouchableOpacity>;
}
function Drawing({ id, wide = false }) {
  const drawing = DRAWINGS[id];
  if (!artwork[id]) return null;
  return <View style={[s.galleryPiece, wide && s.galleryWide]}>
    <View style={[s.paper, { transform: [{ rotate: drawing.tilt }], borderColor: drawing.color }]}>
      <View style={s.tape} /><CharacterArtwork source={artwork[id]} style={s.drawingImage} resizeMode="contain" />
    </View>
    <Text style={s.artist}>{drawing.title}</Text>
  </View>;
}
export default function FamilyWall({ onSelect }) {
  return <View style={s.wall}>
    <Text style={s.eyebrow}>THE FAMILY GALLERY</Text>
    <Text style={s.title}>A home full of stories</Text>
    <Text style={s.hint}>Family portraits, tiny masterpieces, and a little bit of mischief. Tap a framed portrait to meet the family.</Text>
    <View style={s.gallery}>
      <FramedPortrait id="daddy" onSelect={onSelect} />
      <FramedPortrait id="westley" onSelect={onSelect} /><Drawing id="gallery-westley-daddy" />
      <Drawing id="gallery-bobbie-money" /><FramedPortrait id="bobbie" onSelect={onSelect} />
      <FramedPortrait id="chapo" onSelect={onSelect} /><Drawing id="gallery-chapo-snacks" />
      <Drawing id="gallery-tate-everything" /><FramedPortrait id="tate" onSelect={onSelect} />
      <FramedPortrait id="annie" onSelect={onSelect} /><Drawing id="gallery-bobbie-fashion" />
    </View>
    <Text style={s.galleryFooter}>Every picture has a place here. So do you. ♡</Text>
  </View>;
}

export function CharacterStory({ person, onBack }) {
  return <ScrollView style={s.screen} contentContainerStyle={s.story}>
    <TouchableOpacity style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the family wall">
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.backText}>Back to the family wall</Text>
    </TouchableOpacity>
    <View style={s.storyCard}>
      <CharacterArtwork source={artwork['story-' + person.id] || portraits[person.id]} style={s.storyPortrait} resizeMode="contain" />
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
  wall: { backgroundColor: "#F1E6D1", borderRadius: 24, padding: 18, marginTop: 16, borderWidth: 2, borderColor: "#D6C09B" },
  eyebrow: { color: "#B25B4A", fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: "#173557", fontSize: 25, fontWeight: "900", marginTop: 5 },
  hint: { color: "#667085", fontSize: 14, lineHeight: 20, marginTop: 6, marginBottom: 16 },
  gallery: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", columnGap: 16, rowGap: 28, paddingTop: 12 },
  galleryPiece: { width: "46%", alignItems: "center", paddingTop: 12 },
  galleryWide: { width: "100%" },
  hanger: { height: 20, width: 70, position: "relative", alignItems: "center" },
  wire: { height: 1, width: 38, backgroundColor: "#806B51", position: "absolute", top: 9 },
  nail: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#806B51" },
  pictureFrame: { width: "100%", padding: 6, borderWidth: 3, shadowColor: "#402C20", shadowOpacity: 0.25, shadowRadius: 5, shadowOffset: { width: 2, height: 4 }, elevation: 4 },
  frameMat: { padding: 6, overflow: "hidden" },
  galleryPortrait: { width: "100%", height: 160, overflow: "hidden" },
  galleryDaddy: { height: 210 },
  frameSeal: { width: 23, height: 23, borderRadius: 12, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: 3 },
  placard: { backgroundColor: "#FFF9ED", paddingHorizontal: 8, paddingVertical: 7, borderRadius: 3, marginTop: 12, borderWidth: 1, borderColor: "#DCC8A5", alignItems: "center" },
  paper: { backgroundColor: "#FFFBEF", width: "100%", padding: 4, borderWidth: 1, shadowColor: "#4C3928", shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 1, height: 3 }, elevation: 2 },
  drawingImage: { width: "100%", height: 155 },
  tape: { position: "absolute", zIndex: 2, width: 40, height: 15, backgroundColor: "rgba(216,190,138,0.65)", top: -7, alignSelf: "center", transform: [{ rotate: "-7deg" }] },
  artist: { fontSize: 12, fontWeight: "700", color: "#725B45", textAlign: "center", marginTop: 12 },
  galleryFooter: { fontSize: 14, lineHeight: 21, color: "#725B45", fontStyle: "italic", textAlign: "center", marginTop: 30 },
  name: { color: "#173557", fontSize: 15, fontWeight: "900", textAlign: "center", marginTop: 1 },
  role: { color: "#667085", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 4 },
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
