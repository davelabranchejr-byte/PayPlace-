import React, { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createContactApi } from './email-api.mjs';
import { normalizeContact, verifiedAnswers } from './contact-verification.mjs';
const api = createContactApi(Platform.OS);
const button = { backgroundColor: '#147D78', borderRadius: 14, padding: 16, marginTop: 16, alignItems: 'center' };
const inputStyle = { fontSize: 18, borderWidth: 1, borderColor: '#147D78', borderRadius: 12, padding: 16, marginTop: 10 };

export default function EmailVerification({ answers, onDraftChange = () => {}, onVerified }) {
  const [availability, setAvailability] = useState(null);
  const channel = 'email';
  const [contact, setContact] = useState(answers.email || (answers.contactChannel === 'email' ? answers.contact : '') || '');
  const [letters, setLetters] = useState(answers.annieLetters === true);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifiedProfile, setVerifiedProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    let active = true;
    api('status').then(r => { if (active) setAvailability(r); }).catch(() => { if (active) { setAvailability({}); setMessage('Annie’s post office could not be reached. Please try again.'); } });
    return () => { active = false; };
  }, []);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const available = availability?.emailConfigured === true;
  const destination = normalizeContact(channel, contact);
  const waiting = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  async function send() {
    if (busy || !destination || !available || Date.now() < resendAt) return;
    setBusy(true); setMessage('');
    try {
      const result = await api('request-code', { channel, contact: destination, name: answers.name, goal: answers.goal, annieLetters: letters });
      setChallenge({ ...result, channel, contact: destination, letters }); setVerifiedProfile(null); setCode(''); setResendAt(Date.now() + result.resendAfter * 1000);
      setMessage('Annie sent your welcome letter and code. Check your inbox and spam folder.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (busy || !challenge) return;
    setBusy(true); setMessage('');
    try {
      // If local saving failed after the one-use code succeeded, retry saving
      // the verified result rather than spending the code a second time.
      let profile = verifiedProfile;
      if (!profile) {
        const result = await api('verify', { challengeId: challenge.challengeId, code });
        profile = verifiedAnswers(answers, result, challenge.channel, challenge.contact, challenge.letters);
        setVerifiedProfile(profile);
      }
      await onVerified(profile);
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <View style={{ width: '100%', maxWidth: 520, padding: 24, backgroundColor: 'white', borderRadius: 24 }}>
    <Text style={{ fontSize: 28, fontWeight: '800', color: '#173C43' }}>Your key to PayPlace</Text>
    <Text style={{ fontSize: 17, lineHeight: 26, marginTop: 16 }}>There you are, {answers.name || 'Neighbor'}. Enter your email so Annie can send your security code and welcome letter. Email verification is included for everyone.</Text>
    {!challenge && <>
      <TextInput accessibilityLabel="Email address" value={contact} onChangeText={text => {
        setContact(text); setVerifiedProfile(null);
        onDraftChange({ email: text, contactVerified: false, emailVerified: false, phoneVerified: false });
      }} editable={!busy} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" placeholder="you@example.com" style={inputStyle} />
      <Text style={{ fontSize: 15, lineHeight: 22, marginTop: 12 }}>{availability === null ? 'Checking Annie’s post office…' : available ? 'Your eight-character code expires after 10 minutes.' : 'Email delivery is temporarily unavailable. Please try again shortly.'}</Text>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: letters }} disabled={busy} onPress={() => { setLetters(!letters); onDraftChange({ annieLetters: !letters }); }} style={{ minHeight: 48, paddingVertical: 16 }}><Text style={{ fontSize: 16, lineHeight: 24, color: '#173C43' }}>{letters ? '☑' : '☐'} Send me Annie’s future letters by email.</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy || !destination || !available || waiting > 0} style={[button, (busy || !destination || !available || waiting > 0) && { opacity: 0.5 }]} onPress={send}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Sending…' : waiting ? `Send a new code in ${waiting}s` : 'Send my security code'}</Text></TouchableOpacity>
    </>}
    {challenge && <>
      <Text style={{ fontSize: 16, marginTop: 20 }}>Enter the code sent to {challenge.contact}</Text>
      <TextInput accessibilityLabel="Eight-character security code" value={code} onChangeText={t => setCode(t.replace(/[^a-zA-Z2-9]/g, '').toUpperCase())} autoCapitalize="characters" autoCorrect={false} maxLength={8} placeholder="ABCDEFGH" textContentType="oneTimeCode" style={[inputStyle, { fontSize: 24, letterSpacing: 4 }]} />
      <TouchableOpacity accessibilityRole="button" disabled={busy || (!verifiedProfile && code.length !== 8)} style={[button, (busy || (!verifiedProfile && code.length !== 8)) && { opacity: 0.5 }]} onPress={verify}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Checking…' : verifiedProfile ? 'Save and enter' : 'Confirm code and enter'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy || waiting > 0} onPress={send} style={{ paddingVertical: 16 }}><Text style={{ color: '#147D78', fontSize: 16 }}>{waiting ? `Resend in ${waiting}s` : 'Send a new code'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => { setChallenge(null); setVerifiedProfile(null); setCode(''); setMessage(''); }} style={{ minHeight: 48, paddingVertical: 14 }}><Text style={{ color: '#147D78', fontSize: 16 }}>Change email address</Text></TouchableOpacity>
    </>}
    <View style={{ marginTop: 24, padding: 16, backgroundColor: '#F1EDFF', borderRadius: 14 }}>
      <Text style={{ color: '#62509C', fontWeight: '800', fontSize: 12 }}>COMING SOON · PREMIUM</Text>
      <Text style={{ color: '#173C43', fontWeight: '700', fontSize: 17, marginTop: 6 }}>Text-message security codes</Text>
      <Text style={{ color: '#52616B', fontSize: 15, lineHeight: 22, marginTop: 6 }}>A planned paid option for receiving your sign-in code by text. Email verification remains included.</Text>
    </View>
    {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ fontSize: 16, lineHeight: 24, marginTop: 12 }}>{message}</Text>}
  </View>;
}
