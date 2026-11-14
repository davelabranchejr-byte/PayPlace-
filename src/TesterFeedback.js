import { MascotPressable as Pressable } from './MascotTouchable';
import React, { useState } from "react";
import { Linking, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from "./Privacy";
import FittedArtwork from "./FittedArtwork";
import { Ionicons } from "@expo/vector-icons";

// Only release/platform details go into the draft. Never include the saved plan.
const body = [
  "PayPlace 1.0.0 · Build number (from TestFlight):",
  `Platform: ${Platform.OS}`,
  "Phone model and OS version:",
  "Screen or button:",
  "What I expected:",
  "What happened:",
  "Steps to reproduce (use fictional amounts):",
].join("\n\n");
const feedbackURL = `https://github.com/davelabranchejr-byte/PayPlace-/issues/new?title=${encodeURIComponent("PayPlace beta feedback")}&body=${encodeURIComponent(body)}`;

export default function TesterFeedback({ onClose }) {
  const [visible, setVisible] = useState(!!onClose);
  const [error, setError] = useState("");
  const close = onClose ?? (() => setVisible(false));
  async function openDraft() {
    setError("");
    try { await Linking.openURL(feedbackURL); }
    catch { setError("Could not open feedback. Try again, or use Send Beta Feedback in TestFlight."); }
  }
  return <>
    {!onClose && <Pressable artworkMode="integrated" accessibilityRole="button" accessibilityLabel="Beta feedback and testing tips"
      onPress={() => { setError(""); setVisible(true); }} style={s.entry}>
      <FittedArtwork source={require('../assets/characters/neighborhood-tabby.png')} aspectRatio={3 / 2} resizeMode="cover" accessible={false}/>
      <View style={s.caption}><Text style={s.entryText}>Help make the neighborhood better</Text>
        <Text accessible={false} style={s.chevron}>›</Text></View>
    </Pressable>}
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close beta feedback"
            onPress={close} style={s.close}>
            <Ionicons name="close" size={26} color="#173557" />
          </Pressable>
          <Text style={s.title} accessibilityRole="header">Your visit helps us grow</Text>
          <Text style={s.body}>Notice something confusing or have an idea? Tell Daddy which screen you visited, what you expected, and what happened.</Text>
          <Text style={s.heading}>A few places to explore</Text>
          <Text style={s.body}>Open every family portrait, tap Em’s paw-print picture, and visit the quilt. Try entering cents in Budget, planning an extra check, and asking Bobbie’s mirror about a pretend purchase.</Text>
          <Text style={s.heading}>Explore Bills & Banking</Text>
          <Text style={s.body}>Look for How Home works, How Bills works and the matching help button on every bottom tab. Open the instructions and return to the same tab. Every Premium feature now starts with How this works; hide and show its numbered steps. Connect sample accounts directly from a feature without leaving it. A disabled simulation should explain the missing connection, paused switch, zero amount, reached cap or completed goal beside the button.</Text>
          <Text style={s.body}>Tap every illustrated feature and check Back to Premium. In Account connections & beta setup, connect the fictional sample accounts. Turn round-ups on and off, save a cap and simulate purchases. Save a Life Happens goal, try a sample payday and an emergency, compare Bill Shock recovery plans, review the catch-up plan, refresh sample Money Watch alerts and explore the fictional credit score.</Text>
          <Text style={s.body}>Reopen the app and check that your preferences remain. Disconnect sample accounts and confirm automation pauses. Reset sample activity and check that your saved budget and bills stay intact. Sample balances, alerts and scores are fictional: this beta does not move money, pay bills or retrieve credit reports.</Text>
          <Text style={s.body}>Look for Bobbie’s diamond tiara, colorful gala gown and jewels in the upper right. The logo should match the locked original: white P, paw with teal checkmark, and teal, yellow, purple and coral sections. Report clipped artwork, small-screen or larger-text issues, missing images and buttons that do nothing.</Text>
          <Text style={s.heading}>Send feedback</Text>
          <Text style={s.body}>On iPhone, TestFlight’s Send Beta Feedback lets you share feedback privately with the developer.</Text>
          <Text style={s.body}>You can also open a GitHub feedback draft below. GitHub issues are public and require a GitHub account. Use fictional examples and hide personal details in screenshots.</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Open public GitHub feedback draft"
            onPress={openDraft} style={s.button}><Text style={s.buttonText}>Open feedback draft</Text></Pressable>
          {!!error && <Text accessibilityLiveRegion="polite" style={s.error}>{error}</Text>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  entry: { overflow: "hidden", marginTop: 18, borderRadius: 28, backgroundColor: "#DCABFF", borderWidth: 3, borderColor: "#9F3DE5" },
  entryText: { flexGrow: 1, flexShrink: 1, flexBasis: 88, color: "#071A3A", fontSize: 22, lineHeight: 28, fontWeight: "900" },
  caption: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12 },
  chevron: { color: "#FFFFFF", backgroundColor: "#8734CF", borderColor: "#FFFFFF", borderWidth: 2, borderRadius: 20, width: 32, height: 40, textAlign: "center", fontSize: 28, lineHeight: 37, fontWeight: "900" },
  safe: { flex: 1, backgroundColor: "#FFF8EA" },
  content: { padding: 20, paddingBottom: 40, width: "100%", maxWidth: 720, alignSelf: "center" },
  close: { alignSelf: "flex-end", width: 48, height: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#F2ECFF", borderRadius: 24 },
  title: { color: "#173557", fontSize: 26, fontWeight: "900", marginTop: 12 },
  heading: { color: "#173557", fontSize: 20, fontWeight: "800", marginTop: 24 },
  body: { color: "#526177", fontSize: 16, lineHeight: 25, marginTop: 12 },
  button: { backgroundColor: "#6754C5", minHeight: 48, padding: 16, borderRadius: 16, alignItems: "center", marginTop: 18 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", textAlign: "center" },
  error: { color: "#96345F", fontSize: 15, lineHeight: 23, marginTop: 14 },
});
