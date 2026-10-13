import React, { useContext, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { PrivacyContext, Text } from "./Privacy";
import { treatFlight, TREAT_SIZE } from './treat-flight.mjs';

const artwork = require("../assets/characters/extra-paycheck-chapo-treat-rain.png");
const treats = ["🍪", "🐟", "🍪", "🦴", "🍪", "🐟", "🍪", "🦴"];
export default function ExtraPaycheckCelebration({ event, onPlan, onDismiss }) {
  const [reduceMotion, setReduceMotion] = useState(true);
  const quiet = useContext(PrivacyContext);
  const animationPaused = reduceMotion || quiet.reduceAnimation;
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const drops = useRef(treats.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    AccessibilityInfo.announceForAccessibility?.("Extra paycheck month! Chapo is celebrating with falling treats. Choose a plan for your extra check.");
    return () => { active = false; sub.remove(); };
  }, []);
  useEffect(() => {
    if (animationPaused || !layout.width || !layout.height) return;
    drops.forEach(value => value.setValue(0));
    const animations = drops.map((value, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 150),
      Animated.timing(value, { toValue: 1, duration: 1800, useNativeDriver: true }),
    ]), { iterations: 3 }));
    animations.forEach(animation => animation.start());
    return () => animations.forEach(animation => animation.stop());
  }, [animationPaused, layout.width, layout.height, drops]);
  return <View testID="extra-paycheck-celebration" style={s.overlay} accessibilityViewIsModal>
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.eyebrow}>CHAPO HAS AN ANNOUNCEMENT</Text>
        <Text accessibilityRole="header" style={s.title}>EXTRA PAYCHECK MONTH!</Text>
        <View style={s.art} onLayout={({ nativeEvent }) => setLayout({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })}>
          <Image source={artwork} style={s.image} resizeMode="contain" accessibilityLabel="Chapo in his PayPlace pajamas joyfully eating treats as cookies and fish-shaped snacks rain down in his treehouse" />
          {!animationPaused && layout.width > 0 && layout.height > 0 && drops.map((drop, i) => {
            const flight = treatFlight(layout.width, layout.height, i);
            return <Animated.Text key={i} accessible={false} allowFontScaling={false} pointerEvents="none" style={[s.treat, {
            left: flight.startLeft,
            opacity: drop.interpolate({ inputRange: [0, 0.12, 0.9, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-TREAT_SIZE, flight.translateY] }) },
              { translateX: drop.interpolate({ inputRange: [0, 1], outputRange: [0, flight.translateX] }) },
              { scale: drop.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0.25] }) },
            ],
          }]}>{treats[i]}</Animated.Text>;
          })}
        </View>
        <Text style={s.quote}>“It’s raining treats! I’ll handle these. You handle the extra check.” — Chapo</Text>
        <Text style={s.amount}>{Number(event.amount || 0).toLocaleString("en-US", { style: "currency", currency: "USD" })} estimated · {event.date}</Text>
        <Text style={s.question}>What would you like this check to do?</Text>
        <Text style={s.body}>Bills · Debt · Buffer · A little guilt-free joy</Text>
        <TouchableOpacity testID="celebration-plan" accessibilityRole="button" onPress={onPlan} style={s.button}><Text style={s.buttonText}>Give this check a plan</Text></TouchableOpacity>
        <TouchableOpacity testID="celebration-dismiss" accessibilityRole="button" onPress={onDismiss} style={s.secondary}><Text style={s.secondaryText}>View my calendar</Text></TouchableOpacity>
      </View>
    </ScrollView>
  </View>;
}
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "#17213CED", zIndex: 10 }, content: { flexGrow: 1, justifyContent: "center", padding: 16, paddingVertical: 24 }, card: { backgroundColor: "#FFF9E8", borderRadius: 27, padding: 18, borderWidth: 3, borderColor: "#FFD65E", width: "100%", maxWidth: 600, alignSelf: "center" },
  eyebrow: { color: "#5935B5", fontSize: 11, fontWeight: "900", textAlign: "center", letterSpacing: 1 }, title: { color: "#173557", fontSize: 27, lineHeight: 33, fontWeight: "900", textAlign: "center", marginTop: 8 },
  art: { width: "100%", aspectRatio: 1.5, borderRadius: 18, overflow: "hidden", marginTop: 16, backgroundColor: "#C8F4EC" }, image: { width: "100%", height: "100%" }, treat: { position: "absolute", top: 0, width: TREAT_SIZE, height: TREAT_SIZE, fontSize: 22, lineHeight: TREAT_SIZE, textAlign: 'center', includeFontPadding: false },
  quote: { color: "#5935B5", fontWeight: "800", fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 14 }, amount: { color: "#394860", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 }, question: { color: "#173557", fontSize: 19, fontWeight: "900", lineHeight: 26, textAlign: "center", marginTop: 16 }, body: { color: "#536077", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 6 },
  button: { backgroundColor: "#5935B5", borderRadius: 15, minHeight: 50, alignItems: "center", justifyContent: "center", marginTop: 16, padding: 12 }, buttonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800", textAlign: "center" }, secondary: { minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 6, padding: 10 }, secondaryText: { color: "#5935B5", fontSize: 14, fontWeight: "800" },
});
