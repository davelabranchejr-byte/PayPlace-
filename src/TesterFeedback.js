import React, { useState } from "react";
import { Image, Linking, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
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

export default function TesterFeedback() {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  async function openDraft() {
    setError("");
    try { await Linking.openURL(feedbackURL); }
    catch { setError("Could not open feedback. Try again, or use Send Beta Feedback in TestFlight."); }
  }
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Beta feedback and testing tips"
      onPress={() => { setError(""); setVisible(true); }} style={s.entry}>
      <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6754C5" />
      <Text style={s.entryText}>Help make the neighborhood better</Text>
    </Pressable>
    <View style={s.daddyPreview}>
      <Image source={require('../assets/characters/daddy-neighborhood-feedback.png')} style={s.daddyArtwork} resizeMode="contain"
        accessibilityLabel="Daddy gathers neighborhood ideas beside a purple suggestion box and a miniature treehouse village" />
    </View>
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close beta feedback"
            onPress={() => setVisible(false)} style={s.close}>
            <Ionicons name="close" size={26} color="#173557" />
          </Pressable>
          <Text style={s.title} accessibilityRole="header">Your visit helps us grow</Text>
          <Text style={s.body}>Notice something confusing or have an idea? Tell Daddy which screen you visited, what you expected, and what happened.</Text>
          <Text style={s.heading}>A few places to explore</Text>
          <Text style={s.body}>Open every family portrait, tap Em’s paw-print picture, and visit the quilt. Try entering cents in Budget, planning an extra check, and asking Bobbie’s mirror about a pretend purchase.</Text>
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
  entry: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, padding: 16, marginTop: 18, borderRadius: 18, backgroundColor: "#F2ECFF" },
  entryText: { flex: 1, color: "#6754C5", fontSize: 15, fontWeight: "800" },
  daddyPreview: { width: "100%", maxWidth: 240, height: 160, alignSelf: "center", marginTop: 12, borderRadius: 18, overflow: "hidden", backgroundColor: "#F2ECFF" },
  daddyArtwork: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
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
