import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import FittedArtwork from './FittedArtwork';
const glass = require('../assets/characters/bobbie-question-glass.png');
export default function QuestionGlass({ api, count, visible = true, onBack, onAuthError, onDraw }) {
  const [chosen, setChosen] = useState(null), [drawing, setDrawing] = useState(false), [error, setError] = useState('');
  const requestId = useRef(null), pending = useRef(false), active = useRef(true), reveal = useRef(new Animated.Value(0)).current;
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function draw() {
    if (pending.current) return;
    pending.current = true; setDrawing(true); setError(''); setChosen(null); reveal.setValue(0);
    // A network retry reuses the same draw instead of consuming another slip.
    if (!requestId.current) requestId.current = Crypto.randomUUID();
    try {
      const result = await api('glass-draw', { requestId: requestId.current });
      if (!active.current) return;
      setChosen(result.question); requestId.current = null;
      Animated.timing(reveal, { toValue: 1, duration: 650, useNativeDriver: true }).start();
      onDraw?.();
    } catch (failure) { if (active.current) { setError(failure.message); if (failure.signIn) onAuthError(failure); } }
    finally { pending.current = false; if (active.current) setDrawing(false); }
  }
  const palette = ['#FFCEE8', '#C5F5F0', '#FBE7A4', '#E7D4FF', '#FFD3C1'];
  const paper = chosen ? palette[parseInt(chosen.id.slice(0, 2), 16) % palette.length || 0] : palette[0];
  return <ScrollView contentContainerStyle={s.content}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to question inbox" onPress={onBack} style={s.button}><Text style={s.buttonText}>Back to question inbox</Text></TouchableOpacity>
    <Text accessibilityRole="header" style={s.title}>Bobbie’s question glass</Text>
    <Text style={s.text}>Only your preapproved questions go into the glass. Bobbie chooses at random, and the question stays a surprise until the slip is revealed.</Text>
    <FittedArtwork source={glass} style={s.glass} accessibilityLabel="Giant clear meowgarita glass filled with folded question slips in pink, coral, turquoise, purple and yellow." />
    <Text style={s.count}>{count ?? '…'} approved {count === 1 ? 'slip' : 'slips'} in the glass</Text>
    {!visible ? <Text style={s.note}>The show is paused while PayPlace is in the background.</Text> : <>
      {drawing && <View accessibilityLiveRegion="polite" style={s.waiting}><ActivityIndicator color="#FFE1A0" /><Text style={s.text}>Bobbie is choosing a slip…</Text></View>}
      {chosen && <Animated.View accessibilityLiveRegion="polite" style={[s.paper, { backgroundColor: paper, opacity: reveal, transform: [{ translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }] }]}>
        <Text style={s.paperTitle}>Bobbie’s chosen question</Text><Text selectable style={s.question}>{chosen.question}</Text><Text style={s.signature}>— {chosen.stageName}</Text><Text style={s.paperNote}>{chosen.topic} · Approved with permission to feature</Text>
      </Animated.View>}
      {!!error && <Text accessibilityLiveRegion="polite" style={s.notice}>{error}</Text>}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={error && requestId.current ? 'Retry the same draw' : chosen ? 'Let Bobbie draw another question' : 'Let Bobbie choose a question'} accessibilityState={{ disabled: drawing }} disabled={drawing} onPress={draw} style={[s.button, drawing && { opacity: 0.5 }]}><Text style={s.buttonText}>{error && requestId.current ? 'Retry the same draw' : chosen ? 'Let Bobbie draw another question' : 'Let Bobbie choose a question'}</Text></TouchableOpacity>
    </>}
    <Text style={s.note}>Drawn questions leave the glass so they won’t repeat. Use the revealed slip when recording Bobbie’s answer.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  content: { padding: 20, paddingBottom: 44, gap: 16, width: '100%', maxWidth: 750, alignSelf: 'center' }, title: { color: '#FFE1A0', fontSize: 27, fontWeight: '800' }, text: { color: '#FFF2F9', fontSize: 16, lineHeight: 24 }, note: { color: '#D6C4DD', fontSize: 13, lineHeight: 20 }, glass: { width: '100%', height: 340 }, count: { color: '#FFE1A0', fontSize: 18, fontWeight: '700', textAlign: 'center' }, button: { backgroundColor: '#47234D', borderColor: '#DAB26A', borderWidth: 1, minHeight: 50, borderRadius: 14, padding: 14 }, buttonText: { color: '#FFE1A0', fontSize: 17, fontWeight: '800', textAlign: 'center' }, waiting: { gap: 12, alignItems: 'center', padding: 16 }, paper: { padding: 24, gap: 16, borderRadius: 6, borderWidth: 2, borderColor: '#FFF9FD' }, paperTitle: { color: '#47234D', fontSize: 15, fontWeight: '800' }, question: { color: '#29102E', fontSize: 23, lineHeight: 32 }, signature: { color: '#47234D', fontSize: 18, fontStyle: 'italic' }, paperNote: { color: '#47234D', fontSize: 12 }, notice: { color: '#FFF2F9', backgroundColor: '#47234D', padding: 14, borderRadius: 12, lineHeight: 23 },
});
