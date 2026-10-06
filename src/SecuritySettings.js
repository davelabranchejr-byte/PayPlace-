import React, { useEffect, useState } from 'react';
import { AppState, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import Alert from './alert';
import { useAppSecurity } from './AppSecurity';
import { createBackup, restoreBackup } from './security-crypto.mjs';
import { pickBackupFile, saveBackupFile } from './backup-files';

export default function SecuritySettings({ visible, onClose, finance, profile, onRestore, recovery = false }) {
  const security = useAppSecurity();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!visible) { setPassword(''); setConfirmation(''); setMessage(''); }
  }, [visible]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => { if (state === 'background') { setPassword(''); setConfirmation(''); } });
    return () => sub.remove();
  }, []);
  async function authorize(prompt) { return !security.native || !security.available && !security.enabled || await security.authenticate(prompt); }
  async function exportFile() {
    if (password.length < 12 || password !== confirmation) { setMessage('Use at least 12 characters and enter the same password twice.'); return; }
    if (!(await authorize('Create a PayPlace backup'))) return;
    setBusy(true); setMessage('Encrypting your backup…');
    const backupPassword = password; setPassword(''); setConfirmation('');
    try {
      const text = await createBackup(finance, profile, backupPassword, Crypto.getRandomBytes);
      await saveBackupFile(text);
      setMessage('Backup prepared. Keep the file and its password safe; PayPlace cannot recover a forgotten backup password.');
    } catch { setMessage('Could not create the backup. Your saved plan has not changed.'); }
    finally { setBusy(false); }
  }
  async function importFile() {
    if (!password) { setMessage('Enter the password for your backup first.'); return; }
    if (!(await authorize('Restore your PayPlace backup'))) return;
    setBusy(true); setMessage('');
    const backupPassword = password; setPassword(''); setConfirmation('');
    try {
      const text = await pickBackupFile();
      if (!text) return;
      setMessage('Opening your backup…');
      const data = await restoreBackup(text, backupPassword);
      setMessage('Backup opened. Confirm whether to replace this device’s plan.');
      Alert.alert('Replace this device’s plan?', 'Restoring replaces the saved budget and onboarding profile. You will verify your email again. Save a backup of your current plan first if you want to keep it.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Replace and restore', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            if (!(await authorize('Confirm PayPlace restore'))) return;
            await onRestore(data); setMessage('Backup restored.'); onClose();
          } catch { setMessage('Could not save the restored plan. Try again.'); }
          finally { setBusy(false); }
        } },
      ]);
    } catch { setMessage('Could not open this backup. Check its password and file. Your saved plan has not changed.'); }
    finally { setBusy(false); }
  }
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={() => !busy && onClose()}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close security settings" disabled={busy} onPress={onClose}><Ionicons name="close-circle-outline" size={34} color="#0B1F40" /></TouchableOpacity>
          <Text style={s.title}>Security & backup</Text>
          <Text style={s.body}>Your money. Your place. Your control.</Text>
          {!recovery && <View style={s.card}>
            <Text style={s.heading}>App lock</Text>
            <Text style={s.body}>{security.native ? 'Use your phone’s biometrics or device passcode. Lock on launch, after 30 seconds away, or after five minutes without activity.' : 'The browser version has no device authentication lock. Use the iPhone or Android app for this protection.'}</Text>
            {security.native && <>
              <Text style={s.body}>{security.enabled ? 'App lock is on.' : security.available ? 'App lock is off.' : 'Set a device passcode in your phone’s settings to enable app lock.'}</Text>
              <TouchableOpacity accessibilityRole="button" disabled={busy || security.busy || !security.available} style={s.button} onPress={async () => {
                try { await security.setAppLock(!security.enabled); } catch (e) { setMessage(e.message); }
              }}><Text style={s.buttonText}>{security.enabled ? 'Turn off app lock' : 'Enable app lock'}</Text></TouchableOpacity>
              {security.enabled && <TouchableOpacity accessibilityRole="button" disabled={busy} style={s.outline} onPress={() => { onClose(); security.lock(); }}><Text style={s.link}>Lock now</Text></TouchableOpacity>}
            </>}
          </View>}
          <View style={s.card}>
            <Text style={s.heading}>{recovery ? 'Recover your plan' : 'Encrypted backup'}</Text>
            <Text style={s.body}>Save a password-protected file to Files or another location you choose. Restore it on a new device. This includes your budget and profile; email verification and letter consent must be completed again.</Text>
            <Text style={s.body}>You need both the file and its password. PayPlace cannot reset that password or remotely recover your local entries.</Text>
            <Text style={s.label}>Backup password</Text>
            <TextInput accessibilityLabel="Backup password" editable={!busy} style={s.input} secureTextEntry autoCorrect={false} autoCapitalize="none" value={password} onChangeText={v => { security.touch(); setPassword(v); }} placeholder="At least 12 characters for a new backup" />
            {!recovery && <><Text style={s.label}>Confirm new backup password</Text><TextInput accessibilityLabel="Confirm backup password" editable={!busy} style={s.input} secureTextEntry autoCorrect={false} autoCapitalize="none" value={confirmation} onChangeText={v => { security.touch(); setConfirmation(v); }} placeholder="Enter it again to create a backup" />
              <TouchableOpacity accessibilityRole="button" disabled={busy} style={s.button} onPress={exportFile}><Text style={s.buttonText}>{busy ? 'Working…' : 'Create encrypted backup'}</Text></TouchableOpacity></>}
            <TouchableOpacity accessibilityRole="button" disabled={busy} style={s.outline} onPress={importFile}><Text style={s.link}>Restore from backup</Text></TouchableOpacity>
          </View>
          <View style={s.card}><Text style={s.heading}>Protected local storage</Text><Text style={s.body}>{Platform.OS === 'web' ? 'Your browser encrypts saved entries, but this does not protect them from scripts with access to this website. Browser storage clearing can remove the encryption key.' : 'Your budget and onboarding profile are encrypted on this device. The encryption key uses your phone’s protected storage and does not transfer automatically to another phone.'}</Text><Text style={s.body}>This app lock does not establish a cloud account or authorize bank payments.</Text></View>
          {!!message && <Text accessibilityLiveRegion="polite" style={s.message}>{message}</Text>}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5FBFF' }, content: { padding: 22, paddingBottom: 50 },
  title: { fontSize: 29, fontWeight: '800', color: '#0B1F40', marginTop: 15 }, heading: { fontSize: 20, fontWeight: '800', color: '#0B1F40' },
  body: { fontSize: 16, lineHeight: 24, color: '#52647A', marginVertical: 10 }, card: { backgroundColor: 'white', borderRadius: 24, padding: 20, marginVertical: 10, borderColor: '#DDE9F5', borderWidth: 1 },
  label: { color: '#0B1F40', fontWeight: '700', marginVertical: 10 }, input: { borderColor: '#C9DAEC', borderWidth: 1, borderRadius: 16, padding: 15, fontSize: 16, color: '#0B1F40' },
  button: { padding: 17, borderRadius: 22, backgroundColor: '#6650E9', marginTop: 16 }, buttonText: { color: 'white', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  outline: { padding: 17, borderRadius: 22, borderColor: '#6650E9', borderWidth: 1, marginTop: 16 }, link: { color: '#6650E9', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  message: { color: '#0B1F40', fontSize: 16, lineHeight: 24, marginTop: 10 },
});
