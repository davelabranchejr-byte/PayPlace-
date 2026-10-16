import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import FittedArtwork from './FittedArtwork';
import CabaretVideo from './CabaretVideo';
import OwnerInbox from './OwnerInbox';
import { createEmailApi } from './email-api.mjs';
import { prepareQuestion, QUESTION_TOPICS } from './bobbie-cabaret.mjs';

const artwork = require('../assets/characters/bobbie-darlending-show.jpeg');
const api = createEmailApi(Platform.OS, fetch, 'cabaret');
function Button({ label, onPress, disabled, secondary }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} disabled={disabled} accessibilityState={{ disabled: !!disabled }} onPress={onPress} style={[s.button, secondary && s.secondary, disabled && { opacity: 0.6 }]}><Text style={[s.buttonText, secondary && { color: '#FFE1A0' }]}>{label}</Text></TouchableOpacity>;
}
export function BobbieCabaretEntry({ onOpen }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel="Enter Bobbie Darlending’s cabaret" onPress={onOpen} style={s.entry}>
    <FittedArtwork source={artwork} style={s.thumbnail} accessible={false} />
    <View style={{ flex: 1 }}><Text style={s.eyebrow}>PAYPLACE CLUBHOUSE CABARET</Text><Text style={s.entryTitle}>The Bobbie Darlending Show</Text><Text style={s.body}>Watch the show · Ask Bobbie</Text></View>
  </TouchableOpacity>;
}
export default function BobbieCabaret({ visible, onClose, submitQuestion = api }) {
  const [watching, setWatching] = useState(false);
  const [ownerInbox, setOwnerInbox] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [stageName, setStageName] = useState('');
  const [topic, setTopic] = useState(QUESTION_TOPICS[0]);
  const [featureConsent, setFeatureConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  async function send() {
    if (pending.current) return;
    setMessage('');
    let payload;
    try { payload = prepareQuestion({ question, stageName, topic, featureConsent }); }
    catch (error) { setMessage(error.message); return; }
    pending.current = true; setBusy(true);
    try {
      const result = await submitQuestion('questions', payload);
      if (result.accepted !== true || !result.id) throw new Error('Your question could not be confirmed. Please try again.');
      setQuestion(''); setStageName(''); setFeatureConsent(false); setFormOpen(false);
      setMessage(`Your question is in Bobbie’s private mailbag. Reference: ${result.id}. The team reviews submissions; an answer or episode appearance is not guaranteed.`);
    } catch (error) { setMessage(error.message || 'Could not send your question. Your draft is still here.'); }
    finally { pending.current = false; setBusy(false); }
  }
  function back() { if (ownerInbox) setOwnerInbox(false); else if (watching) setWatching(false); else onClose(); }
  return <Modal visible={visible} animationType="slide" onRequestClose={back}>
    <SafeAreaView style={s.safe}><KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}><Text accessibilityRole="header" style={s.title}>{ownerInbox ? 'Owner inbox' : 'Bobbie’s Cabaret'}</Text><Button secondary label={watching || ownerInbox ? 'Back to Cabaret' : 'Back to Neighborhood'} onPress={back} /></View>
      {visible && ownerInbox ? <OwnerInbox /> : visible && watching ? <CabaretVideo /> : <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <FittedArtwork source={artwork} aspectRatio={1312 / 1199} accessibilityLabel="Bobbie Darlending, a green-eyed tabby in a red wig and blue sequined gown, on a gold-lit cabaret stage." />
        <Text style={s.eyebrow}>LIVE FROM THE PAYPLACE CLUBHOUSE</Text>
        <Text accessibilityRole="header" style={s.title}>The Bobbie Darlending Show</Text>
        <Text style={s.quote}>“Darling, bring your questions. I’ve already brought the drama.”</Text>
        <Text style={s.body}>Real questions. Ridiculous situations. Zero shame. Just a little sparkle.</Text>
        <Button label="Watch the Show — Meowgarita & Money" onPress={() => setWatching(true)} />
        <Text style={s.note}>Watch right here in PayPlace. The whole video stays visible, with playback controls.</Text>
        <Button secondary label={formOpen ? 'Close question form' : 'Ask Bobbie'} onPress={() => setFormOpen(!formOpen)} />
        {!!message && <Text accessibilityLiveRegion="polite" style={s.notice}>{message}</Text>}
        {formOpen && <View style={s.form}>
          <Text accessibilityRole="header" style={s.title}>A note for Bobbie</Text>
          <Text style={s.body}>Leave your real name out if you like. Questions go to the PayPlace team for review, rather than an instant chat.</Text>
          <Text style={s.label}>Stage name (optional)</Text>
          <TextInput accessibilityLabel="Stage name (optional)" editable={!busy} style={s.input} value={stageName} onChangeText={setStageName} maxLength={40} placeholder="Anonymous neighbor" placeholderTextColor="#686271" />
          <Text style={s.label}>What’s on your mind?</Text>
          <View style={s.topics}>{QUESTION_TOPICS.map(value => <TouchableOpacity key={value} disabled={busy} accessibilityRole="radio" accessibilityState={{ selected: topic === value, disabled: busy }} accessibilityLabel={value} onPress={() => setTopic(value)} style={[s.topic, topic === value && s.selected]}><Text style={s.body}>{value}</Text></TouchableOpacity>)}</View>
          <Text style={s.label}>Your question</Text>
          <TextInput accessibilityLabel="Your question" editable={!busy} style={[s.input, s.question]} multiline textAlignVertical="top" maxLength={1500} value={question} onChangeText={setQuestion} placeholder="Dear Bobbie…" placeholderTextColor="#686271" />
          <Text style={s.note}>{question.length}/1,500 characters. Please leave out account numbers, passwords, addresses and private details about other people.</Text>
          <View style={s.consent}><Switch accessibilityLabel="Allow my question and stage name to be featured" disabled={busy} value={featureConsent} onValueChange={setFeatureConsent} /><Text style={[s.body, { flex: 1 }]}>The team may feature my question and stage name in a public show or PayPlace social post, edited for length and privacy.</Text></View>
          <Text style={s.note}>Optional and off by default. Submitting shares only this form with the PayPlace team. Your profile and budget are not attached. Anonymous means no name or email is requested; the hosting service may keep technical request logs.</Text>
          <Button label={busy ? 'Sending your question…' : 'Send to Bobbie’s mailbag'} disabled={busy} onPress={send} />
        </View>}
        <Text style={s.note}>Comedy and general money education. Submissions are reviewed by the team before any public use.</Text>
        <Button secondary label="Owner inbox" onPress={() => setOwnerInbox(true)} />
        <Text style={s.note}>Private mailbag access for the PayPlace owner.</Text>
      </ScrollView>}
    </KeyboardAvoidingView></SafeAreaView>
  </Modal>;
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#190B22' }, content: { padding: 18, gap: 14, paddingBottom: 40, maxWidth: 650, width: '100%', alignSelf: 'center' },
  header: { padding: 14, gap: 8, borderBottomWidth: 1, borderColor: '#69406D' }, title: { color: '#FFE1A0', fontSize: 25, fontWeight: '800' },
  eyebrow: { color: '#FFE1A0', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 }, entry: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, backgroundColor: '#29102E', borderColor: '#DAB26A', borderWidth: 1, marginBottom: 16 },
  thumbnail: { width: 86, height: 86, borderRadius: 12 }, entryTitle: { color: '#FFE1A0', fontSize: 18, fontWeight: '800', marginVertical: 5 }, body: { color: '#FFF2F9', fontSize: 15, lineHeight: 22 },
  quote: { color: '#FFBDE2', fontSize: 20, fontStyle: 'italic', lineHeight: 28 }, note: { color: '#D6C4DD', fontSize: 13, lineHeight: 19 },
  button: { minHeight: 48, padding: 14, borderRadius: 14, backgroundColor: '#FFE1A0', alignItems: 'center', justifyContent: 'center' }, buttonText: { color: '#29102E', fontWeight: '800', fontSize: 16, textAlign: 'center' }, secondary: { backgroundColor: '#47234D', borderWidth: 1, borderColor: '#DAB26A' },
  form: { padding: 16, borderRadius: 20, backgroundColor: '#301537', gap: 14 }, label: { color: '#FFE1A0', fontSize: 16, fontWeight: '700' }, input: { minHeight: 48, borderRadius: 12, padding: 12, backgroundColor: '#FFF9FD', color: '#24132F', fontSize: 16 }, question: { minHeight: 150 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, topic: { minHeight: 44, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#927398' }, selected: { backgroundColor: '#73416D', borderColor: '#FFE1A0' }, consent: { flexDirection: 'row', gap: 12, alignItems: 'center' }, notice: { backgroundColor: '#47234D', padding: 14, borderRadius: 12, color: '#FFF2F9', lineHeight: 23 },
});
