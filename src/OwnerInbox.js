import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ownerSessionStore } from './owner-session';
import { createOwnerInboxApi } from './owner-inbox-api.mjs';
import { EMAIL_SERVICE_ORIGIN } from './email-api.mjs';
import QuestionGlass from './QuestionGlass';
const defaultApi = createOwnerInboxApi({ sessionStore: ownerSessionStore });
function Button({ label, onPress, disabled, selected }) { return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled, selected: !!selected }} disabled={disabled} onPress={onPress} style={[s.button, selected && s.selected, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{label}</Text></TouchableOpacity>; }
export default function OwnerInbox({ api = defaultApi, sessionStore = ownerSessionStore }) {
  const [signedIn, setSignedIn] = useState(false), [checking, setChecking] = useState(true), [email, setEmail] = useState(''), [code, setCode] = useState(''), [challenge, setChallenge] = useState(null);
  const [filter, setFilter] = useState('new'), [questions, setQuestions] = useState([]), [counts, setCounts] = useState(null), [nextOffset, setNextOffset] = useState(null), [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [foreground, setForeground] = useState(AppState.currentState === 'active');
  const [showGlass, setShowGlass] = useState(false);
  const generation = useRef(0), mounted = useRef(true), pending = useRef(false), filterRef = useRef(filter);
  const [canResend, setCanResend] = useState(true);
  filterRef.current = filter;
  function clearPrivateData() { generation.current++; setQuestions([]); setCounts(null); setNextOffset(null); }
  function failed(error) { if (error.signIn) { setShowGlass(false); clearPrivateData(); setSignedIn(false); setChecking(false); setBusy(false); } setMessage(error.message); }
  useEffect(() => {
    if (!challenge) { setCanResend(true); return; }
    setCanResend(false);
    const timer = setTimeout(() => setCanResend(true), Math.max(0, challenge.resendAt - Date.now()));
    return () => clearTimeout(timer);
  }, [challenge]);
  async function load(view = filterRef.current, offset = 0) {
    const current = ++generation.current;
    setBusy(true);
    try {
      const result = await api(`questions?filter=${view}&offset=${offset}`);
      if (!mounted.current || current !== generation.current || AppState.currentState !== 'active') return;
      setQuestions(previous => offset ? [...previous, ...result.questions] : result.questions); setCounts(result.counts); setNextOffset(result.nextOffset); setSignedIn(true); setMessage('');
    } catch (error) { if (mounted.current && current === generation.current) failed(error); }
    finally { if (mounted.current && current === generation.current) { setBusy(false); setChecking(false); } }
  }
  useEffect(() => {
    mounted.current = true;
    if (Platform.OS !== 'web') load(); else setChecking(false);
    const sub = AppState.addEventListener('change', state => {
      setForeground(state === 'active');
      if (state !== 'active') { clearPrivateData(); setCode(''); setBusy(false); setChecking(false); }
    });
    return () => { mounted.current = false; generation.current++; sub.remove(); };
  }, []);
  useEffect(() => {
    if (!signedIn || !foreground) return;
    load();
    const timer = setInterval(() => { if (!pending.current && AppState.currentState === 'active') load(); }, 30000);
    return () => clearInterval(timer);
  }, [signedIn, foreground, filter]);
  async function sendCode() {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try { const result = await api('request-code', { email }, false); if (mounted.current) { setChallenge({ ...result, resendAt: Date.now() + result.resendAfter * 1000 }); setCode(''); setMessage('Check your owner email for an eight-character sign-in code.'); } }
    catch (error) { if (mounted.current) failed(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function verify() {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try {
      const result = await api('verify', { challengeId: challenge.challengeId, code }, false);
      await sessionStore.write(result.sessionToken, result.expiresAt);
      if (mounted.current) { setCode(''); setChallenge(null); setSignedIn(true); }
    } catch (error) { if (mounted.current) failed(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function update(id, status) {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try { await api('question-status', { id, status }); if (mounted.current) await load(); }
    catch (error) { if (mounted.current) failed(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function approve(id, approved) {
    if (pending.current) return; pending.current = true; setBusy(true); setMessage('');
    try { await api('glass-approval', { id, approved }); if (mounted.current) await load(); }
    catch (error) { if (mounted.current) failed(error); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  async function logout() {
    if (pending.current) return; pending.current = true; setBusy(true); clearPrivateData(); setSignedIn(false); setShowGlass(false);
    try { await api('logout', {}); } catch (error) { if (mounted.current) setMessage(error.signIn ? '' : 'Signed out on this phone. The server could not be reached to revoke the session; it will expire automatically.'); }
    finally { await sessionStore.clear(); pending.current = false; if (mounted.current) { setBusy(false); setCode(''); setChallenge(null); } }
  }
  if (Platform.OS === 'web') return <ScrollView contentContainerStyle={s.content}><Text style={s.title}>Owner inbox</Text><Text style={s.text}>Open the private mailbag and sign in with the ChatGPT account that owns PayPlace.</Text><Button label="Open secure owner inbox" onPress={() => Linking.openURL(`${EMAIL_SERVICE_ORIGIN}/owner-inbox`)} /></ScrollView>;
  if (signedIn && showGlass) return <QuestionGlass api={api} count={counts?.glass} visible={foreground} onBack={() => setShowGlass(false)} onAuthError={failed} onDraw={() => load()} />;
  return <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text accessibilityRole="header" style={s.title}>Bobbie’s private mailbag</Text>
    {checking ? <ActivityIndicator accessibilityLabel="Opening owner inbox" color="#FFE1A0" /> : !signedIn ? <>
      <Text style={s.text}>Owner access only. Verify the owner email to review questions. Signing in here does not change your PayPlace profile or Annie letter preferences.</Text>
      <Text style={s.label}>Owner email</Text><TextInput accessibilityLabel="Owner email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy} value={email} onChangeText={setEmail} style={s.input} placeholder="Your owner email" placeholderTextColor="#686271" />
      <Button label={challenge ? 'Send a new owner code' : 'Send owner sign-in code'} disabled={busy || !email.trim() || !canResend} onPress={sendCode} />
      {challenge && <><Text style={s.label}>Security code</Text><TextInput accessibilityLabel="Owner security code" autoCapitalize="characters" autoCorrect={false} autoComplete="one-time-code" editable={!busy} value={code} onChangeText={setCode} maxLength={16} style={s.input} /><Button label="Unlock owner inbox" disabled={busy || !code.trim()} onPress={verify} /><Text style={s.note}>Codes expire after 10 minutes. A new code can be requested after one minute.</Text></>}
    </> : <>
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.title}>{counts ? `${counts.unread} new · ${counts.total} total` : 'Loading questions…'}</Text>
      <View style={s.actions}>{[['new', 'New'], ['all', 'All'], ['archived', 'Archived']].map(([value, label]) => <Button key={value} label={label} selected={filter === value} disabled={busy} onPress={() => setFilter(value)} />)}</View>
      <View style={s.actions}><Button label="Refresh inbox" disabled={busy} onPress={() => load()} /><Button label="Sign out of owner inbox" disabled={busy} onPress={logout} /></View>
      <Button label="Open Bobbie’s question glass" disabled={busy} onPress={() => setShowGlass(true)} />
      <Text style={s.note}>{counts?.glass ?? 0} approved slips in the glass. Approve questions below; only submissions with permission to feature can enter.</Text>
      <Text style={s.note}>Refreshes every 30 seconds while open. Shows questions from the last 90 days. Archiving does not publish anything or change permission.</Text>
      {foreground && questions.map(q => <View key={q.id} style={s.card}>
        <Text accessibilityRole="header" style={s.title}>{q.stageName}</Text><Text style={s.note}>{q.topic} · {new Date(q.createdAt).toLocaleString()} · {q.status === 'new' ? 'Unread' : q.status === 'read' ? 'Read' : 'Archived'}</Text>
        <Text selectable style={s.question}>{q.question}</Text>
        <Text style={[s.permission, q.featureConsent && s.allowed]}>{q.featureConsent ? 'Permission to feature: YES — question and stage name may be featured.' : 'Permission to feature: NO — private review only.'}</Text>
        <Text style={s.note}>{q.showStatus === 'approved' ? 'In Bobbie’s glass' : q.showStatus === 'drawn' ? 'Already drawn — will not repeat' : 'Not in the glass'}</Text>
        {q.status !== 'archived' && q.showStatus !== 'drawn' && <Button label={q.showStatus === 'approved' ? 'Remove from glass' : 'Approve for Bobbie’s glass'} disabled={busy || !q.featureConsent} onPress={() => approve(q.id, q.showStatus !== 'approved')} />}
        <Text selectable style={s.note}>Reference: {q.id}</Text>
        <View style={s.actions}>{q.status === 'archived' ? <Button label="Restore as unread" disabled={busy} onPress={() => update(q.id, 'new')} /> : <><Button label={q.status === 'new' ? 'Mark read' : 'Mark unread'} disabled={busy} onPress={() => update(q.id, q.status === 'new' ? 'read' : 'new')} /><Button label="Archive" disabled={busy} onPress={() => update(q.id, 'archived')} /></>}</View>
      </View>)}
      {foreground && !busy && !questions.length && <Text style={s.text}>{filter === 'new' ? 'You’re all caught up. New questions will appear here.' : 'No questions in this view.'}</Text>}
      {nextOffset !== null && <Button label="Load older questions" disabled={busy} onPress={() => load(filter, nextOffset)} />}
    </>}
    {busy && !checking && <ActivityIndicator accessibilityLabel="Working on owner inbox" color="#FFE1A0" />}
    {!!message && <Text accessibilityLiveRegion="polite" style={s.notice}>{message}</Text>}
  </ScrollView>;
}
const s = StyleSheet.create({
  content: { padding: 18, gap: 14, paddingBottom: 44, width: '100%', maxWidth: 750, alignSelf: 'center' }, title: { color: '#FFE1A0', fontSize: 23, fontWeight: '800' }, text: { color: '#FFF2F9', fontSize: 16, lineHeight: 24 }, question: { color: '#FFF2F9', fontSize: 19, lineHeight: 28 }, note: { color: '#D6C4DD', fontSize: 13, lineHeight: 20 }, label: { color: '#FFE1A0', fontWeight: '700', fontSize: 16 }, input: { minHeight: 48, backgroundColor: '#FFF9FD', color: '#24132F', padding: 12, borderRadius: 12, fontSize: 17 }, button: { minHeight: 48, borderRadius: 12, padding: 13, borderWidth: 1, borderColor: '#DAB26A', backgroundColor: '#47234D', justifyContent: 'center' }, selected: { borderWidth: 3 }, buttonText: { color: '#FFE1A0', fontSize: 16, fontWeight: '800', textAlign: 'center' }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { backgroundColor: '#301537', borderWidth: 1, borderColor: '#69406D', borderRadius: 18, padding: 18, gap: 14 }, permission: { color: '#FFE1A0', padding: 12, borderRadius: 10, backgroundColor: '#47234D', lineHeight: 23 }, allowed: { color: '#D7F9D6', borderWidth: 1, borderColor: '#B8DBBC' }, notice: { color: '#FFF2F9', lineHeight: 23, backgroundColor: '#47234D', padding: 14, borderRadius: 12 },
});
