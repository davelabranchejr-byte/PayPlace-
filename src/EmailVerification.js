import React, { useEffect, useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createContactApi } from './email-api.mjs';
import { normalizeContact, verifiedAnswers } from './contact-verification.mjs';
const api = createContactApi(Platform.OS);
const button = { backgroundColor: '#147D78', borderRadius: 14, padding: 16, marginTop: 16, alignItems: 'center' };
const inputStyle = { fontSize: 18, borderWidth: 1, borderColor: '#147D78', borderRadius: 12, padding: 16, marginTop: 10 };

export default function EmailVerification({ answers, onVerified }) {
  const [availability, setAvailability] = useState(null);
  const [channel, setChannel] = useState(answers.contactChannel || 'email');
  const [contact, setContact] = useState(answers.contact || answers.email || '');
  const [letters, setLetters] = useState(answers.annieLetters === true);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [resendAt, setResendAt] = useState(0);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    let active = true;
    api('status').then(r => { if (active) setAvailability(r); }).catch(() => { if (active) { setAvailability({}); setMessage('Annie’s post office could not be reached. Please try again.'); } });
    return () => { active = false; };
  }, []);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const available = availability?.[channel === 'sms' ? 'smsConfigured' : 'emailConfigured'] === true;
  const destination = normalizeContact(channel, contact);
  const waiting = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  function choose(next) { setChannel(next); setContact(''); setCode(''); setMessage(''); }
  async function send() {
    if (busy || !destination || !available || Date.now() < resendAt) return;
    setBusy(true); setMessage('');
    try {
      const result = await api('request-code', { channel, contact: destination, name: answers.name, goal: answers.goal, annieLetters: letters });
      setChallenge({ ...result, channel, contact: destination, letters }); setCode(''); setResendAt(Date.now() + result.resendAfter * 1000);
      setMessage(channel === 'sms' ? 'Annie sent your welcome note and code by text.' : 'Annie sent your welcome letter and code. Check your inbox and spam folder.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function verify() {
    if (busy || !challenge) return;
    setBusy(true); setMessage('');
    try {
      const result = await api('verify', { challengeId: challenge.challengeId, code });
      await onVerified(verifiedAnswers(answers, result, challenge.channel, challenge.contact, challenge.letters));
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <View style={{ width: '100%', maxWidth: 520, padding: 24, backgroundColor: 'white', borderRadius: 24 }}>
    <Text style={{ fontSize: 28, fontWeight: '800', color: '#173C43' }}>Your key to PayPlace</Text>
    <Text style={{ fontSize: 17, lineHeight: 26, marginTop: 16 }}>There you are, {answers.name || 'Neighbor'}. Choose where Annie should send your security code and welcome letter.</Text>
    {!challenge && <>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['email', 'Email'], ['sms', 'Text message']].map(([method, label]) => <TouchableOpacity key={method} accessibilityRole="radio" accessibilityState={{ checked: channel === method, disabled: busy }} disabled={busy} onPress={() => choose(method)} style={[button, { flex: 1, backgroundColor: channel === method ? '#147D78' : '#62509C' }]}><Text style={{ color: 'white', fontWeight: '700' }}>{label}</Text></TouchableOpacity>)}
      </View>
      <TextInput accessibilityLabel={channel === 'sms' ? 'Phone number with country code' : 'Email address'} value={contact} onChangeText={setContact} editable={!busy} autoCapitalize="none" autoCorrect={false} keyboardType={channel === 'sms' ? 'phone-pad' : 'email-address'} textContentType={channel === 'sms' ? 'telephoneNumber' : 'emailAddress'} placeholder={channel === 'sms' ? '+1 555 123 4567' : 'you@example.com'} style={inputStyle} />
      <Text style={{ fontSize: 15, lineHeight: 22, marginTop: 12 }}>{availability === null ? 'Checking Annie’s post office…' : available ? 'Your eight-character code expires after 10 minutes.' : channel === 'sms' ? 'Text delivery is not connected yet. You can verify by email today.' : 'Email delivery is temporarily unavailable. Please try again shortly.'}</Text>
      <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: letters }} disabled={busy} onPress={() => setLetters(!letters)} style={{ paddingVertical: 16 }}><Text style={{ fontSize: 16, lineHeight: 24, color: '#173C43' }}>{letters ? '☑' : '☐'} Send me Annie’s future letters using this contact method.</Text></TouchableOpacity>
      {channel === 'sms' && <Text style={{ fontSize: 13, lineHeight: 20, color: '#52616B' }}>Requesting a code sends a verification text and welcome note. Future letters are optional. Message and data rates may apply. Reply STOP to stop texts.</Text>}
      <TouchableOpacity accessibilityRole="button" disabled={busy || !destination || !available || waiting > 0} style={[button, (busy || !destination || !available || waiting > 0) && { opacity: 0.5 }]} onPress={send}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Sending…' : waiting ? `Send a new code in ${waiting}s` : 'Send my security code'}</Text></TouchableOpacity>
    </>}
    {challenge && <>
      <Text style={{ fontSize: 16, marginTop: 20 }}>Enter the code sent to {challenge.contact}</Text>
      <TextInput accessibilityLabel="Eight-character security code" value={code} onChangeText={t => setCode(t.replace(/[^a-zA-Z2-9]/g, '').toUpperCase())} autoCapitalize="characters" autoCorrect={false} maxLength={8} placeholder="ABCDEFGH" textContentType="oneTimeCode" style={[inputStyle, { fontSize: 24, letterSpacing: 4 }]} />
      <TouchableOpacity accessibilityRole="button" disabled={busy || code.length !== 8} style={[button, (busy || code.length !== 8) && { opacity: 0.5 }]} onPress={verify}><Text style={{ color: 'white', fontSize: 17, fontWeight: '700' }}>{busy ? 'Checking…' : 'Confirm code and enter'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy || waiting > 0} onPress={send} style={{ paddingVertical: 16 }}><Text style={{ color: '#147D78', fontSize: 16 }}>{waiting ? `Resend in ${waiting}s` : 'Send a new code'}</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => { setChallenge(null); setCode(''); setMessage(''); }} style={{ paddingVertical: 14 }}><Text style={{ color: '#147D78', fontSize: 16 }}>Change phone or email</Text></TouchableOpacity>
    </>}
    {!!message && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ fontSize: 16, lineHeight: 24, marginTop: 12 }}>{message}</Text>}
  </View>;
}
