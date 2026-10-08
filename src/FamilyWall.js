import React, { useState } from "react";
import { Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    "Westley had six homes in one year. The sixth became home.",
    "Before he was the family's Chaos Coach, Westley needed people who would help him feel safe. This real rescue post captures the beginning of his journey toward care, recovery, and a home.",
    "At first, fear came out as snarling and snapping. When Em approached, Westley did not yet know that he could trust her.",
    "With patience, gentle head scratches, and careful grooming, Em helped him feel safer. These illustrations tell that part of his real story.",
    "Today, Westley has a family and a place to belong. His gentle PayPlace welcome comes from that journey: a soft landing for anyone who feels overwhelmed.",
    "Westley’s story proves that sometimes it takes more than one try to find where you belong … a home. You’re here now. Welcome home."
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


const westleyMemories = {
  1: { source: require("../assets/characters/westley-rescue-post.jpg"), ratio: 710 / 1536, caption: "Westley’s real rescue post · Westie Rescue of the Mid-Atlantic · January 8, 2023", label: "The original rescue post showing Westley before his bath and grooming, with his foster care and recovery update" },
  2: { source: require("../assets/characters/westley-frightened-with-em.jpg"), ratio: 1122 / 1402, caption: "Learning to feel safe · An illustrated moment from Westley’s story", label: "An illustration of frightened Westley snarling as Em patiently offers a gentle hand" },
  3: { source: require("../assets/characters/westley-trusting-em.jpg"), ratio: 1122 / 1402, caption: "A little trust, one gentle moment at a time · Illustrated", label: "An illustration of Westley accepting Em’s gentle head scratches while she carefully grooms him" },
};

export function CharacterStory({ person, onBack }) {
  const [enlarged, setEnlarged] = useState(null);
  return <><ScrollView style={s.screen} contentContainerStyle={s.story}>
    <TouchableOpacity style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to the family wall">
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.backText}>Back to the family wall</Text>
    </TouchableOpacity>
    <View style={s.storyCard}>
      <CharacterArtwork source={storyPortraits[person.id]} style={s.storyPortrait} resizeMode="contain" />
      <Text style={s.eyebrow}>MEET THE FAMILY</Text>
      <Text style={s.title} accessibilityRole="header">{person.name}</Text>
      <Text style={s.storyRole}>{person.role}</Text>
      <Text style={s.promise}>“{person.promise}”</Text>
      {person.paragraphs.map((paragraph, i) => {
        const memory = person.id === "westley" ? westleyMemories[i] : null;
        return <View key={i}>
          <Text style={[s.paragraph, person.id === "westley" && i === 0 && s.storyOpening, person.id === "westley" && i === person.paragraphs.length - 1 && s.storyClosing]}>{paragraph}</Text>
          {memory && <View style={s.memory}>
            <Pressable style={[s.memoryFrame, { aspectRatio: memory.ratio }]} accessibilityRole="button" accessibilityLabel={`Enlarge: ${memory.label}`} onPress={() => setEnlarged(memory)}>
              <Image source={memory.source} resizeMode="contain" style={s.memoryImage} accessibilityLabel={memory.label} />
            </Pressable>
            <Text style={s.caption}>{memory.caption}</Text>
            <Text style={s.imageHint}>Tap for a closer look.</Text>
          </View>}
        </View>;
      })}
    </View>
    <TouchableOpacity style={s.done} onPress={onBack} accessibilityRole="button"><Text style={s.doneText}>Back to the family wall</Text></TouchableOpacity>
  </ScrollView>
    <Modal visible={!!enlarged} animationType="fade" onRequestClose={() => setEnlarged(null)}>
      <SafeAreaView style={s.viewer}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close image and return to Westley’s story" onPress={() => setEnlarged(null)} style={s.viewerClose}><Ionicons name="close" size={26} color="#FFFFFF" /><Text style={s.viewerCloseText}>Back to Westley’s story</Text></TouchableOpacity>
        {enlarged && <><Image source={enlarged.source} style={s.viewerImage} resizeMode="contain" accessibilityLabel={enlarged.label} /><Text style={s.viewerCaption}>{enlarged.caption}</Text></>}
      </SafeAreaView>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  storyOpening: { color: "#173557", fontSize: 22, lineHeight: 30, fontWeight: "900" },
  storyClosing: { color: "#5935B5", fontSize: 19, lineHeight: 28, fontWeight: "800", padding: 15, borderRadius: 18, backgroundColor: "#EEE6FF" },
  memory: { marginTop: 16, borderRadius: 18, overflow: "hidden", backgroundColor: "#FFF8EA" },
  memoryFrame: { width: "100%", overflow: "hidden" },
  memoryImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  caption: { color: "#536077", fontSize: 13, lineHeight: 20, padding: 12, paddingBottom: 4 },
  imageHint: { color: "#5935B5", fontSize: 12, fontWeight: "800", padding: 12, paddingTop: 0 },
  viewer: { flex: 1, backgroundColor: "#173557" }, viewerClose: { flexDirection: "row", alignItems: "center", gap: 10, padding: 15, minHeight: 50 }, viewerCloseText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, viewerImage: { flex: 1, width: "100%" }, viewerCaption: { color: "#FFFFFF", fontSize: 14, lineHeight: 21, padding: 18 },
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
