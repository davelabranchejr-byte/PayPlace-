import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { MascotTouchable as TouchableOpacity } from './MascotTouchable';
import { Text, TextInput } from './Privacy';
import { createEmailApi } from './email-api.mjs';
import { SUPPORT_EMAIL } from './PrivacyLinks';
import OwnerInbox from './OwnerInbox';

const submitMessage = createEmailApi(Platform.OS, undefined, 'daddy');

export default function DaddyMail({ onClose }) {
  const [owner, setOwner] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const draft = useRef(null);
  const editing = useRef(true);
  function close() {
    if (pending.current) return;
    if (owner) setOwner(false);
    else onClose();
  }

  async function send() {
    if (pending.current || !email.trim() || !message.trim()) return;
    pending.current = true;
    setBusy(true);
    setStatus('');
    if (editing.current) {
      draft.current = { id: randomUUID(), email, message };
      editing.current = false;
    }
    try {
      const receipt = await submitMessage('messages', draft.current);
      if (receipt.accepted !== true) throw new Error('PayPlace could not confirm delivery. Please try again.');
      setMessage('');
      editing.current = true;
      setStatus('Your message is in Daddy’s inbox.');
    } catch (error) { setStatus(error.message); }
    finally { pending.current = false; setBusy(false); }
  }

  return <Modal visible animationType="slide" onRequestClose={close}>
    <SafeAreaView style={[s.safe, owner && s.owner]}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={owner ? 'Back to Daddy’s laptop' : 'Close Daddy’s laptop'}
        onPress={close} disabled={busy} style={[s.back, owner && s.ownerBack]}><Text>‹ {owner ? 'Daddy’s laptop' : 'Daddy’s House'}</Text></TouchableOpacity>
      {owner ? <OwnerInbox daddy /> :
        <KeyboardAvoidingView style={s.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
            <Text accessibilityRole="header" style={s.title}>Write to Daddy</Text>
            <Text style={s.text}>Your message goes to Daddy’s private inbox. If he replies, it goes to the email you enter here.</Text>
            <Text style={s.label}>Reply email</Text>
            <TextInput accessibilityLabel="Reply email" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
              value={email} editable={!busy} maxLength={254} style={s.input}
              onChangeText={value => { editing.current = true; setEmail(value); }} />
            <Text style={s.label}>Message</Text>
            <TextInput accessibilityLabel="Message for Daddy" multiline editable={!busy} maxLength={2000} value={message}
              style={[s.input, s.message]} onChangeText={value => { editing.current = true; setMessage(value); }} />
            <Text style={s.text}>Leave out passwords, account numbers and financial details.</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Send a message to Daddy" disabled={busy || !email.trim() || !message.trim()}
              onPress={send} style={s.send}><Text>{busy ? 'Sending…' : 'Send to Daddy'}</Text></TouchableOpacity>
            {!!status && <Text accessibilityLiveRegion="polite" style={s.text}>{status}</Text>}
            <View style={s.links}>
              <TouchableOpacity accessibilityRole="link" accessibilityLabel="Open an email draft instead" disabled={busy}
                onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Hello Daddy — PayPlace')}`).catch(() => setStatus(`Your email app couldn’t open. Write to ${SUPPORT_EMAIL}.`))}
                style={s.back}><Text>Use my email app</Text></TouchableOpacity>
              {Platform.OS !== 'web' && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Daddy’s owner inbox" disabled={busy}
                onPress={() => setOwner(true)} style={s.back}><Text>Owner sign-in</Text></TouchableOpacity>}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>}
    </SafeAreaView>
  </Modal>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F2' },
  owner: { backgroundColor: '#251533' },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, margin: 8 },
  ownerBack: { backgroundColor: '#DCABFF' },
  content: { padding: 16, paddingBottom: 36, gap: 10, width: '100%', maxWidth: 650, alignSelf: 'center' },
  title: { color: '#173557', fontSize: 28, fontWeight: '900' },
  label: { color: '#173557', fontSize: 16, fontWeight: '800' },
  text: { color: '#34465E', fontSize: 16, lineHeight: 23 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#937BB7', borderRadius: 14, padding: 12, minHeight: 48, fontSize: 17, color: '#173557' },
  message: { minHeight: 128, textAlignVertical: 'top' },
  send: { minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#65EBEF', borderColor: '#00AABF' },
  links: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
