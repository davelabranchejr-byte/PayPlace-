import React, { useEffect, useRef, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from './Privacy';
import Alert from './alert';
import { createEmailApi } from './email-api.mjs';
import { completeDataDeletion } from './privacy-deletion.mjs';
const api = createEmailApi(Platform.OS, fetch, 'privacy');

export default function DataDeletion({ profile, onDeleteDevice, authorize, styles: s, demo = false, onBusyChange = () => {} }) {
  const [email, setEmail] = useState(profile?.email || (profile?.contactChannel === 'email' ? profile.contact : '') || '');
  const [challenge, setChallenge] = useState(null), [code, setCode] = useState('');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [serverDeleted, setServerDeleted] = useState(false);
  const [clock, setClock] = useState(Date.now()), [resendAt, setResendAt] = useState(0);
  const pending = useRef(false);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function run(action) {
    if (pending.current) return;
    pending.current = true; setBusy(true); onBusyChange(true); setMessage('');
    try { await action(); } catch (error) { setMessage(error.message); if (error.serverDeleted) setServerDeleted(true); }
    finally { pending.current = false; setBusy(false); onBusyChange(false); }
  }
  async function send() {
    await run(async () => {
      if (!(await authorize('Request PayPlace data deletion'))) return;
      const result = await api('request-code', { email: email.trim() });
      setChallenge(result); setCode(''); setResendAt(Date.now() + result.resendAfter * 1000);
      setMessage('Check your email for the deletion code. No data has been deleted yet.');
    });
  }
  function confirm(all) {
    Alert.alert(all ? 'Delete your PayPlace account and data?' : 'Delete this device’s data only?',
      all ? 'This permanently removes service records for the confirmed email, applicable bank connections, and this device’s saved plan. Your exported backups and mailbox copies remain.' : 'This clears the saved plan and profile on this device. Server contact records and bank connections remain. Use email-confirmed deletion to remove those too.',
      [{ text: 'Keep my data', style: 'cancel' }, { text: all ? 'Delete account & data' : 'Delete device data', style: 'destructive', onPress: () => run(async () => {
        if (!(await authorize('Confirm PayPlace data deletion'))) return;
        if (all) await completeDataDeletion({ api, challenge, code, deleteDevice: onDeleteDevice, serverDeleted });
        else await onDeleteDevice();
        setServerDeleted(false); setChallenge(null); setCode(''); setEmail('');
        Alert.alert('Deletion complete', all ? 'PayPlace service records for this email and this device’s saved data were removed.' : 'This device’s saved plan and profile were removed. Server records were not changed.');
      }) }]);
  }
  const wait = Math.max(0, Math.ceil((resendAt - clock) / 1000));
  return <View style={s.card}>
    <Text style={s.heading}>Delete account & data</Text>
    {demo ? <Text style={s.body}>Return to your personal plan before deleting personal data. Bobbie’s public demo is not a real account.</Text> : <>
      <Text style={s.body}>You control your place here. Confirm your email to remove PayPlace’s service records for that address, applicable bank connections, and the plan saved on this device. Different email addresses need separate confirmations.</Text>
      <Text style={s.body}>Exported backups, mailbox copies and provider operational records are handled separately as explained in the Privacy Policy. Deleting PayPlace data does not cancel an Apple subscription or delete your Apple or ChatGPT account.</Text>
      {!serverDeleted && <>
        <Text style={s.label}>PayPlace email address</Text>
        <TextInput accessibilityLabel="Email for data deletion" value={email} editable={!busy && !challenge} onChangeText={setEmail} autoCorrect={false} autoCapitalize="none" keyboardType="email-address" style={s.input}/>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Send deletion code" disabled={busy || !email.trim() || wait > 0} onPress={send} style={s.outline}><Text style={s.link}>{wait ? `Send a new code in ${wait}s` : challenge ? 'Send a new deletion code' : 'Email my deletion code'}</Text></TouchableOpacity>
        {challenge && <>
          <TextInput accessibilityLabel="Eight-character deletion code" value={code} editable={!busy} onChangeText={value => setCode(value.replace(/[^a-zA-Z2-9]/g, '').toUpperCase())} maxLength={8} autoCorrect={false} autoCapitalize="characters" textContentType="oneTimeCode" style={s.input}/>
          <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={() => { setChallenge(null); setCode(''); setMessage(''); }} style={s.outline}><Text style={s.link}>Use another email</Text></TouchableOpacity>
        </>}
      </>}
      {(challenge || serverDeleted) && <TouchableOpacity accessibilityRole="button" accessibilityLabel={serverDeleted ? 'Retry device cleanup' : 'Confirm delete account and data'} disabled={busy || !serverDeleted && code.length !== 8} onPress={() => confirm(true)} style={[s.button, { backgroundColor: '#A42B49', opacity: busy ? 0.5 : 1 }]}><Text style={s.buttonText}>{serverDeleted ? 'Retry device cleanup' : 'Delete account & data'}</Text></TouchableOpacity>}
      {!serverDeleted && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Delete this device data only" disabled={busy} onPress={() => confirm(false)} style={s.outline}><Text style={s.link}>Delete this device’s data only</Text></TouchableOpacity>}
      {!!message && <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>}
    </>}
  </View>;
}
