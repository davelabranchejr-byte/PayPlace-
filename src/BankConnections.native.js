import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { createPlaidLinkSession } from 'react-native-plaid-link-sdk';
import { Text, TextInput } from './Privacy';
import Alert from './alert';
import { createNativeBankApi } from './native-banking-api.mjs';
import { bankSessionStore } from './bank-session.native';

export const isBankOAuthReturn = () => false;
const api = createNativeBankApi({ sessionStore: bankSessionStore });
const amount = (value, currency) => value == null ? 'Not reported' : new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(value);
function Button({ title, onPress, disabled }) { return <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[s.button, disabled && { opacity: 0.5 }]}><Text style={s.buttonText}>{title}</Text></TouchableOpacity>; }

export default function BankConnections({ visible, onClose }) {
  const [enabled, setEnabled] = useState(false), [signedIn, setSignedIn] = useState(false), [status, setStatus] = useState(null);
  const [email, setEmail] = useState(''), [code, setCode] = useState(''), [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [linkOpen, setLinkOpen] = useState(false);
  const pending = useRef(false), active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function loadBanks() {
    try { const result = await api('banking/status'); if (active.current) { setStatus(result); setSignedIn(true); } }
    catch (e) { if (e.code === 'SIGN_IN_REQUIRED' && active.current) { setSignedIn(false); setStatus(null); } throw e; }
  }
  async function action(run) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await run(); } catch (e) { if (active.current) { setError(e.message); if (e.code === 'SIGN_IN_REQUIRED') { setSignedIn(false); setStatus(null); } } }
    finally { pending.current = false; if (active.current) setBusy(false); }
  }
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    action(async () => {
      const readiness = await api('banking-auth/status', { authenticated: false });
      if (cancelled) return;
      setEnabled(readiness.sandboxEnabled === true);
      if (readiness.sandboxEnabled && await bankSessionStore.read()) await loadBanks();
    });
    return () => { cancelled = true; };
  }, [visible]);
  async function requestCode() {
    await action(async () => {
      const result = await api('banking-auth/request-code', { method: 'POST', authenticated: false,
        data: { channel: 'email', contact: email.trim(), name: 'Neighbor', goal: 'Try PayPlace bank linking with test accounts', annieLetters: false } });
      setChallenge({ ...result, contact: email.trim() }); setCode(''); setNotice('Check your email for Annie’s eight-character code.');
    });
  }
  async function verify() {
    await action(async () => {
      if (!challenge || challenge.expiresAt <= Date.now()) throw new Error('Your code expired. Request a new code.');
      const result = await api('banking-auth/verify', { method: 'POST', authenticated: false, data: { challengeId: challenge.challengeId, code } });
      if (!/^[a-f0-9]{64}$/.test(result.sessionToken || '') || result.expiresAt <= Date.now()) throw new Error('Bank sign-in could not be completed. Request a new code.');
      await bankSessionStore.write(result.sessionToken, result.expiresAt);
      setChallenge(null); setCode(''); await loadBanks(); setNotice('Verified. You can now connect a Sandbox test bank.');
    });
  }
  async function connect(connectionId) {
    await action(async () => {
      setNotice('');
      const link = await api('banking/link-token', { method: 'POST', data: { platform: Platform.OS, ...(connectionId ? { connection_id: connectionId } : {}) } });
      await new Promise(async (resolve, reject) => {
        try {
          const session = await createPlaidLinkSession({ token: link.link_token,
            onSuccess: async success => {
              try {
                if (!link.update && !success.publicToken) throw new Error('The bank connection was not completed.');
                await api('banking/exchange', { method: 'POST', data: { session_id: link.session_id, ...(success.publicToken ? { public_token: success.publicToken } : {}) } });
                await loadBanks(); if (active.current) setNotice(link.update ? 'Your test bank is reconnected.' : 'Your test bank is connected.'); resolve();
              } catch (e) { reject(e); }
              finally { if (active.current) setLinkOpen(false); }
            },
            onExit: exit => { if (active.current) setLinkOpen(false); if (exit.error) reject(new Error('The test bank connection was not completed. Please try again.')); else resolve(); },
            onEvent: () => {},
          });
          if (active.current) setLinkOpen(true);
          await session.open(true);
        } catch (e) { if (active.current) setLinkOpen(false); reject(e); }
      });
    });
  }
  function disconnect(bank) {
    Alert.alert('Disconnect test bank?', `Remove PayPlace’s access to ${bank.institution}? Your personal plan stays saved.`, [
      { text: 'Keep connected', style: 'cancel' }, { text: 'Disconnect', style: 'destructive', onPress: () => action(async () => {
        await api(`banking/connections/${bank.id}`, { method: 'DELETE', data: {} }); await loadBanks(); setNotice('Test bank disconnected.');
      }) },
    ]);
  }
  async function signOut() {
    await action(async () => {
      await api('banking-auth/logout', { method: 'POST', data: {} }); await bankSessionStore.clear();
      setSignedIn(false); setStatus(null); setNotice('Signed out. Connected test banks remain on the server; signing out does not disconnect them.');
    });
  }
  return <Modal visible={visible} animationType="slide" onRequestClose={() => { if (!busy) onClose(); }}>
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Button title="Back to neighborhood" onPress={onClose} disabled={busy}/>
      <Text style={s.title}>Bank connections</Text>
      <View style={s.banner}><Text style={s.heading}>Sandbox · Owner testing</Text><Text style={s.body}>Fictional test accounts only. No real banks, payments or credit scores are connected. Test balances never change your personal plan.</Text></View>
      {busy && <ActivityIndicator color="#6754C5"/>}
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      {notice ? <Text accessibilityLiveRegion="polite" style={s.body}>{notice}</Text> : null}
      {!enabled && !busy ? <Text style={s.body}>Bank testing is not enabled yet. Manual entry remains available.</Text> : null}
      {enabled && !signedIn && <View style={s.section}>
        <Text style={s.heading}>Verify your email for bank testing</Text>
        <Text style={s.body}>Only the owner’s approved test email can use this Sandbox build. Your local app unlock does not sign you into banking.</Text>
        <TextInput accessibilityLabel="Bank test email" autoCapitalize="none" keyboardType="email-address" value={email} editable={!busy && !challenge} onChangeText={setEmail} style={s.input}/>
        <Button title={challenge ? 'Send a new code' : 'Email my verification code'} onPress={requestCode} disabled={busy || !email.trim()}/>
        {challenge && <><TextInput accessibilityLabel="Bank verification code" autoCapitalize="characters" autoCorrect={false} value={code} onChangeText={setCode} editable={!busy} style={s.input}/><Button title="Verify and open bank testing" onPress={verify} disabled={busy || code.replace(/[\s-]/g, '').length !== 8}/><Button title="Use another email" disabled={busy} onPress={() => { setChallenge(null); setCode(''); }}/></>}
      </View>}
      {signedIn && <>
        {(status?.connections || []).map(bank => <View style={s.bank} key={bank.id}>
          <Text style={s.heading}>{bank.institution}</Text>
          {bank.error && <Text style={s.error}>{bank.error.message}</Text>}
          {bank.error?.code === 'RECONNECT_REQUIRED' && <Button title="Reconnect test bank" onPress={() => connect(bank.id)} disabled={busy}/>}
          {bank.accounts.map(account => <View style={s.account} key={account.id}>
            <Text style={s.heading}>{account.name}{account.mask ? ` · •••• ${account.mask}` : ''}</Text>
            <Text style={s.body}>Reported {account.available != null ? 'available' : 'current'} test balance: {amount(account.available ?? account.current, account.currency)}</Text>
            <Text style={s.body}>Current: {amount(account.current, account.currency)}</Text>
          </View>)}
          {bank.checkedAt && <Text style={s.note}>Checked {new Date(bank.checkedAt).toLocaleString()}. Reported balances may lag.</Text>}
          <Button title="Disconnect test bank" onPress={() => disconnect(bank)} disabled={busy}/>
        </View>)}
        {status?.configured === false && <Text style={s.body}>The bank service is still being configured.</Text>}
        <Button title={status?.connections?.length ? 'Connect another test bank' : 'Connect a Sandbox test bank'} onPress={() => connect()} disabled={busy || !status?.configured || linkOpen}/>
        <Button title="Refresh reported accounts" onPress={() => action(loadBanks)} disabled={busy}/>
        <Button title="Sign out of bank testing" onPress={signOut} disabled={busy}/>
      </>}
    </ScrollView>
  </Modal>;
}
const s = StyleSheet.create({ page: { padding: 20, paddingTop: 60, paddingBottom: 60, gap: 16, backgroundColor: '#F6FBFF' }, title: { fontSize: 26, fontWeight: '900', color: '#0B1F40' }, heading: { fontSize: 17, fontWeight: '800', color: '#0B1F40' }, body: { fontSize: 15, lineHeight: 22, color: '#34465E' }, note: { fontSize: 13, lineHeight: 20, color: '#43546B' }, banner: { padding: 16, borderRadius: 16, backgroundColor: '#FFE34F', gap: 8 }, section: { gap: 12 }, bank: { borderRadius: 16, padding: 16, backgroundColor: '#DFFCF7', gap: 12 }, account: { borderTopWidth: 1, borderTopColor: '#AADDD7', paddingTop: 12, gap: 6 }, input: { borderWidth: 1, borderColor: '#BACBD8', padding: 12, borderRadius: 12, backgroundColor: 'white', fontSize: 17 }, button: { backgroundColor: '#7842D2', padding: 14, borderRadius: 14, minHeight: 48 }, buttonText: { color: 'white', fontWeight: '800', fontSize: 15 }, error: { color: '#8B2635', fontSize: 15, lineHeight: 22 } });
