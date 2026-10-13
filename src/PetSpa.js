import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SPA_SCENES, nextSpaScene, spaCanPlay } from './spa-scenes.mjs';

const artwork = [
  require('../assets/characters/spa-welcome.png'),
  require('../assets/characters/spa-westley-secret.png'),
  require('../assets/characters/spa-chapo-cookie-cleanup.png'),
  require('../assets/characters/spa-bobbie-jacuzzi.png'),
  require('../assets/characters/spa-glamour-and-tate.png'),
];

function SpaAtmosphere({ playing, kind }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    progress.setValue(0);
    if (!playing) return undefined;
    const loop = Animated.loop(Animated.timing(progress, { toValue: 1, duration: kind === 'dryer' ? 2600 : 5500, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [playing, kind, progress]);
  if (!playing) return null;
  return <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
    {[0, 1, 2, 3, 4].map(i => <Animated.View key={i} style={[s.bubble, {
      left: `${16 + i * 17}%`, bottom: `${8 + (i % 3) * 12}%`,
      width: kind === 'dryer' ? 38 : 10 + i * 4, height: kind === 'dryer' ? 3 : 10 + i * 4,
      opacity: progress.interpolate({ inputRange: [0, 0.2, 0.75, 1], outputRange: [0, 0.6, 0.4, 0] }),
      transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -35 - i * 5] }) },
        { translateX: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, kind === 'dryer' ? 22 : 7, 0] }) }],
    }]} />)}
  </View>;
}

export default function PetSpa({ onHome, obscured = false }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [focused, setFocused] = useState(true);
  const [reply, setReply] = useState('');
  const playing = spaCanPlay({ paused, reducedMotion, active, focused: focused && !obscured });
  const scene = SPA_SCENES[index];
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReducedMotion(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    const app = AppState.addEventListener('change', state => setActive(state === 'active'));
    const blur = Platform.OS === 'android' ? AppState.addEventListener('blur', () => setFocused(false)) : null;
    const focus = Platform.OS === 'android' ? AppState.addEventListener('focus', () => setFocused(true)) : null;
    return () => { mounted = false; motion.remove(); app?.remove(); blur?.remove(); focus?.remove(); };
  }, []);
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => { setIndex(current => nextSpaScene(current)); setReply(''); }, 12000);
    return () => clearInterval(timer);
  }, [playing, index]);
  const choose = next => { setIndex(next); setReply(''); setPaused(true); };
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <TouchableOpacity accessibilityRole="button" onPress={onHome} style={s.back}><Text style={s.backText}>‹ Back to the neighborhood</Text></TouchableOpacity>
    <Text style={s.eyebrow}>A LITTLE CARE GOES A LONG WAY</Text>
    <Text accessibilityRole="header" style={s.title}>Em’s Pet Spa</Text>
    <Text style={s.body}>Fresh towels, fabulous blow-outs, and all the love. Come see who is being pampered today.</Text>
    <View style={s.card}>
      <View style={{ width: '100%', aspectRatio: scene.ratio, overflow: 'hidden', borderRadius: 18 }}>
        <Image source={artwork[index]} resizeMode="contain" style={StyleSheet.absoluteFillObject} accessibilityLabel={`${scene.title}. ${scene.caption}`} />
        <SpaAtmosphere playing={playing} kind={scene.motion} />
      </View>
      <Text style={s.sceneTitle} accessibilityRole="header">{scene.title}</Text>
      <Text style={s.body}>{scene.caption}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => { setPaused(true); setReply(scene.reply); }} style={s.action}><Text style={s.actionText}>{scene.action}</Text></TouchableOpacity>
      {!!reply && <Text accessibilityLiveRegion="polite" style={s.reply}>{reply}</Text>}
      <View style={s.controls}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Previous spa scene" onPress={() => choose(nextSpaScene(index, -1))} style={s.control}><Text style={s.controlText}>‹ Previous</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={paused ? 'Resume spa scenes' : 'Pause spa scenes'} accessibilityState={{ disabled: reducedMotion }} disabled={reducedMotion} onPress={() => setPaused(value => !value)} style={[s.control, reducedMotion && { opacity: 0.6 }]}><Text style={s.controlText}>{reducedMotion ? 'Motion off' : paused ? 'Play' : 'Pause'}</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Next spa scene" onPress={() => choose(nextSpaScene(index))} style={s.control}><Text style={s.controlText}>Next ›</Text></TouchableOpacity>
      </View>
      <Text style={s.hint}>{index + 1} of {SPA_SCENES.length} · {reducedMotion ? 'Choose a scene below. Your reduced-motion setting is on.' : paused ? 'Taking our time. Tap Play to rotate scenes.' : 'A new little moment every 12 seconds.'}</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scenePicker}>
      {SPA_SCENES.map((item, i) => <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityLabel={`Show ${item.title}`} accessibilityState={{ selected: i === index }} onPress={() => choose(i)} style={[s.thumbnail, i === index && s.selected]}>
        <Image source={artwork[i]} resizeMode="contain" style={s.thumbImage} accessible={false} />
        <Text style={s.thumbText}>{['Em & family', 'Westley', 'Chapo', 'Bobbie', 'Tate'][i]}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <Text style={s.footer}>You don’t have to accomplish anything here. Sometimes a little neighborhood joy is enough.</Text>
  </ScrollView>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF8F2' }, content: { padding: 18, gap: 12, paddingBottom: 26 },
  back: { minHeight: 48, justifyContent: 'center' }, backText: { color: '#6651AB', fontWeight: '800', fontSize: 15 },
  eyebrow: { color: '#A52167', fontWeight: '900', fontSize: 11, letterSpacing: 1.2 }, title: { color: '#173557', fontSize: 30, fontWeight: '900' },
  body: { color: '#34465E', fontSize: 15, lineHeight: 23 }, card: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 24, gap: 12, borderWidth: 1, borderColor: '#F7CDE0' },
  sceneTitle: { color: '#173557', fontSize: 21, fontWeight: '900' }, action: { backgroundColor: '#A52167', padding: 15, minHeight: 48, borderRadius: 15 }, actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  reply: { backgroundColor: '#FFF0F6', color: '#812653', padding: 14, borderRadius: 14, fontSize: 16, lineHeight: 24 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, control: { flexGrow: 1, backgroundColor: '#F0EAFE', borderRadius: 13, padding: 12, minHeight: 48, justifyContent: 'center' }, controlText: { color: '#51398D', fontWeight: '800', textAlign: 'center' },
  hint: { color: '#556277', fontSize: 12, lineHeight: 18 }, scenePicker: { gap: 10, paddingVertical: 4 }, thumbnail: { width: 108, padding: 6, borderWidth: 2, borderColor: '#E5DCE6', borderRadius: 16, backgroundColor: '#FFFFFF' }, selected: { borderColor: '#A52167', backgroundColor: '#FFF0F6' }, thumbImage: { width: '100%', height: 85, borderRadius: 10 }, thumbText: { fontSize: 13, color: '#34465E', fontWeight: '800', textAlign: 'center', padding: 5 },
  footer: { color: '#6651AB', fontSize: 14, lineHeight: 22, textAlign: 'center' }, bubble: { position: 'absolute', borderRadius: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(180,233,255,0.16)' },
});
