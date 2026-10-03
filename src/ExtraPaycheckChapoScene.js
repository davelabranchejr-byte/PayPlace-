import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CharacterArtwork from "./CharacterArtwork";
import PayPlaceBrand from "./PayPlaceBrand";
import { portraits } from "./characters";

export default function ExtraPaycheckChapoScene() {
  return (
    <View style={s.scene} accessibilityLabel="Chapo excitedly ordering snacks from BellyBox on a glowing laptop at night">
      <View style={s.roomGlow} />
      <View style={s.window}>
        <Text style={s.star}>✦</Text>
        <Text style={[s.star, { left: 28, top: 14 }]}>·</Text>
        <Text style={[s.star, { right: 18, top: 24 }]}>✧</Text>
      </View>

      <View style={s.chapoWrap}>
        <CharacterArtwork source={portraits.chapo} style={s.chapo} resizeMode="contain" accessibilityLabel={portraits.chapo.label} />
      </View>

      <View style={s.laptop}>
        <View style={s.laptopScreen}>
          <Text style={s.bellyBox}>BellyBox</Text>
          <Text style={s.bellyTag}>snacks delivered</Text>
          <View style={s.snackRow}>
            <View style={s.snackPill}><Text style={s.snackEmoji}>🍿</Text><Text style={s.snackText}>Crunch</Text></View>
            <View style={s.snackPill}><Text style={s.snackEmoji}>🍪</Text><Text style={s.snackText}>Cookies</Text></View>
          </View>
          <View style={s.cartButton}>
            <Ionicons name="cart" size={13} color="#FFFFFF" />
            <Text style={s.cartText}>ORDER SNACKS</Text>
          </View>
        </View>
        <View style={s.keyboard} />
      </View>

      <View style={s.lickBubble}>
        <Text style={s.lickText}>extra paycheck detected</Text>
        <Text style={s.lickSub}>Chapo has entered the chat.</Text>
      </View>

      <View style={s.brandBadge}>
        <PayPlaceBrand compact light />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  scene: { width: "100%", height: "100%", minHeight: 185, overflow: "hidden", position: "relative", backgroundColor: "#11172A" },
  roomGlow: { position: "absolute", width: 260, height: 210, borderRadius: 130, backgroundColor: "#5FE7D0", opacity: 0.13, right: -55, bottom: -30 },
  window: { position: "absolute", right: 16, top: 14, width: 82, height: 58, borderRadius: 12, backgroundColor: "#17294A", borderWidth: 2, borderColor: "#31476A" },
  star: { position: "absolute", color: "#FFF1A8", fontSize: 16, top: 6, left: 10 },
  chapoWrap: { position: "absolute", left: 0, bottom: 3, width: "48%", height: "94%" },
  chapo: { width: "100%", height: "100%" },
  laptop: { position: "absolute", right: 10, bottom: 18, width: "58%", height: 142, alignItems: "center" },
  laptopScreen: { width: "100%", height: 116, borderRadius: 12, backgroundColor: "#DDFCF8", borderWidth: 5, borderColor: "#2D3345", padding: 10, shadowColor: "#7FF9E8", shadowOpacity: 0.9, shadowRadius: 20, shadowOffset: { width: 0, height: 0 } },
  bellyBox: { color: "#6754C5", fontSize: 18, fontWeight: "900" },
  bellyTag: { color: "#173557", fontSize: 9, fontWeight: "800", marginTop: -2 },
  snackRow: { flexDirection: "row", gap: 6, marginTop: 9 },
  snackPill: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 9, paddingVertical: 5, paddingHorizontal: 6, alignItems: "center" },
  snackEmoji: { fontSize: 13 },
  snackText: { color: "#173557", fontSize: 8, fontWeight: "900" },
  cartButton: { alignSelf: "stretch", marginTop: 7, minHeight: 25, borderRadius: 8, backgroundColor: "#6754C5", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  cartText: { color: "#FFFFFF", fontSize: 8, fontWeight: "900", letterSpacing: 0.4 },
  keyboard: { width: "112%", height: 16, marginTop: -1, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, backgroundColor: "#6B7182", transform: [{ perspective: 80 }, { rotateX: "12deg" }] },
  lickBubble: { position: "absolute", left: 10, top: 10, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, maxWidth: "53%" },
  lickText: { color: "#B25B4A", fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  lickSub: { color: "#173557", fontSize: 9, fontWeight: "800", marginTop: 2 },
  brandBadge: { position: "absolute", right: 10, top: 10 },
});
