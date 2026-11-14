import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Privacy';

// A clockwise quarter turn, with three fireflies forming the arrowhead.
const fireflies = [[28, 8], [35, 8], [42, 11], [48, 15], [52, 21], [55, 28], [56, 35],
  [48, 30], [52, 34], [56, 39], [60, 34], [63, 29]];

export default function MapRotationCue({ canRotate, reduceAnimation, onPress }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [systemReduced, setSystemReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted) setSystemReduced(value);
    }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduced);
    const app = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);

  const animate = canRotate && active && !reduceAnimation && !systemReduced;
  useEffect(() => {
    if (!animate) return undefined;
    progress.setValue(0);
    const glow = Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 1450, useNativeDriver: true }),
      Animated.delay(650),
    ]), { iterations: 3 });
    glow.start();
    return () => glow.stop();
  }, [animate, progress]);

  return <Pressable accessibilityRole="button" testID="map-rotation-cue"
    accessibilityLabel="Show the whole neighborhood map"
    accessibilityHint={canRotate ? 'Tap for the full map, or turn your phone sideways.' : undefined}
    onPress={onPress} style={({ pressed }) => [s.cue, pressed && s.pressed]}>
    <View style={s.icon} accessible={false} importantForAccessibility="no-hide-descendants">
      <Ionicons name={canRotate ? 'phone-portrait-outline' : 'map-outline'} size={31} color="#FFF4C9"
        style={canRotate ? s.phone : undefined} />
      {canRotate && fireflies.map(([left, top], index) => {
        const arrival = Math.min(index, 7) * 0.09;
        const opacity = animate ? progress.interpolate({
          inputRange: [0, arrival + 0.15, arrival + 0.31, 1],
          outputRange: [0.48, 1, 0.82, 0.82],
        }) : 0.95;
        return <Animated.View key={left + ':' + top} testID="map-rotation-firefly"
          style={[s.firefly, { left, top, opacity }]} />;
      })}
    </View>
    <View style={s.copy}>
      <Text style={s.title}>{canRotate ? 'Turn your phone sideways' : 'See the full neighborhood'}</Text>
      {canRotate && <Text style={s.subtitle}>Or tap to see the whole map</Text>}
    </View>
  </Pressable>;
}

const s = StyleSheet.create({
  cue: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center', width: '100%',
    maxWidth: 460, paddingVertical: 5, paddingHorizontal: 12, minHeight: 58,
    backgroundColor: '#123440', borderColor: '#E8C96D', borderWidth: 1, borderRadius: 16 },
  pressed: { backgroundColor: '#215063' },
  icon: { width: 69, height: 46, justifyContent: 'center', alignItems: 'center' },
  phone: { position: 'absolute', left: 11, top: 9, transform: [{ rotate: '-19deg' }] },
  firefly: { position: 'absolute', width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFF1A6',
    shadowColor: '#FFD34F', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  copy: { flex: 1 },
  title: { color: '#FFF4C9', fontSize: 16, fontWeight: '900' },
  subtitle: { color: '#EDF7F7', fontSize: 13, paddingTop: 2 },
});
