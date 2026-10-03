import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Alert from "./alert";

async function shareNeighborhood() {
  if (Platform.OS !== "web") return;
  const url = window.location.origin + "/";
  if (navigator.share) {
    try {
      await navigator.share({ title: "Welcome home to PayPlace", text: "Our neighborhood is still under construction, but we're so glad you came home to visit. 💜", url });
      return;
    } catch (error) { if (error.name === "AbortError") return; }
  }
  try {
    await navigator.clipboard.writeText(url);
    Alert.alert("Invitation copied", "The PayPlace link is ready to share with a neighbor.");
  } catch { Alert.alert("Invite a neighbor", url); }
}

export default function ConstructionNotice() {
  const [expanded, setExpanded] = useState(false);
  return <View style={s.notice}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Early preview details" accessibilityState={{ expanded }} onPress={() => setExpanded(!expanded)} style={s.heading}>
      <Ionicons name="construct-outline" size={17} color="#8B5816" /><Text style={s.title}>Early preview · Some numbers are samples</Text><Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={17} color="#8B5816" />
    </TouchableOpacity>
    {expanded && <>
      <Text style={s.body}>Our neighborhood is still under construction, but we appreciate you coming home to visit. 💜</Text>
      <Text style={s.caption}>Some features are still being built. Replace sample numbers with your own in Budget.</Text>
      {Platform.OS === "web" && <TouchableOpacity accessibilityRole="button" onPress={shareNeighborhood} style={s.share}><Ionicons name="share-social-outline" size={17} color="#5D3BB5" /><Text style={s.shareText}>Invite a neighbor</Text></TouchableOpacity>}
    </>}
  </View>;
}

const s = StyleSheet.create({
  notice: { backgroundColor: "#FFF6DD", borderWidth: 1, borderColor: "#EAD394", borderRadius: 13, paddingHorizontal: 12, gap: 7 },
  heading: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 46 }, title: { flex: 1, color: "#684514", fontSize: 12, fontWeight: "700", lineHeight: 17 },
  body: { color: "#594C35", fontSize: 14, lineHeight: 20 }, caption: { color: "#75664B", fontSize: 12, lineHeight: 17, marginBottom: 10 },
  share: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 9, paddingRight: 10 },
  shareText: { color: "#5D3BB5", fontSize: 14, fontWeight: "800" },
});
