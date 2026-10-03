import React, { useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

const scene = require("../assets/characters/annie-red-door-village.png");
const sceneWidth = 1672;
const sceneHeight = 941;
// Bounds include each house's roof, balcony, and painted destination sign.
const houses = [
  { id: "bills", label: "Post Office — Bills", bounds: [332, 208, 270, 205], tab: "Bills" },
  { id: "budget", label: "Budget Studio — Plan your budget", bounds: [30, 323, 295, 185], tab: "Budget" },
  { id: "debt", label: "Debt Tree Climb — Your payoff plan", bounds: [895, 218, 304, 201], tab: "Debt" },
  { id: "calm", label: "Calm Garden — Take a breath", bounds: [1330, 525, 342, 210], tab: "Calm" },
  { id: "subscriptions", label: "Detective Clubhouse — Review subscriptions and recurring bills", bounds: [1325, 323, 347, 198], tab: "Bills", hint: "Opens your bills for reviewing recurring charges." },
  { id: "safe-to-spend", label: "Safe to Spend Café — Today's spending guide", bounds: [22, 512, 325, 217] },
  { id: "annie", label: "Great Annie — Open her red door", bounds: [685, 550, 170, 257] },
];

export default function NeighborhoodMap({ switchTab, onOpenAnnie, onSafeToSpend }) {
  const [viewportWidth, setViewportWidth] = useState(0);
  const scroll = useRef(null);
  // Keep houses comfortably tappable instead of shrinking the entire village
  // to the phone width. Wider screens can show the full map at once.
  const width = Math.max(720, viewportWidth);

  useEffect(() => {
    if (viewportWidth) scroll.current?.scrollTo({ x: (width - viewportWidth) / 2, y: 0, animated: false });
  }, [width, viewportWidth]);

  return (
    <View style={styles.frame} onLayout={({ nativeEvent: { layout } }) => setViewportWidth(layout.width)}>
      <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator nestedScrollEnabled bounces={false}>
        <View style={{ width, height: width * sceneHeight / sceneWidth }}>
          <Image source={scene} style={StyleSheet.absoluteFillObject} resizeMode="stretch" accessible={false} pointerEvents="none" />
          {houses.map(({ id, label, bounds: [x, y, w, h], tab, hint }) => (
            <Pressable
              key={id}
              testID={`treehouse-${id}`}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityHint={hint}
              style={({ pressed }) => ({ position: "absolute", left: x / sceneWidth * width, top: y / sceneWidth * width, width: w / sceneWidth * width, height: h / sceneWidth * width, borderRadius: 12, backgroundColor: pressed ? "rgba(255,255,255,0.2)" : "transparent", borderWidth: pressed ? 2 : 0, borderColor: "#FFFFFF" })}
              onPress={() => tab ? switchTab(tab) : id === "annie" ? onOpenAnnie() : onSafeToSpend()}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden", borderRadius: 24, backgroundColor: "#153F35", marginBottom: 10 },
});
