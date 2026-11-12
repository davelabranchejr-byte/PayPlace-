import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Text } from './Privacy';
import { createEmailApi } from './email-api.mjs';
import { ENCOURAGEMENT_PLACES, MASCOT_NOTES, approvedPublicNotes, encouragementNote } from './encouragement.mjs';

const Context = createContext(null);
const api = createEmailApi(Platform.OS, fetch, 'encouragement');
const isForeground = () => AppState.currentState === 'active' || Platform.OS === 'web';

function Button({ children, onPress, disabled, ...props }) { return <TouchableOpacity {...props} accessibilityRole="button" disabled={disabled} accessibilityState={{ disabled: !!disabled }} onPress={onPress} style={[s.button, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{children}</Text></TouchableOpacity>; }

export function EncouragementProvider({ children, communityEnabled = true, onMilestone }) {
  const [note, setNote] = useState(null), [form, setForm] = useState(false), [text, setText] = useState(''), [alias, setAlias] = useState(''), [consent, setConsent] = useState(false), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const generation = useRef(0), sending = useRef(false), mounted = useRef(true);
  useEffect(() => { mounted.current = true; const subscription = AppState.addEventListener('change', state => { if (state !== 'active') { generation.current++; setNote(null); setForm(false); } }); return () => { mounted.current = false; generation.current++; subscription.remove(); }; }, []);
  async function discover() {
    const current = ++generation.current;
    setForm(false); setMessage('');
    if (!communityEnabled) { setNote(encouragementNote()); return; }
    setNote({ loading: true });
    const showNote = notes => {
      if (current !== generation.current || !mounted.current || !isForeground()) return;
      setNote(encouragementNote(notes));
      onMilestone?.('foundNote');
    };
    let timer;
    try {
      // Always refresh. No persistent feed cache can resurrect a removed note.
      const result = await Promise.race([api('published'), new Promise(resolve => { timer = setTimeout(() => resolve(null), 1500); })]);
      showNote(approvedPublicNotes(result));
    } catch { showNote(); }
    finally { clearTimeout(timer); }
  }
  async function submit() {
    if (sending.current) return;
    sending.current = true; setBusy(true); setMessage('');
    try {
      const result = await api('submit', { text, alias: alias.trim() || 'A neighbor', consent });
      if (mounted.current) {
        onMilestone?.('sentNote');
        setText(''); setAlias(''); setConsent(false); setMessage(result.message); }
    } catch (error) { if (mounted.current) setMessage(error.message); }
    finally { sending.current = false; if (mounted.current) setBusy(false); }
  }
  const close = () => { generation.current++; setNote(null); setForm(false); setMessage(''); };
  return <Context.Provider value={{ discover }}>
    {children}
    <Modal visible={!!note || form} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView style={s.shade} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled"><View style={s.paper}>
          <Text accessibilityRole="header" style={s.title}>{form ? 'Leave a little kindness' : 'A note you found along the way'}</Text>
          {!form && note?.loading ? <Text style={s.body}>A little kindness is on its way…</Text> : !form && note ? <>
            <Text style={s.handwritten}>{note.text}</Text>
            <Text style={s.signature}>— {note.source === 'mascot' ? note.voice : `${note.alias} · a PayPlace neighbor`}</Text>
            <Text style={s.small}>{note.source === 'community' ? 'Shared with permission and approved by Dave.' : 'From your PayPlace family.'}</Text>
            {communityEnabled && <Button onPress={() => { generation.current++; setNote(null); setForm(true); setMessage(''); }}>Leave an encouraging note</Button>}
          </> : <>
            <Text style={s.body}>A short, kind note for a neighbor. No links, personal contact details, or financial instructions. Dave reviews every submission before it can appear in town.</Text>
            <TextInput accessibilityLabel="Your encouraging note" multiline maxLength={240} editable={!busy} value={text} onChangeText={setText} placeholder="What would you say to someone having a hard day?" style={[s.input, { minHeight: 120, textAlignVertical: 'top' }]} />
            <Text style={s.small}>{text.length}/240 characters</Text>
            <TextInput accessibilityLabel="Name shown with your note, optional" maxLength={32} editable={!busy} value={alias} onChangeText={setAlias} placeholder="A first name or nickname (optional)" style={s.input} />
            <TouchableOpacity accessibilityRole="checkbox" accessibilityLabel="Allow my note and chosen name to appear after Dave approves them" accessibilityState={{ checked: consent, disabled: busy }} disabled={busy} onPress={() => setConsent(!consent)} style={s.consent}><Text style={s.body}>{consent ? '☑' : '☐'} I give permission for this note and my chosen name to appear after Dave approves them.</Text></TouchableOpacity>
            <Button disabled={busy || !consent || text.trim().length < 8} onPress={submit}>{busy ? 'Sending your kindness…' : 'Send for Dave’s review'}</Button>
          </>}
          {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
          <Button disabled={busy} onPress={close}>Back to the neighborhood</Button>
        </View></ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  </Context.Provider>;
}

export function EncouragementSpot({ place = 'garden', style }) {
  const context = useContext(Context), site = ENCOURAGEMENT_PLACES[place] || ENCOURAGEMENT_PLACES.garden;
  const [lit, setLit] = useState(false);
  if (!context) return null;
  return <TouchableOpacity artworkMode="hotspot" accessibilityRole="button" accessibilityLabel={site.label} accessibilityHint="Opens a handwritten encouragement note." onPress={() => { setLit(true); context.discover(); }} onBlur={() => setLit(false)} style={[s.spot, { left: `${site.x}%`, top: `${site.y}%` }, style]}>
    <View pointerEvents="none" style={[s.stone, site.shape !== 'stone' && s.brick, (lit) && s.lit]} />
  </TouchableOpacity>;
}

export function EncouragementScene({ children, place = 'garden', style }) {
  return <View style={style}>{children}<EncouragementSpot place={place} /></View>;
}
const s = StyleSheet.create({
  shade: { flex: 1, backgroundColor: 'rgba(24,30,42,.5)' }, scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 }, paper: { backgroundColor: '#FFF9E9', borderRadius: 24, borderWidth: 1, borderColor: '#E8D7A8', padding: 24, gap: 16, maxWidth: 600, width: '100%', alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#3E4165' }, handwritten: { fontSize: 25, lineHeight: 37, color: '#3D4964', fontFamily: Platform.OS === 'ios' ? 'Noteworthy' : 'serif', fontStyle: 'italic', paddingVertical: 14 }, signature: { fontSize: 18, color: '#6550AF', textAlign: 'right', fontStyle: 'italic' },
  body: { color: '#34465E', fontSize: 16, lineHeight: 24 }, small: { color: '#5C6576', fontSize: 13, lineHeight: 20 }, button: { backgroundColor: '#6550AF', borderRadius: 16, padding: 14, minHeight: 48, justifyContent: 'center' }, buttonText: { color: '#FFF', fontWeight: '800', fontSize: 16, textAlign: 'center' },
  input: { color: '#21334D', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#A7A1BA', padding: 12, borderRadius: 12, fontSize: 17, minHeight: 48 }, consent: { minHeight: 48, justifyContent: 'center', paddingVertical: 8 },
  spot: { position: 'absolute', width: 48, height: 48, justifyContent: 'center', alignItems: 'center', transform: [{ translateX: -24 }, { translateY: -24 }] }, stone: { width: 28, height: 18, borderRadius: 10, backgroundColor: 'rgba(173,160,139,.22)', borderWidth: 1, borderColor: 'rgba(255,226,161,.42)' }, brick: { borderRadius: 3, width: 30, height: 14 }, lit: { backgroundColor: 'rgba(255,221,121,.65)', borderColor: '#FFE7A3', shadowColor: '#FFDB77', shadowOpacity: 0.9, shadowRadius: 12, elevation: 2 },
});
