import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useState } from "react";
import { Image, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { Text } from "./Privacy";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import Alert from "./alert";
import { FACEBOOK_NEIGHBORHOOD_URL } from "./FacebookNeighborhood";
import { quiltMilestones } from "./quilt-milestones.mjs";

// Extract views of the approved mockup without changing its fabric or artwork.
const approvedQuilt = require("../assets/characters/belonging-quilt-approved.png");
const artwork = (crop, label) => ({ source: approvedQuilt, width: 851, height: 1847, crop, label });
const acorn = artwork([258, 249, 335, 337], "An embroidered golden acorn on a padded cream quilt square with floral patchwork and hand stitching");
const quiltRoom = artwork([83, 1069, 690, 327], "Annie's warm room with the colorful Belonging Quilt hanging on a wooden rail");
const patches = {
  firstBill: [require("../assets/characters/quilt-first-bill.png"), "Saved your first bill"],
  paidBill: [require("../assets/characters/quilt-paid-bill.png"), "Recorded your first bill payment"],
  foundNote: [require("../assets/characters/quilt-found-note.png"), "Found your first hidden note"],
  sentNote: [require("../assets/characters/quilt-sent-note.png"), "Sent encouragement for review"],
  savingsGoal: [require("../assets/characters/quilt-savings-goal.png"), "Set your first savings goal"],
  micropayment: [require("../assets/characters/quilt-micropayment.png"), "Logged your first extra payment"],
  plannedPayday: [require("../assets/characters/quilt-planned-payday.png"), "Planned your first payday"],
  addedSavings: [require("../assets/characters/quilt-added-savings.png"), "Added to savings"],
  paidDebt: [require("../assets/characters/quilt-paid-debt.png"), "Paid off your first debt"],
  trackedSubscription: [require("../assets/characters/quilt-tracked-subscription.png"), "Tracked your first subscription"],
  savedGrooming: [require("../assets/characters/quilt-saved-grooming.png"), "Saved your first grooming appointment"],
  borrowedBook: [require("../assets/characters/quilt-borrowed-book.png"), "Borrowed your first library book"],
  joinedFacebook: [require("../assets/characters/quilt-joined-facebook.png"), "Joined the Facebook group"],
  invitedFriend: [require("../assets/characters/quilt-invited-friend.png"), "Invited a friend"],
};

export function AcornSquare() {
  return <View style={s.firstSquare}>
    <CharacterArtwork source={acorn} style={s.acorn} resizeMode="contain" />
    <Text style={s.squareLabel}>YOUR FIRST SQUARE</Text>
  </View>;
}

export default function BelongingQuilt({ onOpen }) {
  return <TouchableOpacity artworkMode="integrated" testID="belonging-quilt-preview" accessibilityRole="button"
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

const inviteMessage = `Come visit the PayPlace neighborhood with me. Money without shame. ${FACEBOOK_NEIGHBORHOOD_URL}`;
const communitySteps = [
  { id: 'joinedFacebook', openLabel: 'Open the PayPlace Facebook group', claim: 'I joined the group',
    open: () => Linking.openURL(FACEBOOK_NEIGHBORHOOD_URL) },
  { id: 'invitedFriend', openLabel: 'Share an invitation', claim: 'I invited a friend',
    open: () => Platform.OS === 'web'
      ? Linking.openURL(`mailto:?subject=PayPlace%20Neighborhood&body=${encodeURIComponent(inviteMessage)}`)
      : Share.share({ message: inviteMessage }) },
];

export function QuiltDetail({ onBack, finance, onMilestone, backLabel = "Back to the family gallery" }) {
  const [selected, setSelected] = useState("acorn");
  const earned = quiltMilestones(finance);
  const community = onMilestone && finance?.planSource !== "Sample" ? communitySteps.filter(step => !earned.includes(step.id)) : [];
  return <ScrollView style={s.screen} contentContainerStyle={s.detail}>
    <TouchableOpacity testID="quilt-back" style={s.back} onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel}>
      <Ionicons name="arrow-back" size={21} color="#173557" /><Text style={s.footerTitle}>{backLabel}</Text>
    </TouchableOpacity>
    <View style={s.detailCard}>
      <Text style={s.eyebrow}>ANNIE'S BELONGING QUILT</Text>
      <Text style={s.title} accessibilityRole="header">You have a place here.</Text>
      <Text accessibilityRole="header" style={s.title}>Your quilt · {earned.length + 1} {earned.length ? 'squares' : 'square'}</Text>
      <Text style={s.body}>See how big your quilt can grow as you take small steps and share kindness.</Text>
      <View style={s.patchwork}>
        <Pressable accessibilityRole="button" accessibilityLabel="Your first acorn square"
          accessibilityState={{ selected: selected === "acorn" }} style={s.patch} onPress={() => setSelected("acorn")}>
          <CharacterArtwork source={acorn} style={s.patchArt} resizeMode="contain" />
        </Pressable>
        {earned.map(id => {
          const [source, label] = patches[id];
          return <Pressable key={id} style={s.patch} testID={`quilt-square-${id}`} onPress={() => setSelected(id)}
            accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: selected === id }}>
            <Image source={source} style={s.patchArt} resizeMode="contain" accessible={false} />
          </Pressable>;
        })}
      </View>
      <Text style={s.patchLabel} accessibilityLiveRegion="polite">{earned.includes(selected) ? patches[selected][1] : "Your first acorn square"}</Text>
      <Text style={s.promise}>“Belonging isn't something you earn. It's something you're given.”</Text>
      <Text style={s.signature}>Welcome home. Love, Annie.</Text>
      {community.length > 0 && <View style={s.community}>
        <Text accessibilityRole="header" style={s.footerTitle}>Grow the neighborhood</Text>
        <Text style={s.body}>Add a square after you join or invite someone.</Text>
        {community.map(step => <View key={step.id} style={s.communityRow}>
          <TouchableOpacity artworkMode="integrated" accessibilityRole="button" style={s.communityButton} onPress={async () => {
            try { await step.open(); }
            catch { Alert.alert('Try again in a moment', 'That link could not open just now.'); }
          }}><Text style={s.footerTitle}>{step.openLabel}</Text></TouchableOpacity>
          <TouchableOpacity artworkMode="integrated" accessibilityRole="button" style={s.communityButton} onPress={() => onMilestone(step.id)}>
            <Text style={s.footerTitle}>{step.claim}</Text>
          </TouchableOpacity>
        </View>)}
      </View>}
    </View>
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
  promise: { fontSize: 20, lineHeight: 28, color: "#3D7A62", fontWeight: "800", textAlign: "center", marginTop: 6 },
  signature: { fontSize: 17, color: "#735940", fontStyle: "italic", textAlign: "center", marginTop: 18 },
  community: { marginTop: 20, gap: 4 },
  communityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  communityButton: { minHeight: 48, justifyContent: "center", padding: 10, borderRadius: 10, backgroundColor: "#F3E3FF" },
  patchwork: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 4, marginTop: 14, padding: 6, borderRadius: 12, backgroundColor: "#E4CCA7" },
  patch: { width: "31%", maxWidth: 160, borderRadius: 4, overflow: "hidden", backgroundColor: "#FFF9EB" },
  patchArt: { width: "100%", aspectRatio: 1 },
  patchLabel: { color: "#173557", fontSize: 14, fontWeight: "800", textAlign: "center", padding: 7 },

});
