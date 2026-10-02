import React, { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createEmailApi } from './email-api.mjs';
const emailApi = createEmailApi(Platform.OS);
const button = { backgroundColor: '#147D78', borderRadius: 14, padding: 16, marginTop: 16, alignItems: 'center' };
export default function EmailVerification({ answers, onVerified, onVisit, onEdit }) {
  const [configured, setConfigured] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    let active = true;
    emailApi('status').then(r => { if (active) setConfigured(r.configured); }).catch(() => { if (active) { setConfigured(false); setMessage('Email delivery is temporarily unavailable.'); } });
    return () => { active = false; };
  }, []);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function send() {
    if (busy || Date.now() < resendAt) return;
    setBusy(true); setMessage('');
    try {
      const result = await emailApi('request-code', { email: answers.email, name: answers.name, goal: answers.goal });
      setChallenge(result); setCode(''); setResendAt(Date.now() + result.resendAfter * 1000);
      setMessage('Annie’s letter is on its way. Check your inbox and spam folder.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (busy || !challenge) return;
    setBusy(true); setMessage('');
    try {
      const result = await emailApi('verify', { challengeId: challenge.challengeId, code });
      await onVerified({ ...answers, email: result.email, emailVerified: true, emailVerifiedAt: result.verifiedAt, guest: false });
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  const waiting = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  return <View style={{ width: '100%', maxWidth: 520, padding: 24, backgroundColor: 'white', borderRadius: 24 }}>
    <Text style={{ fontSize: 28, fontWeight: '800', color: '#173C43' }}>A letter from Annie</Text>
    <Text style={{ fontSize: 17, lineHeight: 26, marginTop: 16 }}>Your place in the neighborhood is waiting, {answers.name || 'Neighbor'}.</Text>
    <Text style={{ fontSize: 16, lineHeight: 24, marginTop: 12 }}>{configured === null ? 'Checking the post office…' : configured ? `We’ll send your welcome letter and an eight-character code to ${answers.email}.` : 'The post office is temporarily unavailable. You can try again later or explore as a visitor.'}</Text>
    {configured && !challenge && <TouchableOpacity accessibilityRole="button" disabled={busy} style={button} onPress={send}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Sending…' : 'Send my letter'}</Text></TouchableOpacity>}
    {configured && challenge && <>
      <Text style={{ fontSize: 16, marginTop: 20 }}>Verification code · expires after 10 minutes</Text>
      <TextInput accessibilityLabel="Eight-character verification code" value={code} onChangeText={t => setCode(t.replace(/[^a-zA-Z2-9]/g, '').toUpperCase())} autoCapitalize="characters" autoCorrect={false} maxLength={8} placeholder="ABCDEFGH" textContentType="oneTimeCode" style={{ fontSize: 24, letterSpacing: 4, borderWidth: 1, borderColor: '#147D78', borderRadius: 12, padding: 16, marginTop: 10 }} />
      <TouchableOpacity accessibilityRole="button" disabled={busy || code.length !== 8} style={[button, (busy || code.length !== 8) && { opacity: 0.5 }]} onPress={verify}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Checking…' : 'Confirm email and enter'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy || waiting > 0} onPress={send} style={{ paddingVertical: 16 }}><Text style={{ color: '#147D78', fontSize: 16 }}>{waiting ? `Resend in ${waiting}s` : 'Send a new code'}</Text></TouchableOpacity>
    </>}
    {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ fontSize: 16, lineHeight: 24, marginTop: 12 }}>{message}</Text>}
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={onEdit} style={{ paddingVertical: 14 }}><Text style={{ color: '#147D78', fontSize: 16 }}>Change email address</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => onVisit({ ...answers, guest: true, emailVerified: false })} style={{ paddingVertical: 14 }}><Text style={{ color: '#62509C', fontSize: 16 }}>Explore as a visitor</Text></TouchableOpacity>
  </View>;
}
