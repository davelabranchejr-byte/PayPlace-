import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

function Button({ label, onPress, disabled, selected }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, selected: !!selected }} disabled={disabled} onPress={onPress} style={[s.button, selected && { borderWidth: 3 }, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{label}</Text></TouchableOpacity>; }
export default function EncouragementReview({ api, onBack, onAuthError }) {
  const [filter, setFilter] = useState('pending'), [notes, setNotes] = useState([]), [counts, setCounts] = useState(null), [next, setNext] = useState(null), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [draft, setDraft] = useState(null);
  const generation = useRef(0), pending = useRef(false), mounted = useRef(true);
  function fail(error) { setMessage(error.message); if (error.signIn) { setNotes([]); setDraft(null); onAuthError(error); } }
  async function load(offset = 0) {
    const current = ++generation.current; setBusy(true);
    try { const result = await api(`encouragement?filter=${filter}&offset=${offset}`); if (mounted.current && current === generation.current && AppState.currentState === 'active') { setNotes(previous => offset ? [...previous, ...result.notes] : result.notes); setCounts(result.counts); setNext(result.nextOffset); } }
    catch (error) { if (mounted.current && current === generation.current) fail(error); }
    finally { if (mounted.current && current === generation.current) setBusy(false); }
  }
  useEffect(() => { mounted.current = true; setNotes([]); setDraft(null); load(); const timer = setInterval(() => { if (!pending.current && AppState.currentState === 'active') load(); }, 30000); const sub = AppState.addEventListener('change', state => { generation.current++; setNotes([]); setDraft(null); if (state === 'active') load(); }); return () => { mounted.current = false; generation.current++; clearInterval(timer); sub.remove(); }; }, [filter]);
  async function act(note, status) {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try { await api('encouragement-status', { id: note.id, revision: note.revision, status }); if (mounted.current) { setMessage(status === 'approved' ? 'Approved. This exact note can now appear in town.' : status === 'removed' ? 'Removed from town.' : 'Rejected. This note stays private.'); await load(); } }
    catch (error) { if (mounted.current) fail(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function saveEdit() {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try { await api('encouragement-edit', draft); if (mounted.current) { setDraft(null); setMessage('Edited note saved privately. Preview and approve it separately.'); await load(); } }
    catch (error) { if (mounted.current) fail(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  return <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Button label="Back to owner inbox" onPress={onBack} disabled={busy} />
    <Text accessibilityRole="header" style={s.title}>Encouragement approvals</Text>
    <Text style={s.body}>Nothing from a neighbor appears until you approve it. Review kindness, suitability, links, private information, and the chosen name. Approval covers the exact version shown below.</Text>
    {counts && <Text style={s.body}>{counts.pending} waiting · {counts.approved} approved</Text>}
    <View style={s.row}>{['pending', 'approved', 'rejected', 'removed', 'all'].map(value => <Button key={value} label={value[0].toUpperCase() + value.slice(1)} selected={filter === value} onPress={() => setFilter(value)} disabled={busy} />)}</View>
    <Button label="Refresh encouragement queue" onPress={() => load()} disabled={busy} />
    {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
    {notes.map(note => <View key={note.id} style={s.card}>
      <Text style={s.small}>{note.status.toUpperCase()} · Version {note.revision}</Text>
      {draft?.id === note.id ? <>
        <TextInput accessibilityLabel="Edit encouraging note" multiline maxLength={240} editable={!busy} value={draft.text} onChangeText={text => setDraft(current => ({ ...current, text }))} style={s.input} />
        <TextInput accessibilityLabel="Edit displayed neighbor name" maxLength={32} editable={!busy} value={draft.alias} onChangeText={alias => setDraft(current => ({ ...current, alias }))} style={s.input} />
        <Text style={s.body}>Saving an edit withdraws any approval. You must approve the edited version separately.</Text>
        <Button label="Save edit as pending" disabled={busy || draft.text.trim().length < 8} onPress={saveEdit} />
        <Button label="Cancel edit" disabled={busy} onPress={() => setDraft(null)} />
      </> : <>
        <View style={s.paper}><Text style={s.note}>{note.text}</Text><Text style={s.signature}>— {note.alias} · a PayPlace neighbor</Text></View>
        <Text style={s.small}>Shared with permission · Submitted {new Date(note.createdAt).toLocaleString()}</Text>
        {note.status !== 'approved' && <Button label="Approve this exact note" onPress={() => act(note, 'approved')} disabled={busy || !!draft} />}
        {note.status !== 'rejected' && <Button label="Reject and keep private" onPress={() => act(note, 'rejected')} disabled={busy || !!draft} />}
        {note.status === 'approved' && <Button label="Remove from town" onPress={() => act(note, 'removed')} disabled={busy || !!draft} />}
        <Button label="Edit and return to pending" onPress={() => setDraft({ id: note.id, revision: note.revision, text: note.text, alias: note.alias })} disabled={busy || !!draft} />
      </>}
    </View>)}
    {!busy && !notes.length && <Text style={s.body}>No notes in this view.</Text>}
    {next !== null && <Button label="Load more encouragement submissions" onPress={() => load(next)} disabled={busy} />}
  </ScrollView>;
}
const s = StyleSheet.create({ content: { padding: 18, gap: 14 }, title: { color: '#FFE1A0', fontSize: 25, fontWeight: '800' }, body: { color: '#FFF2F9', fontSize: 15, lineHeight: 24 }, small: { color: '#E9D7ED', fontSize: 13, lineHeight: 20 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, card: { padding: 16, gap: 12, backgroundColor: '#301537', borderRadius: 20 }, paper: { backgroundColor: '#FFF9E9', borderRadius: 16, padding: 20, gap: 16 }, note: { fontSize: 24, lineHeight: 34, fontStyle: 'italic', color: '#3D4964' }, signature: { color: '#6550AF', fontSize: 15, textAlign: 'right' }, button: { backgroundColor: '#47234D', minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: '#DAB26A', borderRadius: 14, padding: 12 }, buttonText: { color: '#FFE1A0', fontWeight: '800', fontSize: 15, textAlign: 'center' }, input: { backgroundColor: '#FFF9FD', color: '#24132F', padding: 12, borderRadius: 12, fontSize: 17, minHeight: 50 } });
