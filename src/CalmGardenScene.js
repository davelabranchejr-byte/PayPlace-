import React, { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Easing, Image, StyleSheet, Text, View } from "react-native";

const sunset = require("../assets/characters/annie-backyard-sunset.png");
const night = require("../assets/characters/annie-backyard-night.png");
const isNighttime = () => {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
};
const fireflies = [[10, 27], [24, 45], [76, 30], [88, 49], [16, 70], [66, 63], [45, 78], [81, 82], [35, 55]];
const lights = [[7, 10], [17, 14], [26, 16], [69, 12], [81, 8], [93, 4]];
const visitors = [
  { left: 12, top: 28, symbol: "🐦" },
  { left: 78, top: 23, symbol: "🐦" },
  { left: 23, top: 47, symbol: "🦋" },
  { left: 73, top: 55, symbol: "🦋" },
];

function GardenVisitor({ left, top, symbol, index, glow, still }) {
  const progress = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (still) { progress.setValue(0.5); return; }
    const duration = 2800 + index * 420;
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [index, still, progress]);
  return (
    <Animated.View style={[s.visitor, {
      left: `${left}%`, top: `${top}%`,
      opacity: glow ? progress.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) : 1,
      transform: [
        { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-14, 14] }) },
        { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [6, -12] }) },
        { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] }) },
      ],
    }]}>
      {glow ? <View style={s.firefly} /> : <Text style={s.flying}>{symbol}</Text>}
    </Animated.View>
  );
}

function BackyardScene() {
  const [isNight, setIsNight] = useState(isNighttime);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === "active");
  const twinkle = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setReducedMotion(value);
    }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    const app = AppState.addEventListener("change", state => {
      setActive(state === "active");
      if (state === "active") setIsNight(isNighttime());
    });
    const timer = setInterval(() => setIsNight(isNighttime()), 60000);
    return () => { mounted = false; motion.remove(); app.remove(); clearInterval(timer); };
  }, []);
  const still = reducedMotion || !active;
  useEffect(() => {
    if (!isNight || still) { twinkle.setValue(0.5); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(twinkle, { toValue: 1, duration: 1900, useNativeDriver: true }),
      Animated.timing(twinkle, { toValue: 0, duration: 2300, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [isNight, still, twinkle]);
  return (
    <View style={s.scene}>
      <Image source={isNight ? night : sunset} style={StyleSheet.absoluteFillObject} resizeMode="cover"
        accessibilityLabel={isNight
          ? "Annie's fenced backyard at night, with glowing string lights and fireflies among the flowers"
          : "Annie's fenced backyard at sunset, with birds and butterflies flying above the flowers"} />
      <View pointerEvents="none" style={StyleSheet.absoluteFillObject} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {isNight ? (
          <>
            {fireflies.map(([left, top], index) => <GardenVisitor key={`firefly-${index}`} left={left} top={top} index={index} glow still={still} />)}
            {lights.map(([left, top], index) => (
              <Animated.View key={`light-${index}`} style={[s.light, {
                left: `${left}%`, top: `${top}%`,
                opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: index % 2 ? [0.7, 0.15] : [0.15, 0.7] }),
              }]} />
            ))}
          </>
        ) : visitors.map((visitor, index) => <GardenVisitor key={`visitor-${index}`} {...visitor} index={index} still={still} />)}
      </View>
    </View>
  );
}
const westleyScenes = {
  "westley-01": require("../assets/characters/westley-pearl-01.png"),
  "westley-02": require("../assets/characters/westley-pearl-02.png"),
  "westley-03": require("../assets/characters/westley-pearl-03.png"),
  "westley-04": require("../assets/characters/westley-pearl-04.png"),
  "westley-05": require("../assets/characters/westley-pearl-05.png"),
  "westley-06": require("../assets/characters/westley-pearl-06.png"),
  "westley-07": require("../assets/characters/westley-pearl-07.png"),
  "westley-08": require("../assets/characters/westley-pearl-08.png"),
  "westley-09": require("../assets/characters/westley-pearl-09.png"),
  "westley-10": require("../assets/characters/westley-pearl-10.png"),
  "westley-11": require("../assets/characters/westley-pearl-11.png"),
  "westley-12": require("../assets/characters/westley-pearl-12.png"),
  "westley-13": require("../assets/characters/westley-pearl-13.png"),
  "westley-14": require("../assets/characters/westley-pearl-14.png"),
  "westley-15": require("../assets/characters/westley-pearl-15.png"),
  "westley-16": require("../assets/characters/westley-pearl-16.png"),
};

export default function CalmGardenScene({ pearl }) {
  const westleyScene = westleyScenes[pearl?.id];
  if (westleyScene) {
    return <Image source={westleyScene} style={[s.scene, { backgroundColor: "#E0F6F1" }]} resizeMode="contain" accessibilityLabel={`Westley — ${pearl.title}`} />;
  }
  return <BackyardScene />;
}

const s = StyleSheet.create({
  scene: { width: "100%", height: "100%", overflow: "hidden", backgroundColor: "#183A35" },
  visitor: { position: "absolute" },
  flying: { fontSize: 18 },
  firefly: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFA0", shadowColor: "#F9FF6C", shadowOpacity: 1, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } },
  light: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFF3AD", shadowColor: "#FFD65D", shadowOpacity: 1, shadowRadius: 9, shadowOffset: { width: 0, height: 0 } },
});
